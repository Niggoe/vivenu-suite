# 🐳 Vivenu Suite - Docker Deployment

Dieses Dokument beschreibt, wie Sie die Vivenu Suite als Docker-Container deployen.

## 📋 Voraussetzungen

- Docker (Version 20.10+)
- Docker Compose (Version 2.0+)
- Mindestens 2GB RAM
- Mindestens 1GB Festplattenspeicher

## 🚀 Schnellstart

1. **Repository klonen und ins Verzeichnis wechseln:**
   ```bash
   git clone <repository-url>
   cd VivenuFrontend
   ```

2. **Environment-Variablen konfigurieren:**
   ```bash
   cp .env.docker .env
   # Bearbeiten Sie die .env-Datei mit Ihren API-Keys
   ```

3. **Application deployen:**
   ```bash
   ./deploy.sh build
   ```

4. **Anwendung öffnen:**
   ```
   http://localhost:3000
   ```

## ⚙️ Konfiguration

### Environment-Variablen

Die wichtigsten Umgebungsvariablen in der `.env`-Datei:

```bash
# Port-Konfiguration
VIVENU_PORT=3000

# Vivenu API Credentials
VITE_VIVENU_DEV_API_KEY=your_dev_api_key_here
VITE_VIVENU_LIVE_API_KEY=your_live_api_key_here

# API-URLs (normalerweise nicht ändern)
VITE_VIVENU_DEV_API_URL=https://vivenu.dev/api
VITE_VIVENU_LIVE_API_URL=https://vivenu.com/api
```

### Port-Konfiguration

Standardmäßig läuft die Anwendung auf Port 3000. Um einen anderen Port zu verwenden:

```bash
# In der .env-Datei
VIVENU_PORT=8080
```

Dann ist die Anwendung unter `http://localhost:8080` erreichbar.

## 🛠️ Deployment-Kommandos

Das `deploy.sh`-Skript bietet verschiedene Kommandos:

### Basis-Deployment
```bash
./deploy.sh build           # Standard-Deployment
./deploy.sh clean           # Deployment mit Image-Cleanup
```

### Service-Management
```bash
./deploy.sh status          # Service-Status anzeigen
./deploy.sh logs            # Live-Logs anzeigen
./deploy.sh health          # Gesundheits-Check
./deploy.sh stop            # Services stoppen
```

### Development
```bash
./deploy.sh dev             # Lokaler Development-Server
```

## 📊 Service-Überwachung

### Status überprüfen
```bash
./deploy.sh status
```

### Logs anzeigen
```bash
./deploy.sh logs
```

### Health-Check
```bash
./deploy.sh health
```

### Docker-Kommandos direkt verwenden
```bash
# Container-Status
docker-compose ps

# Logs eines spezifischen Services
docker-compose logs vivenu-suite

# Service neu starten
docker-compose restart vivenu-suite

# Ins Container-Terminal
docker-compose exec vivenu-suite sh
```

## 🔧 Erweiterte Konfiguration

### Multi-Environment Setup

Für verschiedene Umgebungen (dev, staging, prod):

```bash
# Development
cp .env.docker .env.dev
# Bearbeiten Sie .env.dev mit Development-Credentials

# Staging  
cp .env.docker .env.staging
# Bearbeiten Sie .env.staging mit Staging-Credentials

# Deployment mit spezifischer Environment-Datei
docker-compose --env-file .env.dev up -d
```

### SSL/HTTPS (Optional)

Für HTTPS-Support mit Reverse Proxy:

```bash
# Proxy-Profile aktivieren
docker-compose --profile proxy up -d

# SSL-Zertifikate im ssl/ Verzeichnis platzieren
mkdir ssl
# Fügen Sie cert.pem und key.pem hinzu
```

### Persistent Data (Optional)

Für persistente Daten (Logs, etc.):

```bash
# Volume wird automatisch erstellt
docker volume ls | grep vivenu
```

## 🐛 Troubleshooting

### Port bereits belegt
```bash
# Port ändern in .env
VIVENU_PORT=8080

# Oder einen freien Port finden
netstat -tlnp | grep :3000
```

### Container startet nicht
```bash
# Logs überprüfen
docker-compose logs vivenu-suite

# Container-Details anzeigen
docker inspect vivenu-suite-frontend
```

### API-Verbindung fehlschlägt
```bash
# API-Keys in .env überprüfen
# Container neu starten
docker-compose restart vivenu-suite
```

### Nginx-Fehler
```bash
# Nginx-Konfiguration testen
docker-compose exec vivenu-suite nginx -t

# Nginx neu laden
docker-compose exec vivenu-suite nginx -s reload
```

### Kompletter Reset
```bash
# Alle Container und Images entfernen
docker-compose down --rmi all --volumes --remove-orphans

# System cleanup  
docker system prune -a

# Neu deployen
./deploy.sh clean
```

## 🚀 Produktions-Deployment

### Optimierungen für Production

1. **Resource Limits setzen:**
   ```yaml
   # In docker-compose.yml
   services:
     vivenu-suite:
       deploy:
         resources:
           limits:
             memory: 512M
             cpus: '0.5'
   ```

2. **Restart Policy:**
   ```yaml
   restart: always
   ```

3. **Logging konfigurieren:**
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

### Monitoring Setup

```bash
# Container-Metriken
docker stats vivenu-suite-frontend

# Health-Checks automatisieren
while true; do ./deploy.sh health; sleep 30; done
```

## 📈 Performance-Tuning

### Build-Optimierung
```bash
# Multi-core Build nutzen
DOCKER_BUILDKIT=1 docker-compose build --parallel
```

### Image-Größe reduzieren
```bash
# Clean Build
./deploy.sh clean

# Image-Größe prüfen
docker images | grep vivenu
```

## 🔐 Security

### Non-Root User
Die Container laufen als non-root User (`vivenu:1001`) für bessere Sicherheit.

### Network Isolation
Services laufen in einem isolierten Docker-Netzwerk (`vivenu-network`).

### Security Headers
Nginx ist mit Security-Headers konfiguriert (siehe `nginx.conf`).

## 📞 Support

Bei Problemen:

1. Überprüfen Sie die Logs: `./deploy.sh logs`
2. Prüfen Sie den Health-Status: `./deploy.sh health`
3. Schauen Sie in die Dokumentation
4. Kontaktieren Sie das Entwicklungsteam

---

**Vivenu Suite v1.0.0** - Ticket Barcode Management System mit CSV Batch-Upload 🎫
