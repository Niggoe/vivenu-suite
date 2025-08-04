import axios from 'axios'
import { getCurrentConfig } from './apiConfig'
import { uidToId, isValidChipUid } from '../utils/chipUtils'

const DEBUG_API_CALLS = import.meta.env.VITE_DEBUG_API_CALLS === 'true'

// Axios Instance für Vivenu API (wird dynamisch konfiguriert)
const createVivenuApi = () => {
    const config = getCurrentConfig()

    const instance = axios.create({
        baseURL: config.apiUrl,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': config.apiKey ? `Bearer ${config.apiKey}` : '',
            'X-API-Version': '1.0',
            'User-Agent': 'Vivenu-Suite/1.0.0',
            // Header für nginx-Proxy um zwischen dev/live zu unterscheiden
            'X-Vivenu-Env': config.name.toLowerCase().includes('live') ? 'live' : 'dev'
        },
        timeout: 30000, // 30 Sekunden Timeout
    })

    // Request Interceptor für Logging und API Key Validierung
    instance.interceptors.request.use(
        (requestConfig) => {
            const currentConfig = getCurrentConfig()

            // API Key Validierung
            if (!currentConfig.apiKey && !currentConfig.name.includes('Mock')) {
                console.warn('⚠️ Kein Vivenu API Key konfiguriert! Setzen Sie den API-Key in der .env Datei.')
            }

            if (DEBUG_API_CALLS || import.meta.env.DEV) {
                console.log('🚀 Vivenu API Request:', {
                    method: requestConfig.method?.toUpperCase(),
                    url: `${requestConfig.baseURL}${requestConfig.url}`,
                    headers: {
                        ...requestConfig.headers,
                        Authorization: requestConfig.headers?.Authorization ? '[REDACTED]' : 'Not set'
                    },
                    data: requestConfig.data,
                })
            }
            return requestConfig
        },
        (error) => {
            console.error('❌ API Request Error:', error)
            return Promise.reject(error)
        }
    )

    // Response Interceptor für Logging und Fehlerbehandlung
    instance.interceptors.response.use(
        (response) => {
            if (DEBUG_API_CALLS || import.meta.env.DEV) {
                console.log('✅ Vivenu API Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.config.url,
                    data: response.data,
                })
            }
            return response
        },
        (error) => {
            console.error('❌ Vivenu API Response Error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                message: error.response?.data?.message || error.message,
                url: error.config?.url,
                data: error.response?.data,
            })
            return Promise.reject(error)
        }
    )

    return instance
}

// Interface für API Responses
export interface VivenuApiResponse {
    success: boolean
    message: string
    data?: any
    error?: string
    timestamp?: string
}

// Interface für Vivenu API Error Response
export interface VivenuApiError {
    error: string
    message: string
    code?: string
    details?: any
}

// Interface für Ticket Barcode Update Request
export interface TicketBarcodeUpdateRequest {
    ticketId: string
    chipUid: string
    newBarcode?: string
    updateReason?: string
    metadata?: {
        userAgent: string
        timestamp: string
        source: string
    }
}

