# 🎫 Vivenu Suite

Ein modernes Frontend-System für Ticket-Management mit Chip-Integration. Die Vivenu Suite ermöglicht es Benutzern, Ticket-IDs und Chip-UIDs zu verwalten und Ticket-Barcodes über die Vivenu API zu aktualisieren.

## ✨ Features

- **📝 Ticket-ID Eingabe**: Intuitive Eingabe und Validierung von Ticket-IDs
- **🔧 Chip-UID Management**: HEX-Code Eingabe für Chip-UIDs mit Validierung
- **🔄 Barcode-Update**: Nahtlose Integration mit der Vivenu API
- **🎨 Modernes UI**: Responsive Design mit React und Styled Components
- **🐳 Docker Ready**: Vollständig containerisiert für einfaches Deployment  
- **🔒 Sicherheit**: Umfassende Input-Validierung und Fehlerbehandlung
- **📱 Responsive**: Optimiert für Desktop und Mobile Geräte

## 🚀 Quick Start

### Development Mode
```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev
# oder
./deploy.sh dev
```

### Production Deployment mit Docker
```bash
# Build und Deploy
./deploy.sh build

# Mit Cleanup
./deploy.sh clean
```

Die Anwendung ist dann verfügbar unter: `http://localhost:3000`

## 🛠️ Technologie Stack

- **Frontend**: React 18 mit TypeScript
- **Build Tool**: Vite (schnell und modern)
- **Styling**: Styled Components
- **Forms**: React Hook Form mit Validierung
- **HTTP Client**: Axios
- **Container**: Docker mit Multi-Stage Build
- **Web Server**: Nginx (Production)

## 📋 Voraussetzungen

### Development
- Node.js 18+
- npm oder yarn

### Production
- Docker
- Docker Compose

## ⚙️ Konfiguration

### Umgebungsvariablen

Kopieren Sie `.env.example` zu `.env` und passen Sie die Werte an:

```bash
cp .env.example .env
```

Wichtige Variablen:
- `VITE_VIVENU_API_URL`: Basis-URL der Vivenu API
- `VITE_VIVENU_API_KEY`: API-Schlüssel für die Vivenu API
- `VITE_USE_MOCK_API`: Verwende Mock-API für Development (true/false)

## 🐳 Docker Deployment

### Einfaches Deployment
```bash
# Container bauen und starten
docker-compose up -d --build

# Logs anzeigen
docker-compose logs -f

# Container stoppen
docker-compose down
```

### Mit Deployment Script
```bash
# Verfügbare Kommandos
./deploy.sh build    # Normales Deployment
./deploy.sh clean    # Deployment mit Cleanup
./deploy.sh dev      # Development Mode
./deploy.sh logs     # Container Logs anzeigen
./deploy.sh stop     # Alle Services stoppen
```

## 📖 API Integration

Die Anwendung integriert sich mit der Vivenu API über den `VivenuApiService`:

```typescript
// Barcode aktualisieren
await VivenuApiService.updateTicketBarcode(ticketId, chipUid)

// Verbindung testen
await VivenuApiService.testConnection()
```

### Mock Mode
Für Development ohne echte API-Verbindung:
- Setzen Sie `VITE_VIVENU_API_KEY=""` in der `.env`
- Der Service verwendet automatisch Mock-Responses

## 🏗️ Projektstruktur

```
src/
├── components/           # React Komponenten
│   ├── VivenuSuite.tsx  # Haupt-Komponente
│   ├── TicketForm.tsx   # Eingabe-Formular
│   └── ResultDisplay.tsx # Ergebnis-Anzeige
├── services/            # API Services
│   └── vivenuApi.ts     # Vivenu API Integration
├── App.tsx              # App Root
├── App.css              # Global Styles
└── main.tsx             # Entry Point
```

## 🔧 Entwicklung

### Code Standards
- TypeScript für alle Komponenten
- Styled Components für Styling
- React Hook Form für Formulare
- Async/Await für API-Calls
- Umfassende Fehlerbehandlung

### Commands
```bash
npm run dev          # Development Server
npm run build        # Production Build
npm run preview      # Preview Production Build
npm run lint         # ESLint
npm run type-check   # TypeScript Check
```

## 🛡️ Sicherheit

- **Input Validation**: Umfassende Validierung für alle Eingaben
- **HTTPS Ready**: Nginx-Konfiguration mit Security Headers
- **No Root User**: Docker Container läuft mit Non-Root User
- **Environment Variables**: Sichere Konfiguration über Environment Variables

## 📈 Roadmap

- [ ] **Multi-Language Support**: Internationalisierung
- [ ] **Advanced Chip Management**: Erweiterte Chip-Funktionen
- [ ] **Batch Processing**: Mehrere Tickets gleichzeitig verarbeiten
- [ ] **Analytics Dashboard**: Statistiken und Reporting
- [ ] **User Management**: Benutzer-Rollen und -Rechte
- [ ] **API Documentation**: Interaktive API-Dokumentation

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT Lizenz lizenziert - siehe [LICENSE](LICENSE) für Details.

## 📞 Support

