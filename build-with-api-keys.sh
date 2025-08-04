#!/bin/bash

# Vivenu Suite - Build mit API Keys
# Dieses Script baut den Container mit den API-Keys aus der .env Datei

set -e

echo "🔧 Lade Environment-Variablen aus .env..."

# Prüfe ob .env existiert
if [ ! -f .env ]; then
    echo "❌ .env Datei nicht gefunden!"
    echo "   Erstelle eine .env Datei mit den Vivenu API Keys:"
    echo "   VITE_VIVENU_DEV_API_KEY=key_..."
    echo "   VITE_VIVENU_LIVE_API_KEY=key_..."
    exit 1
fi

# Lade .env (sicher mit set -a/set +a)
set -a
source .env
set +a

# Prüfe ob API-Keys gesetzt sind
if [ -z "$VITE_VIVENU_DEV_API_KEY" ]; then
    echo "❌ VITE_VIVENU_DEV_API_KEY ist nicht in .env gesetzt!"
    exit 1
fi

if [ -z "$VITE_VIVENU_LIVE_API_KEY" ]; then
    echo "❌ VITE_VIVENU_LIVE_API_KEY ist nicht in .env gesetzt!"
    exit 1
fi

echo "✅ API Keys gefunden:"
echo "   DEV_API_KEY: ${VITE_VIVENU_DEV_API_KEY:0:20}..."
echo "   LIVE_API_KEY: ${VITE_VIVENU_LIVE_API_KEY:0:20}..."

echo ""
echo "🚀 Baue Docker Container mit API Keys..."

# Baue Container mit Build-Args
docker compose build \
    --build-arg VITE_VIVENU_DEV_API_KEY="$VITE_VIVENU_DEV_API_KEY" \
    --build-arg VITE_VIVENU_LIVE_API_KEY="$VITE_VIVENU_LIVE_API_KEY" \
    --build-arg VITE_VIVENU_DEV_API_URL="$VITE_VIVENU_DEV_API_URL" \
    --build-arg VITE_VIVENU_LIVE_API_URL="$VITE_VIVENU_LIVE_API_URL"

echo ""
echo "✅ Container erfolgreich gebaut!"
echo "🌐 Starte Container mit: docker compose up -d"
echo ""

# Optional: Direkt starten
read -p "Container jetzt starten? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starte Container..."
    docker compose up -d
    
    echo ""
    echo "✅ Container gestartet!"
    echo "🌐 Anwendung verfügbar unter: http://localhost:3000"
    echo "🔍 Status prüfen: docker compose ps"
    echo "📋 Logs anzeigen: docker compose logs -f"
fi
