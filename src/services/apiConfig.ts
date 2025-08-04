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
        apiUrl: import.meta.env.DEV
            ? '/api/vivenu-dev'  // Proxy-URL für Development
            : (import.meta.env.VITE_VIVENU_DEV_API_URL || 'https://vivenu.dev/api').replace(/\/$/, ''), // Entferne trailing slash
        apiKey: import.meta.env.VITE_VIVENU_DEV_API_KEY || '',
        ticketsEndpoint: '/tickets',
        barcodeUpdateEndpoint: '/barcode/update',
        description: 'Development-Umgebung für sichere Tests und Entwicklung (mit CORS-Proxy)',
        color: '#3498db'
    },

    live: {
        name: 'Live (Production)',
        apiUrl: import.meta.env.DEV
            ? '/api/vivenu'  // Proxy-URL für Development
            : (import.meta.env.VITE_VIVENU_LIVE_API_URL || 'https://vivenu.com/api').replace(/\/$/, ''), // Entferne trailing slash
        apiKey: import.meta.env.VITE_VIVENU_LIVE_API_KEY || '',
        ticketsEndpoint: '/tickets',
        barcodeUpdateEndpoint: '/barcode/update',
        description: 'Live Production API - Echte Daten! Vorsicht! (mit CORS-Proxy)',
        color: '#e74c3c'
    }
}

// Standard-Konfiguration basierend auf NODE_ENV
export const getDefaultConfig = (): string => {
    if (import.meta.env.PROD) {
        return 'live'
    } else {
        return 'dev'
    }
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