Bei Fragen oder Problemen:
- 📧 Email: support@vivenu-suite.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/vivenu-suite/issues)
- 📖 Dokumentation: [Wiki](https://github.com/your-org/vivenu-suite/wiki)

---

<div align="center">
  <p>Entwickelt mit ❤️ für die Vivenu Community</p>
  <p>🎫 <strong>Vivenu Suite</strong> - Ihr Partner für modernes Ticket-Management</p>
  <p>⚽ <strong>Powered by Schalke 04</strong> - Königsblau seit 1904 💙</p>
</div>
  {
    # 🎫 Vivenu Suite

Ein modernes Frontend-System für Ticket-Management mit Chip-Integration. Die Vivenu Suite ermöglicht es Benutzern, Ticket-IDs und Chip-UIDs zu verwalten und Ticket-Barcodes über die Vivenu API zu aktualisieren.

## ✨ Features

- **📝 Ticket-ID Eingabe**: Intuitive Eingabe und Validierung von Ticket-IDs
- **🔧 Chip-UID Management**: HEX-Code Eingabe für Chip-UIDs mit Validierung
- **🔄 Barcode-Update**: Nahtlose Integration mit der Vivenu API
- **🎨 Modernes UI**: Responsive Design mit React und Styled Components
- **🐳 Docker Ready**: Vollständig containerisiert für einfaches Deployment  
- **🔒 Sicherheit**: Umfassende Input-Validierung und Fehlerbehandlung
- **📱 Responsive**: Optimiert für Desktop und Mobile Geräte

## 🚀 Quick Start

### Development Mode
```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev
# oder
./deploy.sh dev
```

### Production Deployment mit Docker
```bash
# Build und Deploy
./deploy.sh build

# Mit Cleanup
./deploy.sh clean
```

Die Anwendung ist dann verfügbar unter: `http://localhost:3000`

## 🛠️ Technologie Stack

- **Frontend**: React 18 mit TypeScript
- **Build Tool**: Vite (schnell und modern)
- **Styling**: Styled Components
- **Forms**: React Hook Form mit Validierung
- **HTTP Client**: Axios
- **Container**: Docker mit Multi-Stage Build
- **Web Server**: Nginx (Production)

## 📋 Voraussetzungen

### Development
- Node.js 18+
- npm oder yarn

### Production
- Docker
- Docker Compose

## ⚙️ Konfiguration

### Umgebungsvariablen

Kopieren Sie `.env.example` zu `.env` und passen Sie die Werte an:

```bash
cp .env.example .env
```

Wichtige Variablen:
- `VITE_VIVENU_API_URL`: Basis-URL der Vivenu API
- `VITE_VIVENU_API_KEY`: API-Schlüssel für die Vivenu API
- `VITE_USE_MOCK_API`: Verwende Mock-API für Development (true/false)

## 🐳 Docker Deployment

### Einfaches Deployment
```bash
# Container bauen und starten
docker-compose up -d --build

# Logs anzeigen
docker-compose logs -f

# Container stoppen
docker-compose down
```

### Mit Deployment Script
```bash
# Verfügbare Kommandos
./deploy.sh build    # Normales Deployment
./deploy.sh clean    # Deployment mit Cleanup
./deploy.sh dev      # Development Mode
./deploy.sh logs     # Container Logs anzeigen
./deploy.sh stop     # Alle Services stoppen
```

## 📖 API Integration

Die Anwendung integriert sich mit der Vivenu API über den `VivenuApiService`:

```typescript
// Barcode aktualisieren
await VivenuApiService.updateTicketBarcode(ticketId, chipUid)

// Verbindung testen
await VivenuApiService.testConnection()
```

### Mock Mode
Für Development ohne echte API-Verbindung:
- Setzen Sie `VITE_VIVENU_API_KEY=""` in der `.env`
- Der Service verwendet automatisch Mock-Responses

## 🏗️ Projektstruktur

```
src/
├── components/           # React Komponenten
│   ├── VivenuSuite.tsx  # Haupt-Komponente
│   ├── TicketForm.tsx   # Eingabe-Formular
│   └── ResultDisplay.tsx # Ergebnis-Anzeige
├── services/            # API Services
│   └── vivenuApi.ts     # Vivenu API Integration
├── App.tsx              # App Root
├── App.css              # Global Styles
└── main.tsx             # Entry Point
```

## 🔧 Entwicklung

### Code Standards
- TypeScript für alle Komponenten
- Styled Components für Styling
- React Hook Form für Formulare
- Async/Await für API-Calls
- Umfassende Fehlerbehandlung

### Commands
```bash
npm run dev          # Development Server
npm run build        # Production Build
npm run preview      # Preview Production Build
npm run lint         # ESLint
```

## 🛡️ Sicherheit

- **Input Validation**: Umfassende Validierung für alle Eingaben
- **HTTPS Ready**: Nginx-Konfiguration mit Security Headers
- **No Root User**: Docker Container läuft mit Non-Root User
- **Environment Variables**: Sichere Konfiguration über Environment Variables

## 📈 Roadmap

- [ ] **Multi-Language Support**: Internationalisierung
- [ ] **Advanced Chip Management**: Erweiterte Chip-Funktionen
- [ ] **Batch Processing**: Mehrere Tickets gleichzeitig verarbeiten
- [ ] **Analytics Dashboard**: Statistiken und Reporting
- [ ] **User Management**: Benutzer-Rollen und -Rechte
- [ ] **API Documentation**: Interaktive API-Dokumentation

---

<div align="center">
  <p>Entwickelt mit ❤️ für die Vivenu Community</p>
  <p>🎫 <strong>Vivenu Suite</strong> - Ihr Partner für modernes Ticket-Management</p>
</div>
```
