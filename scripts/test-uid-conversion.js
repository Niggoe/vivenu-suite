// Node.js Test für UID-Konvertierung (direkte Implementierung)

/**
 * Konvertiert eine UID zu einer ID (JavaScript-Version des Python-Codes)
 */
function uidToId(uid) {
    // Input validieren
    if (!uid || typeof uid !== 'string') {
        throw new Error('UID muss ein String sein');
    }

    // UID bereinigen
    const cleanUid = uid.replace(/[\s-]/g, '').toLowerCase();

    // Länge prüfen
    if (cleanUid.length !== 8) {
        throw new Error(`UID muss 8 Zeichen lang sein, erhalten: ${cleanUid.length}`);
    }

    // Hexadezimal-Format prüfen
    if (!/^[0-9a-f]{8}$/i.test(cleanUid)) {
        throw new Error('UID muss ein gültiger 8-stelliger Hexadezimal-Wert sein');
    }

    try {
        // UID von hex zu bytes konvertieren
        const uidBytes = [];
        for (let i = 0; i < cleanUid.length; i += 2) {
            const byte = parseInt(cleanUid.substr(i, 2), 16);
            uidBytes.push(byte);
        }

        // Bytes umkehren
        const reversedBytes = uidBytes.reverse();

        // Zurück zu hex und in Großbuchstaben
        const reversedHex = reversedBytes
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();

        // Präfix hinzufügen
        const resultId = '88040000' + reversedHex;

        return resultId;
    } catch (error) {
        throw new Error(`Fehler bei der UID-Konvertierung: ${error}`);
    }
}

// Test der UID-Konvertierung mit dem Beispiel aus dem Python-Skript
console.log('=== Vivenu Suite UID-Konvertierung Test ===\n')

const testCases = [
    { uid: 'c43f3632', expected: '8804000032363FC4' },  // Beispiel aus dem Python-Skript
    'A1B2C3D4',  // Test mit Großbuchstaben
    '12345678',  // Test mit nur Zahlen
    'abcdef12'   // Test mit nur Kleinbuchstaben
]

testCases.forEach(testCase => {
    const testUid = typeof testCase === 'string' ? testCase : testCase.uid;
    const expected = typeof testCase === 'object' ? testCase.expected : null;

    try {
        const result = uidToId(testUid)
        const isCorrect = expected ? (result === expected) : '?';
        console.log(`✅ UID: ${testUid} → ID: ${result} ${expected ? (isCorrect ? '✅' : '❌') : ''}`)
        if (expected && !isCorrect) {
            console.log(`   Erwartet: ${expected}`)
        }
    } catch (error) {
        console.log(`❌ UID: ${testUid} → Fehler: ${error.message}`)
    }
})

console.log('\n=== Python-Vergleich ===')
const pythonTestUid = 'c43f3632';
const pythonExpected = '8804000032363FC4';
const jsResult = uidToId(pythonTestUid);

console.log(`Python UID: ${pythonTestUid}`)
console.log(`Python ID:  ${pythonExpected}`)
console.log(`JS UID:     ${pythonTestUid}`)
console.log(`JS ID:      ${jsResult}`)
console.log(`Match:      ${jsResult === pythonExpected ? '✅ KORREKT' : '❌ FEHLER'}`)
console.log('===============================')
