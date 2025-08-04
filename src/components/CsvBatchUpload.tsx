import React, { useState, useRef } from 'react'
import VivenuApiService from '../services/vivenuApi'
import './CsvBatchUpload.css'

interface CsvRow {
    ticketId: string
    barcode: string
    rowIndex: number
}

interface ProcessResult {
    ticketId: string
    barcode: string
    status: 'success' | 'error' | 'pending'
    message: string
    rowIndex: number
}

const CsvBatchUpload: React.FC = () => {
    const [csvData, setCsvData] = useState<CsvRow[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [results, setResults] = useState<ProcessResult[]>([])
    const [progress, setProgress] = useState({ current: 0, total: 0 })
    const fileInputRef = useRef<HTMLInputElement>(null)

    // CSV-Datei einlesen und parsen
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        console.log('📁 CSV-Datei ausgewählt:', file.name)

        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result as string
            parseCsvData(text)
        }
        reader.readAsText(file)
    }

    // CSV-Text parsen
    const parseCsvData = (csvText: string) => {
        console.log('🔍 Parse CSV-Daten...')

        const lines = csvText.trim().split('\n')
        if (lines.length < 2) {
            alert('CSV-Datei muss mindestens eine Header-Zeile und eine Datenzeile enthalten')
            return
        }

        // Header-Zeile parsen
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        const ticketIdIndex = headers.findIndex(h => h.includes('ticketid') || h.includes('ticket_id') || h.includes('ticket-id'))
        const barcodeIndex = headers.findIndex(h => h.includes('barcode') || h.includes('bar_code') || h.includes('bar-code'))

        if (ticketIdIndex === -1 || barcodeIndex === -1) {
            alert('CSV-Datei muss Spalten für "ticketId" und "barcode" enthalten')
            return
        }

        console.log(`✅ Header gefunden - ticketId: Spalte ${ticketIdIndex}, barcode: Spalte ${barcodeIndex}`)

        // Datenzeilen parsen
        const parsedData: CsvRow[] = []
        for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(',').map(c => c.trim())
            if (columns.length > Math.max(ticketIdIndex, barcodeIndex)) {
                const ticketId = columns[ticketIdIndex]
                const barcode = columns[barcodeIndex]

                if (ticketId && barcode) {
                    parsedData.push({
                        ticketId,
                        barcode,
                        rowIndex: i
                    })
                }
            }
        }

        console.log(`✅ ${parsedData.length} Datensätze geparst`)
        setCsvData(parsedData)
        setResults([]) // Reset vorherige Ergebnisse
    }

    // Batch-Verarbeitung starten
    const processBatch = async () => {
        if (csvData.length === 0) {
            alert('Bitte laden Sie zuerst eine CSV-Datei hoch')
            return
        }

        console.log('🚀 === CSV BATCH PROCESSING START ===')
        console.log(`📊 Verarbeite ${csvData.length} Datensätze`)

        setIsProcessing(true)
        setProgress({ current: 0, total: csvData.length })

        const processingResults: ProcessResult[] = csvData.map(row => ({
            ...row,
            status: 'pending' as const,
            message: 'Warten auf Verarbeitung...'
        }))
        setResults(processingResults)

        // Sequentielle Verarbeitung (um API nicht zu überlasten)
        for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i]
            console.log(`\n📋 Verarbeite Zeile ${i + 1}/${csvData.length}:`, row)

            try {
                // Verwende die neue direkte Barcode-Update-Funktion
                const result = await VivenuApiService.updateTicketBarcodeDirectly(row.ticketId, row.barcode)

                processingResults[i] = {
                    ...row,
                    status: 'success',
                    message: `Barcode erfolgreich auf "${row.barcode}" gesetzt`
                }

                console.log(`✅ Zeile ${i + 1} erfolgreich:`, result.message)

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
                processingResults[i] = {
                    ...row,
                    status: 'error',
                    message: errorMessage
                }

                console.error(`❌ Zeile ${i + 1} fehlgeschlagen:`, errorMessage)
            }

            // Fortschritt aktualisieren
            setProgress({ current: i + 1, total: csvData.length })
            setResults([...processingResults])

            // Kurze Pause zwischen Requests (um API nicht zu überlasten)
            if (i < csvData.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }
        }

        setIsProcessing(false)

        const successCount = processingResults.filter(r => r.status === 'success').length
        const errorCount = processingResults.filter(r => r.status === 'error').length

        console.log('🏁 === CSV BATCH PROCESSING END ===')
        console.log(`✅ Erfolgreich: ${successCount}`)
        console.log(`❌ Fehler: ${errorCount}`)

        alert(`Batch-Verarbeitung abgeschlossen!\n✅ Erfolgreich: ${successCount}\n❌ Fehler: ${errorCount}`)
    }

    // Reset-Funktion
    const resetUpload = () => {
        setCsvData([])
        setResults([])
        setProgress({ current: 0, total: 0 })
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="csv-batch-upload">
            <div className="csv-upload-header">
                <h2>📊 CSV Batch-Upload</h2>
                <p>Laden Sie eine CSV-Datei mit Spalten für "ticketId" und "barcode" hoch, um mehrere Tickets auf einmal zu aktualisieren.</p>
                <p>
                    <a
                        href="/beispiel-tickets.csv"
                        download="beispiel-tickets.csv"
                        style={{ color: '#3498db', textDecoration: 'none' }}
                    >
                        📥 Beispiel-CSV herunterladen
                    </a>
                </p>
            </div>

            {/* File Upload */}
            <div className="csv-upload-section">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                    className="csv-file-input"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="csv-upload-button"
                >
                    📁 CSV-Datei auswählen
                </button>
            </div>

            {/* CSV Preview */}
            {csvData.length > 0 && (
                <div className="csv-preview">
                    <h3>📋 Vorschau ({csvData.length} Datensätze)</h3>
                    <div className="csv-preview-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Zeile</th>
                                    <th>Ticket ID</th>
                                    <th>Neuer Barcode</th>
                                </tr>
                            </thead>
                            <tbody>
                                {csvData.slice(0, 5).map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.rowIndex}</td>
                                        <td>{row.ticketId}</td>
                                        <td>{row.barcode}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {csvData.length > 5 && (
                            <p className="csv-preview-more">... und {csvData.length - 5} weitere Datensätze</p>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {csvData.length > 0 && (
                <div className="csv-actions">
                    <button
                        onClick={processBatch}
                        disabled={isProcessing}
                        className="csv-process-button"
                    >
                        {isProcessing ? '⏳ Verarbeitung läuft...' : '🚀 Batch-Verarbeitung starten'}
                    </button>
                    <button
                        onClick={resetUpload}
                        disabled={isProcessing}
                        className="csv-reset-button"
                    >
                        🔄 Zurücksetzen
                    </button>
                </div>
            )}

            {/* Progress */}
            {isProcessing && (
                <div className="csv-progress">
                    <h3>📈 Fortschritt</h3>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        ></div>
                    </div>
                    <p>{progress.current} / {progress.total} ({Math.round((progress.current / progress.total) * 100)}%)</p>
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className="csv-results">
                    <h3>📊 Ergebnisse</h3>
                    <div className="results-summary">
                        <span className="success-count">
                            ✅ {results.filter(r => r.status === 'success').length} erfolgreich
                        </span>
                        <span className="error-count">
                            ❌ {results.filter(r => r.status === 'error').length} fehlgeschlagen
                        </span>
                        <span className="pending-count">
                            ⏳ {results.filter(r => r.status === 'pending').length} ausstehend
                        </span>
                    </div>

                    <div className="results-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Zeile</th>
                                    <th>Ticket ID</th>
                                    <th>Barcode</th>
                                    <th>Nachricht</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result, index) => (
                                    <tr key={index} className={`result-${result.status}`}>
                                        <td>
                                            {result.status === 'success' && '✅'}
                                            {result.status === 'error' && '❌'}
                                            {result.status === 'pending' && '⏳'}
                                        </td>
                                        <td>{result.rowIndex}</td>
                                        <td>{result.ticketId}</td>
                                        <td>{result.barcode}</td>
                                        <td>{result.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CsvBatchUpload
