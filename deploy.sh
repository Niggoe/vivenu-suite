#!/bin/bash

# Vivenu Suite - Enhanced Deployment Script
set -e

echo "🚀 Vivenu Suite Deployment Script v2.0"
echo "======================================="

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Funktionen
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${PURPLE}🔧 $1${NC}"
}

# Deployment-Modus bestimmen
DEPLOYMENT_MODE=${1:-"docker"}
ENVIRONMENT=${2:-"production"}

log_info "Deployment-Modus: $DEPLOYMENT_MODE"
log_info "Umgebung: $ENVIRONMENT"

# Überprüfe Docker Installation
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker ist nicht installiert. Bitte installieren Sie Docker zuerst."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose ist nicht installiert. Bitte installieren Sie Docker Compose zuerst."
        exit 1
    fi
    
    log_success "Docker und Docker Compose sind verfügbar"
}

# Build und Deploy
build_and_deploy() {
    log_info "Erstelle Docker Image..."
    
    # Stop existing containers
    log_info "Stoppe bestehende Container..."
    docker-compose down --remove-orphans || true
    
    # Remove old images (optional)
    if [ "$1" == "--clean" ]; then
        log_info "Entferne alte Images..."
        docker image prune -f
        docker system prune -f
    fi
    
    # Build new image
    log_info "Baue neues Image..."
    docker-compose build --no-cache
    
    # Start services
    log_info "Starte Services..."
    docker-compose up -d
    
    # Wait for services to be ready
    log_info "Warte auf Services..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        log_success "Vivenu Suite wurde erfolgreich deployed!"
        log_info "Die Anwendung ist verfügbar unter: http://localhost:3000"
    else
        log_error "Deployment fehlgeschlagen. Überprüfen Sie die Logs mit: docker-compose logs"
        exit 1
    fi
}

# Development Mode
dev_mode() {
    log_info "Starte Development Mode..."
    npm install
    npm run dev
}

# Show logs
show_logs() {
    docker-compose logs -f
}

# Stop services
stop_services() {
    log_info "Stoppe Services..."
    docker-compose down
    log_success "Services gestoppt"
}

# Show status
show_status() {
    log_info "Service Status:"
    docker-compose ps
    echo ""
    log_info "Docker Images:"
    docker images | grep vivenu || echo "Keine Vivenu Images gefunden"
}

# Health check
health_check() {
    log_info "Überprüfe Service-Gesundheit..."
    
    # Check if containers are running
    if ! docker-compose ps | grep -q "Up"; then
        log_error "Services sind nicht gestartet. Starten Sie mit: $0 build"
        exit 1
    fi
    
    # Check HTTP endpoint
    log_info "Teste HTTP-Endpoint..."
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "HTTP-Endpoint ist erreichbar"
    else
        log_error "HTTP-Endpoint ist nicht erreichbar"
    fi
    
    # Check Docker health
    log_info "Docker Health Status:"
    docker-compose ps | grep "healthy\|Up"
}

# Export für DigitalOcean
export_for_digitalocean() {
    log_info "Exportiere Docker Image für DigitalOcean..."
    
    # Build first if needed
    if ! docker images | grep -q "vivenufrontend-vivenu-suite"; then
        log_info "Baue Image zuerst..."
        ./build-with-api-keys.sh
    fi
    
    # Create tar.gz export
    log_info "Erstelle komprimiertes Image..."
    docker save vivenufrontend-vivenu-suite:latest | gzip > vivenu-suite-fixed.tar.gz
    
    log_success "Image exportiert als: vivenu-suite-fixed.tar.gz"
    log_info "Upload-Befehle für DigitalOcean:"
    echo "scp vivenu-suite-fixed.tar.gz root@178.128.196.27:~/"
    echo "ssh root@178.128.196.27"
    echo "docker load < vivenu-suite-fixed.tar.gz"
    echo "docker stop vivenu-suite-frontend || true"
    echo "docker rm vivenu-suite-frontend || true" 
    echo "docker run -d --name vivenu-suite-frontend -p 3000:80 vivenufrontend-vivenu-suite:latest"
    log_success "Ready for DigitalOcean deployment!"
}

# Main
case "$1" in
    "build")
        check_docker
        build_and_deploy $2
        ;;
    "export")
        export_for_digitalocean
        ;;
    "dev")
        dev_mode
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        stop_services
        ;;
    "status")
        show_status
        ;;
    "health")
        health_check
        ;;
    "clean")
        check_docker
        build_and_deploy --clean
        ;;
    *)
        echo "Usage: $0 {build|dev|logs|stop|clean|status|health}"
        echo ""
        echo "Commands:"
        echo "  build    - Build und deploy die Anwendung in Docker"
        echo "  export   - Exportiere Image für DigitalOcean Upload"
        echo "  clean    - Build mit cleanup alter Images"
        echo "  dev      - Starte Development Server (lokale Entwicklung)"
        echo "  logs     - Zeige Container-Logs"
        echo "  stop     - Stoppe alle Services"
        echo "  status   - Zeige Status der Services"
        echo "  health   - Überprüfe Gesundheit der Services"
        echo ""
        echo "Beispiele:"
        echo "  ./deploy.sh build        # Standard Deployment"
        echo "  ./deploy.sh clean        # Deployment mit Cleanup"
        echo "  ./deploy.sh dev          # Development Mode"
        echo "  ./deploy.sh logs         # Live-Logs anzeigen"
        echo ""
        exit 1
        ;;
esac
        echo "  dev      - Starte Development Server"
        echo "  logs     - Zeige Container Logs"
        echo "  stop     - Stoppe alle Services"
        echo ""
        echo "Examples:"
        echo "  $0 build     # Normales Deployment"
        echo "  $0 clean     # Deployment mit Cleanup"
        echo "  $0 dev       # Development Mode"
        exit 1
        ;;
esac

# CORS-Fix Build und Deploy
cors-fix:
@echo "🔧 Building with CORS-Fix..."
docker compose down --remove-orphans
docker compose build --no-cache
docker compose up -d
@echo "✅ CORS-Fix deployed! App running on port 3000"
@echo "🌐 API calls will be proxied through nginx to avoid CORS issues"

# Test CORS-Fix
test-cors:
@echo "🧪 Testing CORS-Fix..."
@curl -I http://localhost:3000/health || echo "Health check failed"
@curl -I http://localhost:3000/api/health || echo "API proxy test - should return 404 but with CORS headers"

