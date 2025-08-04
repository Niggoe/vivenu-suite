/**
 * Chip-UID Konvertierungs-Utilities für die Vivenu Suite
 */

/**
 * Konvertiert eine UID (z.B. 'c43f3632') zu einer ID (z.B. '8804000032363FC4').
 * 
 * Die Transformation erfolgt folgendermaßen:
 * 1. UID wird umgekehrt (byte-weise)
 * 2. Präfix '88040000' wird hinzugefügt
 * 3. Alles wird in Großbuchstaben konvertiert
 * 
 * @param uid - 8-stellige hexadezimale UID (z.B. 'c43f3632')
 * @returns 16-stellige hexadezimale ID (z.B. '8804000032363FC4')
 * @throws Error bei ungültiger UID
 */
export function uidToId(uid: string): string {
    // Input validieren
    if (!uid || typeof uid !== 'string') {
        throw new Error('UID muss ein String sein');
    }

    // UID bereinigen (Leerzeichen und Bindestriche entfernen, lowercase)
    const cleanUid = uid.replace(/[\s-]/g, '').toLowerCase();

    // Länge prüfen (muss 8 Zeichen sein)
    if (cleanUid.length !== 8) {
        throw new Error(`UID muss 8 Zeichen lang sein, erhalten: ${cleanUid.length}`);
    }

    // Hexadezimal-Format prüfen
    if (!/^[0-9a-f]{8}$/i.test(cleanUid)) {
        throw new Error('UID muss ein gültiger 8-stelliger Hexadezimal-Wert sein');
    }

    try {
        // UID von hex zu bytes konvertieren
        const uidBytes: number[] = [];
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

/**
 * Validiert eine Chip-UID
 * 
 * @param uid - Die zu validierende UID
 * @returns true wenn gültig, false wenn ungültig
 */
export function isValidChipUid(uid: string): boolean {
    try {
        if (!uid || typeof uid !== 'string') {
            return false;
        }

        const cleanUid = uid.replace(/[\s-]/g, '').toLowerCase();

        // Länge und Format prüfen
        return cleanUid.length === 8 && /^[0-9a-f]{8}$/i.test(cleanUid);
    } catch {
        return false;
    }
}

/**
 * Formatiert eine UID für die Anzeige (mit Bindestrichen)
 * 
 * @param uid - Die zu formatierende UID
 * @returns Formatierte UID (z.B. 'c43f-3632')
 */
export function formatChipUid(uid: string): string {
    if (!isValidChipUid(uid)) {
        return uid;
    }

    const cleanUid = uid.replace(/[\s-]/g, '').toLowerCase();
    return `${cleanUid.slice(0, 4)}-${cleanUid.slice(4, 8)}`;
}

/**
 * Test-Funktion für die UID-Konvertierung
 * (nur für Entwicklungszwecke)
 */
export function testUidConversion(): void {
    const testUid = 'c43f3632';
    const expected = '8804000032363FC4';
    const result = uidToId(testUid);

    console.log('=== UID-Konvertierung Test ===');
    console.log(`UID: ${testUid}`);
    console.log(`ID:  ${result}`);
    console.log(`Erwartet: ${expected}`);
    console.log(`Korrekt: ${result === expected ? '✅' : '❌'}`);
    console.log('==============================');
}
