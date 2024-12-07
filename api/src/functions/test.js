const sql = require('mssql');

// Verbindungsdetails zur Azure SQL-Datenbank
const config = {
    user: '',
    password: '',
    server: '',
    database: '',
    options: {
        encrypt: true,
        trustServerCertificate: false,
    },
    port: 1433,
};

async function updateInterval(newInterval) {
    try {
        // Verbindung zur Datenbank herstellen
        const pool = await sql.connect(config);

        // SQL-Abfrage für das Update
        const updateQuery = `
            UPDATE SETTINGS
            SET update_interval = @newInterval
        `;

        // Abfrage ausführen (Update)
        await pool.request()
            .input('newInterval', sql.Int, newInterval)
            .query(updateQuery);

        console.log(`Wert für update_interval erfolgreich aktualisiert: ${newInterval}`);

        // Optional: Wert nach dem Update auslesen
        const selectQuery = `
            SELECT *
            FROM SETTINGS
        `;
        const result = await pool.request().query(selectQuery);
        console.log('Aktueller Wert für update_intervall in der Tabelle SETTINGS:');
        console.table(result.recordset);

        // Verbindung schließen
        await pool.close();
    } catch (error) {
        console.error('Fehler beim Aktualisieren des update_interval:', error.message);
    }
}

// Neuen Wert für update_intervall übergeben
updateInterval(300); // Beispiel: Wert auf 10 setzen