// Interface für Ticket Barcode Update Response
export interface TicketBarcodeUpdateResponse {
    ticketId: string
    oldBarcode?: string
    newBarcode: string
    chipUid: string
    status: 'success' | 'failed' | 'pending'
    timestamp: string
    transactionId?: string
}export class VivenuApiService {
    /**
     * Aktualisiert den Barcode eines Tickets mit der gegebenen Chip UID
     * @param ticketId - Die ID des Tickets
     * @param chipUid - Die UID des Chips (HEX)
     * @returns Promise mit dem API Response
     */
    static async updateTicketBarcode(
        ticketId: string,
        chipUid: string
    ): Promise<VivenuApiResponse> {
        console.log('🚀 === VIVENU API SERVICE START ===')
        console.log(`📋 Input - Ticket ID: ${ticketId}`)
        console.log(`📋 Input - Chip UID: ${chipUid}`)

        try {
            // Aktuelle Konfiguration laden
            const config = getCurrentConfig()
            const vivenuApi = createVivenuApi()

            // Validierung der Eingaben
            if (!ticketId || !chipUid) {
                console.error('❌ Validierung fehlgeschlagen: Fehlende Parameter')
                throw new Error('Ticket ID und Chip UID sind erforderlich')
            }

            // Chip UID Validierung mit der spezialisierten Funktion
            console.log('🔍 Validiere Chip UID...')
            if (!isValidChipUid(chipUid)) {
                console.error('❌ Chip UID Validierung fehlgeschlagen:', chipUid)
                throw new Error('Chip UID muss ein gültiger 8-stelliger HEX-Code sein (z.B. c43f3632)')
            }
            console.log('✅ Chip UID ist gültig')

            // UID zu ID konvertieren (wie im Python-Skript)
            console.log('🔄 Starte UID-Konvertierung...')
            const convertedBarcode = uidToId(chipUid)
            console.log(`🔄 UID-Konvertierung: ${chipUid} → ${convertedBarcode}`)

            // API-Konfiguration anzeigen
            console.log('⚙️ API-Konfiguration:', {
                apiUrl: config.apiUrl,
                hasApiKey: !!config.apiKey,
                configName: config.name,
                ticketsEndpoint: config.ticketsEndpoint
            })

            // Mock-Implementation für Development (wenn kein API Key vorhanden)
            if (!config.apiKey && import.meta.env.DEV) {
                console.warn('⚠️ Mock-Modus aktiv. Verwende echten API-Key für Live-Calls.')
                console.log('🎭 Simuliere API-Aufruf...')

                // Simuliere API-Delay
                await new Promise(resolve => setTimeout(resolve, 1500))

                // Simuliere gelegentliche Fehler (20% Chance)
                if (Math.random() < 0.2) {
                    console.error('❌ Mock-Fehler simuliert')
                    throw new Error('Mock-Fehler: Ticket nicht gefunden oder bereits verarbeitet')
                }

                const mockResult = {
                    success: true,
                    message: `Barcode erfolgreich aktualisiert (Mock) - UID ${chipUid} → ${convertedBarcode}`,
                    data: {
                        ticketId,
                        oldBarcode: 'OLD_BARCODE_MOCK',
                        newBarcode: convertedBarcode,
                        chipUid: chipUid.toUpperCase(),
                        timestamp: new Date().toISOString(),
                        mockMode: true,
                        conversionDetails: {
                            originalUid: chipUid,
                            convertedId: convertedBarcode,
                            algorithm: 'uid_to_id (byte-reverse + prefix)'
                        }
                    }
                }

                console.log('✅ Mock-Erfolg:', mockResult)
                console.log('🏁 === VIVENU API SERVICE END (MOCK) ===')
                return mockResult
            }

            const payload = {
                barcode: convertedBarcode,
                skipBarcodeValidation: true // Entspricht "skipBarcodeValidation" : "true" aus Python
            }

            console.log(`📤 API Payload:`, { ticketId, payload })
            console.log(`🌐 API URL: ${window.location.origin}${config.apiUrl}/tickets/${ticketId}`)

            // API-Aufruf an Vivenu (direkter PUT auf /tickets/{ticketId})
            console.log('📡 Sende Request an Vivenu API...')
            const response = await vivenuApi.put(`/tickets/${ticketId}`, payload)
            console.log('✅ API Response erhalten:', response.data)

            const result = {
                success: true,
                message: `Barcode erfolgreich aktualisiert - UID ${chipUid} → ${convertedBarcode}`,
                data: {
                    ticketId,
                    newBarcode: convertedBarcode,
                    chipUid: chipUid.toUpperCase(),
                    timestamp: new Date().toISOString(),
                    apiResponse: response.data,
                    conversionDetails: {
                        originalUid: chipUid,
                        convertedId: convertedBarcode,
                        algorithm: 'uid_to_id (byte-reverse + prefix)'
                    }
                },
                timestamp: new Date().toISOString()
            }

            console.log('✅ Finales Ergebnis:', result)
            console.log('🏁 === VIVENU API SERVICE END (SUCCESS) ===')
            return result
        } catch (error) {
            console.error('💥 === VIVENU API SERVICE ERROR ===')
            console.error('❌ Fehler Details:', error)

            // Fehlerbehandlung
            let errorMessage = 'Unbekannter Fehler beim Aktualisieren des Barcodes'

            if (axios.isAxiosError(error)) {
                const status = error.response?.status
                console.error('🌐 HTTP Fehler:', {
                    status: status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    url: error.config?.url
                })

                if (status === 404) {
                    errorMessage = 'Ticket nicht gefunden'
                } else if (status === 401) {
                    errorMessage = 'Authentifizierung fehlgeschlagen - Überprüfen Sie den API-Key'
                } else if (status === 400) {
                    errorMessage = error.response?.data?.message || 'Ungültige Anfrage'
                } else if (status && status >= 500) {
                    errorMessage = 'Server-Fehler - Versuchen Sie es später erneut'
                } else {
                    errorMessage = error.response?.data?.message || error.message
                }
            } else if (error instanceof Error) {
                console.error('🐛 JavaScript Fehler:', error.message)
                errorMessage = error.message
            }

            console.error('❌ Finale Fehlermeldung:', errorMessage)
            console.error('🏁 === VIVENU API SERVICE END (ERROR) ===')
            throw new Error(errorMessage)
        }
    }

    /**
     * Aktualisiert den Barcode eines Tickets direkt mit dem gewünschten Barcode
     * (für CSV-Batch-Upload, ohne UID-Konvertierung)
     * @param ticketId - Die ID des Tickets
     * @param targetBarcode - Der gewünschte Barcode (direkt)
     * @returns Promise mit dem API Response
     */
    static async updateTicketBarcodeDirectly(
        ticketId: string,
        targetBarcode: string
    ): Promise<VivenuApiResponse> {
        console.log('🚀 === VIVENU API SERVICE START (DIRECT BARCODE) ===')
        console.log(`📋 Input - Ticket ID: ${ticketId}`)
        console.log(`📋 Input - Target Barcode: ${targetBarcode}`)

        try {
            // Aktuelle Konfiguration laden
            const config = getCurrentConfig()
            const vivenuApi = createVivenuApi()

            // Validierung der Eingaben
            if (!ticketId || !targetBarcode) {
                console.error('❌ Validierung fehlgeschlagen: Fehlende Parameter')
                throw new Error('Ticket ID und Ziel-Barcode sind erforderlich')
            }

            // Barcode-Validierung (sollte nicht leer sein)
            if (targetBarcode.length === 0) {
                console.error('❌ Barcode-Validierung fehlgeschlagen: Leerer Barcode')
                throw new Error('Barcode darf nicht leer sein')
            }

            console.log('✅ Parameter sind gültig')

            // API-Konfiguration anzeigen
            console.log('⚙️ API-Konfiguration:', {
                apiUrl: config.apiUrl,
                hasApiKey: !!config.apiKey,
                configName: config.name
            })

            // Mock-Implementation für Development (wenn kein API Key vorhanden)
            if (!config.apiKey && import.meta.env.DEV) {
                console.warn('⚠️ Mock-Modus aktiv. Verwende echten API-Key für Live-Calls.')
                console.log('🎭 Simuliere API-Aufruf...')

                // Simuliere API-Delay
                await new Promise(resolve => setTimeout(resolve, 500))

                // Simuliere gelegentliche Fehler (10% Chance für CSV-Batch)
                if (Math.random() < 0.1) {
                    console.error('❌ Mock-Fehler simuliert')
                    throw new Error('Mock-Fehler: Ticket nicht gefunden oder bereits verarbeitet')
                }

                const mockResult = {
                    success: true,
                    message: `Barcode erfolgreich aktualisiert (Mock) - auf "${targetBarcode}" gesetzt`,
                    data: {
                        ticketId,
                        oldBarcode: 'OLD_BARCODE_MOCK',
                        newBarcode: targetBarcode,
                        timestamp: new Date().toISOString(),
                        mockMode: true,
                        directBarcodeUpdate: true
                    }
                }

                console.log('✅ Mock-Erfolg:', mockResult)
                console.log('🏁 === VIVENU API SERVICE END (DIRECT BARCODE MOCK) ===')
                return mockResult
            }

            // Payload für die echte Vivenu API (direkter Barcode)
            const payload = {
                barcode: targetBarcode,
                skipBarcodeValidation: true
            }

            console.log(`📤 API Payload:`, { ticketId, payload })
            console.log(`🌐 API URL: ${window.location.origin}${config.apiUrl}/tickets/${ticketId}`)

            // API-Aufruf an Vivenu (direkter PUT auf /tickets/{ticketId})
            console.log('📡 Sende Request an Vivenu API...')
            const response = await vivenuApi.put(`/tickets/${ticketId}`, payload)
            console.log('✅ API Response erhalten:', response.data)

            const result = {
                success: true,
                message: `Barcode erfolgreich auf "${targetBarcode}" gesetzt`,
                data: {
                    ticketId,
                    newBarcode: targetBarcode,
                    timestamp: new Date().toISOString(),
                    apiResponse: response.data,
                    directBarcodeUpdate: true
                },
                timestamp: new Date().toISOString()
            }

            console.log('✅ Finales Ergebnis:', result)
            console.log('🏁 === VIVENU API SERVICE END (DIRECT BARCODE SUCCESS) ===')
            return result
        } catch (error) {
            console.error('💥 === VIVENU API SERVICE ERROR (DIRECT BARCODE) ===')
            console.error('❌ Fehler Details:', error)

            // Fehlerbehandlung
            let errorMessage = 'Unbekannter Fehler beim Aktualisieren des Barcodes'

            if (axios.isAxiosError(error)) {
                const status = error.response?.status
                console.error('🌐 HTTP Fehler:', {
                    status: status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    url: error.config?.url
                })

                if (status === 404) {
                    errorMessage = 'Ticket nicht gefunden'
                } else if (status === 401) {
                    errorMessage = 'Authentifizierung fehlgeschlagen - Überprüfen Sie den API-Key'
                } else if (status === 400) {
                    errorMessage = error.response?.data?.message || 'Ungültige Anfrage'
                } else if (status && status >= 500) {
                    errorMessage = 'Server-Fehler - Versuchen Sie es später erneut'
                } else {
                    errorMessage = error.response?.data?.message || error.message
                }
            } else if (error instanceof Error) {
                console.error('🐛 JavaScript Fehler:', error.message)
                errorMessage = error.message
            }

            console.error('❌ Finale Fehlermeldung:', errorMessage)
            console.error('🏁 === VIVENU API SERVICE END (DIRECT BARCODE ERROR) ===')
            throw new Error(errorMessage)
        }
    }

    /**
     * Testet die Verbindung zur Vivenu API
     * @returns Promise mit dem Verbindungsstatus
     */
    static async testConnection(): Promise<VivenuApiResponse> {
        try {
            const config = getCurrentConfig()
            const vivenuApi = createVivenuApi()

            if (!config.apiKey && import.meta.env.DEV) {
                return {
                    success: true,
                    message: 'Mock-Verbindung erfolgreich (kein API-Key konfiguriert)',
                    data: {
                        mockMode: true,
                        apiUrl: config.apiUrl,
                        hasApiKey: !!config.apiKey
                    },
                    timestamp: new Date().toISOString()
                }
            }

            // Echte API-Verbindung testen
            const response = await vivenuApi.get('/health')

            return {
                success: true,
                message: 'Verbindung zur Vivenu API erfolgreich',
                data: {
                    apiUrl: config.apiUrl,
                    status: response.data,
                    version: response.headers?.['x-api-version'] || 'unknown'
                },
                timestamp: new Date().toISOString()
            }
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? `Verbindung zur Vivenu API fehlgeschlagen: ${error.response?.status} ${error.response?.statusText}`
                : 'Verbindung zur Vivenu API fehlgeschlagen'
            throw new Error(errorMessage)
        }
    }
}

export default VivenuApiService
