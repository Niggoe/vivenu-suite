// Umgebungskonfigurationen für die Vivenu Suite

export interface ApiConfig {
    name: string
    apiUrl: string
    apiKey: string
    ticketsEndpoint: string
    barcodeUpdateEndpoint: string
    description: string
    color: string
}

export const API_CONFIGS: Record<string, ApiConfig> = {
    dev: {
        name: 'Development',
        apiUrl: '/api',  // nginx-Proxy zu vivenu.dev/api
        apiKey: import.meta.env.VITE_VIVENU_DEV_API_KEY || '',
        ticketsEndpoint: '/tickets',
        barcodeUpdateEndpoint: '/barcode/update',
        description: 'Development-Umgebung für sichere Tests und Entwicklung (über nginx-Proxy)',
        color: '#3498db'
    },

    live: {
        name: 'Live (Production)',
        apiUrl: '/api/live',  // nginx-Proxy zu vivenu.com/api
        apiKey: import.meta.env.VITE_VIVENU_LIVE_API_KEY || '',
        ticketsEndpoint: '/tickets',
        barcodeUpdateEndpoint: '/barcode/update',
        description: 'Live Production API - Echte Daten! Vorsicht! (über nginx-Proxy)',
        color: '#e74c3c'
    }
}

// Standard-Konfiguration basierend auf NODE_ENV
export const getDefaultConfig = (): string => {
    // Standardmäßig immer Dev-API verwenden (sicherer)
    // User kann manuell auf Live umstellen
    return 'dev'
}

// Aktuelle Konfiguration laden
export const getCurrentConfig = (): ApiConfig => {
    const configName = localStorage.getItem('vivenu-api-config') || getDefaultConfig()
    return API_CONFIGS[configName] || API_CONFIGS.dev
}

// Konfiguration setzen
export const setCurrentConfig = (configName: string): void => {
    if (API_CONFIGS[configName]) {
        localStorage.setItem('vivenu-api-config', configName)
        // Seite neu laden um die Konfiguration zu aktivieren
        window.location.reload()
    }
}
