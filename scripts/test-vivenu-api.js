#!/usr/bin/env node

/**
 * Vivenu API Test Script
 * 
 * Dieses Skript ermöglicht es, die Vivenu API direkt zu testen
 * ohne das Frontend zu verwenden.
 * 
 * Usage:
 *   node scripts/test-vivenu-api.js --test-connection
 *   node scripts/test-vivenu-api.js --update-barcode TICKET_ID CHIP_UID
 */

import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

// Konfiguration aus Umgebungsvariablen
const API_BASE_URL = process.env.VITE_VIVENU_API_URL || 'https://api.vivenu.com/v1'
const API_KEY = process.env.VITE_VIVENU_API_KEY || ''
const TICKETS_ENDPOINT = process.env.VITE_VIVENU_TICKETS_ENDPOINT || '/tickets'
const BARCODE_UPDATE_ENDPOINT = process.env.VITE_VIVENU_BARCODE_UPDATE_ENDPOINT || '/barcode/update'

// Axios Instance für Vivenu API
const vivenuApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY ? `Bearer ${API_KEY}` : '',
        'X-API-Version': '1.0',
        'User-Agent': 'Vivenu-Suite-CLI/1.0.0'
    },
    timeout: 30000
})

// Request/Response Logging
vivenuApi.interceptors.request.use(
    (config) => {
        console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: `${config.baseURL}${config.url}`,
            headers: {
                ...config.headers,
                Authorization: config.headers?.Authorization ? '[REDACTED]' : 'Not set'
            },
            data: config.data
        })
        return config
    }
)

vivenuApi.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data
        })
        return response
    },
    (error) => {
        console.error('❌ API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        })
        return Promise.reject(error)
    }
)

// Funktionen
async function testConnection() {
    console.log('🧪 Teste Verbindung zur Vivenu API...')
    console.log(`🔗 API URL: ${API_BASE_URL}`)
    console.log(`🔑 API Key: ${API_KEY ? 'Konfiguriert' : 'NICHT KONFIGURIERT'}`)

    if (!API_KEY) {
        console.error('❌ Kein API Key konfiguriert!')
        console.log('💡 Setzen Sie VITE_VIVENU_API_KEY in der .env Datei')
        process.exit(1)
    }

    try {
        const response = await vivenuApi.get('/health')
        console.log('✅ Verbindung erfolgreich!')
        return response.data
    } catch (error) {
        console.error('❌ Verbindung fehlgeschlagen!')
        throw error
    }
}

async function updateTicketBarcode(ticketId, chipUid) {
    console.log('🎫 Aktualisiere Ticket Barcode...')
    console.log(`📝 Ticket ID: ${ticketId}`)
    console.log(`🔧 Chip UID: ${chipUid}`)

    if (!API_KEY) {
        console.error('❌ Kein API Key konfiguriert!')
        console.log('💡 Setzen Sie VITE_VIVENU_API_KEY in der .env Datei')
        process.exit(1)
    }

    // Validierung
    if (!ticketId || !chipUid) {
        console.error('❌ Ticket ID und Chip UID sind erforderlich!')
        process.exit(1)
    }

    if (!/^[0-9A-Fa-f]+$/.test(chipUid)) {
        console.error('❌ Chip UID muss ein gültiger HEX-Code sein!')
        process.exit(1)
    }

    const payload = {
        ticketId,
        chipUid: chipUid.toUpperCase(),
        newBarcode: `BC-${chipUid.slice(-8)}`,
        updateReason: 'CLI-Update via Vivenu Suite',
        metadata: {
            userAgent: 'Vivenu-Suite-CLI/1.0.0',
            timestamp: new Date().toISOString(),
            source: 'vivenu-suite-cli'
        }
    }

    try {
        const response = await vivenuApi.post(
            `${TICKETS_ENDPOINT}/${ticketId}${BARCODE_UPDATE_ENDPOINT}`,
            payload
        )

        console.log('✅ Barcode erfolgreich aktualisiert!')
        return response.data
    } catch (error) {
        console.error('❌ Barcode-Update fehlgeschlagen!')
        throw error
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2)

    if (args.length === 0) {
        console.log(`
🎫 Vivenu API Test Script

Usage:
  node scripts/test-vivenu-api.js --test-connection
  node scripts/test-vivenu-api.js --update-barcode TICKET_ID CHIP_UID

Examples:
  node scripts/test-vivenu-api.js --test-connection
  node scripts/test-vivenu-api.js --update-barcode TCK-12345 A1B2C3D4E5F6

Environment:
  API URL: ${API_BASE_URL}
  API Key: ${API_KEY ? 'Konfiguriert ✅' : 'NICHT KONFIGURIERT ❌'}
`)
        process.exit(1)
    }

    try {
        switch (args[0]) {
            case '--test-connection':
            case '-t':
                await testConnection()
                break

            case '--update-barcode':
            case '-u':
                if (args.length < 3) {
                    console.error('❌ Ticket ID und Chip UID erforderlich!')
                    console.log('Usage: node scripts/test-vivenu-api.js --update-barcode TICKET_ID CHIP_UID')
                    process.exit(1)
                }
                await updateTicketBarcode(args[1], args[2])
                break

            default:
                console.error(`❌ Unbekannter Befehl: ${args[0]}`)
                process.exit(1)
        }

        console.log('🎉 Erfolgreich abgeschlossen!')
    } catch (error) {
        console.error('💥 Fehler:', error.message)
        process.exit(1)
    }
}

// Skript ausführen
main()

export {
    testConnection,
    updateTicketBarcode
}
