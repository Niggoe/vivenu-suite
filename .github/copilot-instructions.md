# Copilot Instructions für Vivenu Suite

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Projekt Übersicht
Dies ist die Vivenu Suite - ein React/TypeScript Frontend-System für Ticket-Management mit Chip-Integration.

## Technologie Stack
- **Frontend**: React 18 mit TypeScript
- **Build Tool**: Vite
- **Styling**: CSS/SCSS mit modernen Design-Prinzipien
- **Deployment**: Docker Container
- **API Integration**: RESTful APIs für Vivenu System Integration

## Hauptfunktionalitäten
1. **Ticket ID Eingabe**: Benutzer können Ticket-IDs eingeben
2. **Chip UID Eingabe**: HEX-Code Eingabe für Chip-UIDs
3. **Barcode Änderung**: Integration mit Vivenu API zum Ändern von Ticket-Barcodes
4. **Erweiterbarkeit**: Vorbereitung für weitere UI-Module

## Code Standards
- Verwende TypeScript für alle Komponenten
- Implementiere responsive Design-Prinzipien
- Nutze moderne React Hooks (useState, useEffect, etc.)
- API-Calls mit async/await pattern
- Fehlerbehandlung mit try/catch
- Input-Validierung für Ticket-IDs und HEX-Codes

## Architektur
- Modulare Komponentenstruktur
- Service-Layer für API-Kommunikation
- Konfigurierbare Umgebungsvariablen
- Docker-ready Konfiguration
