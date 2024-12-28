const sql = require('mssql');
const config = require('../config/dbConfig');

// Funktion zum Abrufen der Einstellungen (Intervall)
async function fetchIntervalFromSettings() {
    try {
        const pool = await sql.connect(config);

        // SQL-Abfrage für das Intervall
        const selectQuery = `SELECT update_interval FROM Settings WHERE id = 1`; 
        const result = await pool.request().query(selectQuery);

        // Prüfen, ob Daten vorhanden sind
        if (result.recordset.length === 0) {
            throw new Error('Keine Daten in der Tabelle Settings gefunden.');
        }

        const interval = result.recordset[0].update_interval;

        await pool.close();

        return interval;
    } catch (error) {
        console.error('Fehler beim Abrufen des Intervalls:', error.message);
        throw new Error(error.message);
    }
}


async function fetchSettings() {
    const pool = await sql.connect(config);
    const query = 'SELECT update_interval FROM Settings WHERE id = 1';
    const result = await pool.request().query(query);

    await pool.close();

    return result.recordset[0];  
}


async function updateInterval(update_interval) {
    const pool = await sql.connect(config);
    const request = pool.request();

    const updateQuery = `
        UPDATE Settings
        SET update_interval = @update_interval
        WHERE id = 1;

        SELECT @@ROWCOUNT as affected;
    `;

    request.input('update_interval', sql.Int, update_interval);
    const result = await request.query(updateQuery);

    await pool.close();

    return result.recordset[0]?.affected || 0;
}


async function fetchOffsets() {
    let pool;
    try {
        pool = await sql.connect(config);
        const query = 'SELECT temperature_offset, humidity_offset FROM Settings WHERE id = 1;';
        const result = await pool.request().query(query);

        return result.recordset;
    } catch (error) {
        console.error('Fehler im Repository bei fetchOffsets:', error);
        throw error;
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

async function updateOffsets(temperature_offset, humidity_offset) {
    let pool;
    try {
        pool = await sql.connect(config);
        const query = `
            UPDATE Settings
            SET temperature_offset = @temperature_offset,
                humidity_offset = @humidity_offset
            WHERE id = 1;
        `;
        const request = pool.request();
        request.input('temperature_offset', sql.Float, temperature_offset);
        request.input('humidity_offset', sql.Float, humidity_offset);

        const result = await request.query(query);
        return result;
    } catch (error) {
        console.error('Fehler im Repository beim Aktualisieren der Offsets:', error);
        throw error;
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

module.exports = {
    fetchIntervalFromSettings,
    fetchSettings,
    updateInterval,
    fetchOffsets,
    updateOffsets,
};