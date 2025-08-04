# Vivenu Suite - CORS-Fix Deployment für DigitalOcean

## Problem-Beschreibung

Bei der Deployment der Vivenu Suite auf DigitalOcean tritt ein CORS-Fehler auf:
```
[Error] Failed to load resource: Origin http://178.128.196.27:3000 is not allowed by Access-Control-Allow-Origin.
```

## Lösung: nginx-Proxy für CORS

Die Lösung verwendet nginx als Reverse-Proxy um CORS-Probleme zu umgehen:

### 1. Architektur

```
[Browser] → [nginx:80] → [Vivenu API Server]
           ↓
    [React SPA Files]
```

- **Frontend**: React SPA wird von nginx ausgeliefert
- **API-Proxy**: nginx leitet `/api/*` an Vivenu-Server weiter
- **CORS-Headers**: nginx fügt die notwendigen CORS-Headers hinzu

### 2. Konfiguration

#### nginx.conf (CORS Proxy)
```nginx
# DEV API Proxy
location /api/ {
    rewrite ^/api/(.*)$ /$1 break;
    proxy_pass https://vivenu.dev/api;
    proxy_ssl_server_name on;
    proxy_ssl_verify off;
    
    # CORS Headers
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Vivenu-Env" always;
    
    # Preflight Options
    if ($request_method = OPTIONS) {
        return 204;
    }
}

# LIVE API Proxy (separate endpoint)
location /api/live/ {
    rewrite ^/api/live/(.*)$ /$1 break;
    proxy_pass https://vivenu.com/api;
    # ... similar CORS configuration
}
```

#### API Configuration (apiConfig.ts)
```typescript
export const API_CONFIGS: Record<string, ApiConfig> = {
    dev: {
        name: 'Development',
        apiUrl: '/api',  // Verwendet nginx-Proxy
        // ...
    },
    live: {
        name: 'Live (Production)',
        apiUrl: '/api/live',  // Verwendet nginx-Proxy für Live-API
        // ...
    }
}
```

### 3. Deployment Schritte

#### A. Lokaler Build und Test
```bash
# 1. Container bauen mit CORS-Fix
./deploy.sh build

# 2. Testen der CORS-Lösung
curl -v http://localhost:3000/api/tickets
# Sollte CORS-Headers zeigen: Access-Control-Allow-Origin: *

# 3. Live-API testen
curl -v http://localhost:3000/api/live/tickets
```

#### B. DigitalOcean Deployment

1. **Container Image übertragen**:
   ```bash
   # Export to tar
   docker save vivenufrontend-vivenu-suite:latest > vivenu-suite-cors-fix.tar
   
   # Transfer to DigitalOcean
   scp vivenu-suite-cors-fix.tar user@178.128.196.27:/tmp/
   
   # Load on server
   ssh user@178.128.196.27
   docker load < /tmp/vivenu-suite-cors-fix.tar
   ```

2. **Container starten**:
   ```bash
   # Stoppe alten Container
   docker stop vivenu-suite-frontend || true
   docker rm vivenu-suite-frontend || true
   
   # Starte neuen Container mit CORS-Fix
   docker run -d \
     --name vivenu-suite-frontend \
     -p 3000:80 \
     --restart unless-stopped \
     -e VITE_VIVENU_DEV_API_KEY="key_0fa17405..." \
     -e VITE_VIVENU_LIVE_API_KEY="key_98bb5571..." \
     vivenufrontend-vivenu-suite:latest
   ```

### 4. Verifikation

#### API-Endpoints testen:
```bash
# Health Check
curl http://178.128.196.27:3000/health

# Dev-API (via Proxy)
curl -H "Authorization: Bearer key_0fa17405..." \
     http://178.128.196.27:3000/api/tickets

# Live-API (via Proxy)  
curl -H "Authorization: Bearer key_98bb5571..." \
     http://178.128.196.27:3000/api/live/tickets

# CORS Preflight Test
curl -X OPTIONS \
     -H "Origin: http://178.128.196.27:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     http://178.128.196.27:3000/api/tickets
```

#### Browser Dev Tools:
1. Öffne `http://178.128.196.27:3000`
2. Überprüfe Network Tab
3. API-Calls sollten ohne CORS-Fehler funktionieren

### 5. Funktionsweise

#### Vorher (mit CORS-Problem):
```
Browser (178.128.196.27:3000) → vivenu.dev/api ❌ CORS Error
```

#### Nachher (mit nginx-Proxy):
```
Browser (178.128.196.27:3000) → nginx → vivenu.dev/api ✅ Same Origin
```

### 6. Vorteile der Lösung

- ✅ **Keine CORS-Probleme**: Alle API-Calls laufen über Same Origin
- ✅ **Transparent**: Frontend-Code unverändert
- ✅ **Flexibel**: Dev und Live API über verschiedene Endpunkte
- ✅ **Sicher**: API-Keys bleiben im Frontend
- ✅ **Performance**: nginx caching möglich

### 7. Troubleshooting

#### CORS-Fehler immer noch da?
```bash
# Überprüfe CORS-Headers
curl -I http://178.128.196.27:3000/api/tickets

# nginx Logs prüfen
docker logs vivenu-suite-frontend
```

#### API-Calls funktionieren nicht?
```bash
# Teste direkten nginx-Proxy
curl -v http://178.128.196.27:3000/api/tickets

# Überprüfe Authorization Header
curl -H "Authorization: Bearer [API_KEY]" \
     http://178.128.196.27:3000/api/tickets
```

#### Container startet nicht?
```bash
# nginx Konfiguration testen
docker run --rm vivenufrontend-vivenu-suite:latest nginx -t

# Container Logs
docker logs vivenu-suite-frontend
```

### 8. Monitoring

```bash
# Container Status
docker ps | grep vivenu-suite

# Resource Usage
docker stats vivenu-suite-frontend

# nginx Access Logs
docker logs -f vivenu-suite-frontend | grep -E "(GET|POST) /api"
```

## Zusammenfassung

Diese CORS-Fix-Lösung verwendet nginx als Reverse-Proxy um die Same-Origin-Policy zu umgehen. Das Frontend macht API-Calls an den lokalen nginx-Server, welcher diese dann an die Vivenu-APIs weiterleitet und die notwendigen CORS-Headers hinzufügt.

**Result**: Die Vivenu Suite funktioniert nun ohne CORS-Probleme auf DigitalOcean! 🚀
