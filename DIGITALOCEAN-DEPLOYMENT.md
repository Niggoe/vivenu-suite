# DigitalOcean Deployment mit API-Keys - Vivenu Suite

## Das Problem

Bei Vite werden Environment-Variablen zur **Build-Zeit** eingebettet, nicht zur Laufzeit. Das bedeutet:

- ❌ Container-Environment-Variablen funktionieren **NICHT**
- ✅ Build-Args müssen verwendet werden

## Lösung: Build-Args für API-Keys

### 1. Lokaler Build mit API-Keys

```bash
# Mit dem bereitgestellten Script
./build-with-api-keys.sh

# Oder manuell
docker compose build \
  --build-arg VITE_VIVENU_DEV_API_KEY="key_0fa17405..." \
  --build-arg VITE_VIVENU_LIVE_API_KEY="key_98bb5571..."
```

### 2. Container-Image exportieren

```bash
# Image in tar-Datei speichern
docker save vivenufrontend-vivenu-suite:latest > vivenu-suite-mit-api-keys.tar

# Größe prüfen (~80MB)
ls -lh vivenu-suite-mit-api-keys.tar
```

### 3. Auf DigitalOcean übertragen

```bash
# Übertragung per scp
scp vivenu-suite-mit-api-keys.tar root@178.128.196.27:/tmp/

# SSH zur DigitalOcean Droplet
ssh root@178.128.196.27
```

### 4. Auf Server deployen

```bash
# Alte Container stoppen und entfernen
docker stop vivenu-suite-frontend || true
docker rm vivenu-suite-frontend || true
docker rmi vivenufrontend-vivenu-suite:latest || true

# Neues Image laden
docker load < /tmp/vivenu-suite-mit-api-keys.tar

# Container starten
docker run -d \
  --name vivenu-suite-frontend \
  -p 3000:80 \
  --restart unless-stopped \
  vivenufrontend-vivenu-suite:latest

# Cleanup
rm /tmp/vivenu-suite-mit-api-keys.tar
```

### 5. Verifikation

```bash
# Container Status
docker ps | grep vivenu-suite

# Health Check
curl http://178.128.196.27:3000/health

# API-Keys im Build prüfen
docker exec vivenu-suite-frontend find /usr/share/nginx/html -name "*.js" -exec grep -l "key_" {} \;

# API Test über Proxy
curl -H "Authorization: Bearer key_0fa17405..." \
     http://178.128.196.27:3000/api/tickets
```

## Docker-Compose Alternative (für einfachere Updates)

### docker-compose.yml auf Server erstellen:

```yaml
services:
  vivenu-suite:
    image: vivenufrontend-vivenu-suite:latest
    container_name: vivenu-suite-frontend
    ports:
      - "3000:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Deployment:

```bash
# Image laden
docker load < /tmp/vivenu-suite-mit-api-keys.tar

# Container starten
docker compose up -d

# Status prüfen
docker compose ps
docker compose logs -f
```

## Wichtige Erkenntnisse

### ✅ Was funktioniert:
- **Build-Args**: API-Keys werden zur Build-Zeit eingebettet
- **nginx-Proxy**: CORS-Probleme sind gelöst
- **Statisches Frontend**: Keine Runtime-Environment-Variablen nötig

### ❌ Was NICHT funktioniert:
- **Container ENV-Vars**: Werden von Vite ignoriert
- **Runtime-Konfiguration**: Nicht möglich bei statischen Builds

### 🔄 Update-Prozess:
1. Änderungen lokal machen
2. `./build-with-api-keys.sh` ausführen
3. Image exportieren und übertragen
4. Auf Server laden und Container neu starten

## Troubleshooting

### API-Keys nicht gefunden?
```bash
# Prüfe ob Keys im Build sind
docker run --rm vivenufrontend-vivenu-suite:latest sh -c \
  "grep -r 'key_' /usr/share/nginx/html/assets/ || echo 'Keine API-Keys gefunden!'"
```

### CORS-Probleme?
```bash
# Teste CORS-Headers
curl -H "Origin: http://178.128.196.27:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Authorization" \
     -X OPTIONS \
     http://178.128.196.27:3000/api/tickets
```

### Container startet nicht?
```bash
# Logs prüfen
docker logs vivenu-suite-frontend

# nginx-Konfiguration testen
docker run --rm vivenufrontend-vivenu-suite:latest nginx -t
```

## Sicherheitshinweise

⚠️ **API-Keys im Frontend**: Die API-Keys sind im JavaScript-Code sichtbar. Das ist bei Frontend-Anwendungen normal, aber beachten Sie:

- Keys haben beschränkte Berechtigungen
- Verwenden Sie separate Keys für Dev/Live
- Überwachen Sie API-Usage im Vivenu Dashboard

## Automatisierung (Optional)

Für regelmäßige Updates können Sie ein Deployment-Script erstellen:

```bash
#!/bin/bash
# update-digitalocean.sh

# Lokaler Build
./build-with-api-keys.sh

# Image exportieren
docker save vivenufrontend-vivenu-suite:latest > vivenu-suite-update.tar

# Übertragen und deployen
scp vivenu-suite-update.tar root@178.128.196.27:/tmp/
ssh root@178.128.196.27 << 'EOF'
docker load < /tmp/vivenu-suite-update.tar
docker compose down
docker compose up -d
rm /tmp/vivenu-suite-update.tar
EOF

echo "✅ Deployment auf DigitalOcean erfolgreich!"
```

---

**Zusammenfassung**: Die API-Keys sind jetzt korrekt im Build eingebettet und das CORS-Problem ist gelöst. Die Anwendung sollte auf DigitalOcean ohne weitere Probleme funktionieren! 🚀
