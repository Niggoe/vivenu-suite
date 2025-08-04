# 🔑 Vivenu API Konfiguration

Diese Anleitung erklärt, wie Sie die Vivenu Suite mit verschiedenen API-Umgebungen konfigurieren.

## 🛠️ Multi-Umgebungs-Setup

Die Vivenu Suite unterstützt 4 verschiedene API-Konfigurationen:

### 🧪 Mock (Development)
- **Verwendung**: Lokale Entwicklung ohne API-Zugriff  
- **API-Calls**: Simuliert
- **API-Key**: Nicht erforderlich
- **Sicherheit**: Vollständig sicher für Tests

### 🔧 Development  
- **Verwendung**: Entwicklung mit Dev-API
- **API-Calls**: Echte Calls an Development-Server
- **API-Key**: Development API-Key erforderlich
- **Sicherheit**: Sicher für Entwicklungstests

### 🚧 Staging
- **Verwendung**: Pre-Production Tests
- **API-Calls**: Echte Calls an Staging-Server  
- **API-Key**: Staging API-Key erforderlich
- **Sicherheit**: Vorsicht - ähnlich der Production

### 🚨 Live (Production)
- **Verwendung**: Production-Einsatz
- **API-Calls**: Echte Calls an Live-System
- **API-Key**: Production API-Key erforderlich  
- **Sicherheit**: HÖCHSTE VORSICHT - Echte Daten!

## ⚙️ Konfiguration

### 1. Umgebungsvariablen setzen

Bearbeiten Sie die `.env` Datei:

```bash
# Development API
VITE_VIVENU_DEV_API_URL=https://dev-api.vivenu.com/v1
VITE_VIVENU_DEV_API_KEY=your_dev_api_key_here

# Staging API  
VITE_VIVENU_STAGING_API_URL=https://staging-api.vivenu.com/v1
VITE_VIVENU_STAGING_API_KEY=your_staging_api_key_here

# Live/Production API
VITE_VIVENU_LIVE_API_URL=https://api.vivenu.com/v1
VITE_VIVENU_LIVE_API_KEY=your_live_api_key_here
```

### 2. Frontend-Konfiguration

Die Umgebung wird **direkt im Frontend** ausgewählt:

1. Starten Sie die Anwendung: `npm run dev`
2. Öffnen Sie `http://localhost:5175/`
3. Wählen Sie die gewünschte API-Konfiguration im oberen Bereich
4. Die Konfiguration wird automatisch gespeichert und angewendet

## 🔄 Umgebung wechseln

### Im Frontend
- Klicken Sie auf die gewünschte Konfigurationskarte
- Bei Wechsel zu "Live" erscheint eine Sicherheitswarnung
- Die Seite lädt automatisch neu, um die neue Konfiguration zu aktivieren

### Programmatisch
```typescript
import { setCurrentConfig } from './services/apiConfig'

// Zu Development wechseln
setCurrentConfig('dev')

// Zu Live wechseln (mit Warnung)
setCurrentConfig('live')
```

## 🧪 API testen

### Mit dem CLI-Skript

```bash
# Verbindung testen
node scripts/test-vivenu-api.js --test-connection

# Barcode aktualisieren
node scripts/test-vivenu-api.js --update-barcode TCK-12345 A1B2C3D4E5F6
```

### Mit dem Frontend

1. Starten Sie den Development Server: `npm run dev`
2. Öffnen Sie `http://localhost:5173`
3. Geben Sie eine Ticket-ID und Chip-UID ein
4. Klicken Sie auf "Barcode aktualisieren"

## 📡 API-Calls im Detail

### Barcode Update Request

**Endpoint:** `POST /tickets/{ticketId}/barcode/update`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {API_KEY}
X-API-Version: 1.0
User-Agent: Vivenu-Suite/1.0.0
```

**Body:**
```json
{
  "ticketId": "TCK-12345",
  "chipUid": "A1B2C3D4E5F6",
  "newBarcode": "BC-C3D4E5F6",
  "updateReason": "Chip-Update via Vivenu Suite",
  "metadata": {
    "userAgent": "Vivenu-Suite/1.0.0",
    "timestamp": "2025-08-04T12:00:00.000Z",
    "source": "vivenu-suite-frontend"
  }
}
```

### Erwartete Response

**Erfolg (200):**
```json
{
  "ticketId": "TCK-12345",
  "oldBarcode": "BC-OLD123",
  "newBarcode": "BC-C3D4E5F6",
  "chipUid": "A1B2C3D4E5F6",
  "status": "success",
  "timestamp": "2025-08-04T12:00:00.000Z",
  "transactionId": "txn_123456"
}
```

**Fehler (4xx/5xx):**
```json
{
  "error": "TICKET_NOT_FOUND",
  "message": "Ticket mit ID TCK-12345 nicht gefunden",
  "code": "404",
  "details": {
    "ticketId": "TCK-12345"
  }
}
```

## 🔐 Sicherheit

- **API-Key niemals committen** - verwenden Sie `.env` (bereits in `.gitignore`)
- **HTTPS verwenden** - alle API-Calls erfolgen über HTTPS
- **Fehlerbehandlung** - sensible Daten werden nicht in Logs ausgegeben
- **Timeout** - API-Calls haben ein 30-Sekunden-Timeout

## 🐛 Debugging

### Debug-Modus aktivieren

```bash
VITE_DEBUG_API_CALLS=true
```

### Browser Console

Öffnen Sie die Browser-Entwicklertools (F12) und schauen Sie in die Console für detaillierte API-Logs.

### CLI-Skript

Das CLI-Skript zeigt alle Request/Response-Details automatisch an.

## ❗ Troubleshooting

### "Kein API Key konfiguriert"
- Überprüfen Sie die `.env` Datei
- Stellen Sie sicher, dass `VITE_VIVENU_API_KEY` gesetzt ist
- Neustarten Sie den Development Server

### "Verbindung fehlgeschlagen"
- Überprüfen Sie die API-URL
- Testen Sie mit dem CLI-Skript
- Prüfen Sie Ihre Internetverbindung

### "401 Unauthorized"
- API-Key ist ungültig oder abgelaufen
- Kontaktieren Sie Vivenu für einen neuen Key

### "404 Not Found"
- Ticket-ID existiert nicht
- Überprüfen Sie die API-Endpoints
- Kontaktieren Sie Vivenu für die korrekten Endpoints

## 📞 Support

Bei Problemen mit der API-Integration:

1. **CLI-Skript verwenden** für grundlegende Tests
2. **Debug-Logs aktivieren** für detaillierte Informationen
3. **Vivenu Support kontaktieren** für API-spezifische Fragen

## 🔄 Mock vs. Live Modus

| Modus    | Konfiguration                       | Verwendung                |
| -------- | ----------------------------------- | ------------------------- |
| **Mock** | `VITE_USE_MOCK_API=true`            | Development ohne API-Key  |
| **Live** | `VITE_USE_MOCK_API=false` + API-Key | Production mit echter API |

Der Mock-Modus simuliert API-Responses für Development-Zwecke und ist standardmäßig aktiviert.
