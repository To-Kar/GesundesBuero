const sensorRepository = require('../repository/sensorRepository');
const settingsRepository = require('../repository/settingsRepository');

const sql = require('mssql');
const config = require('../config/dbConfig');

async function updateSensorDataAndFetchInterval(body) {
    const { sensor_id, temperature, humidity, timestamp } = body;

    // Validierung der Payload
    if (!sensor_id || temperature === undefined || humidity === undefined) {
        throw { status: 400, message: 'Fehler: sensor_id, temperature und humidity sind erforderlich.' };
    }

    // Daten in der DB aktualisieren
    await sensorRepository.updateSensorData({ sensor_id, temperature, humidity, timestamp });

    // Intervall aus der Tabelle Settings abrufen
    const interval = await settingsRepository.fetchIntervalFromSettings();

    return { interval };
}


async function getSensorData(sensorId) {
    // Sensor-Daten vom Repository abrufen
    const sensors = await sensorRepository.fetchSensorData(sensorId);

    // Validierung
    if (!sensors || sensors.length === 0) {
        throw { status: 404, message: sensorId ? `Sensordaten für Sensor ${sensorId} nicht gefunden` : 'Keine Sensordaten gefunden' };
    }
    // Rückgabe der ersten Sensordaten oder der gesamten Liste
    return sensorId ? sensors[0] : sensors;
}

async function getAllSensors() {
    const sensors = await sensorRepository.fetchAllSensors();

    if (!sensors || sensors.length === 0) {
        throw { status: 404, message: 'Keine Sensor-Daten gefunden.' };
    }

    return sensors;
}





// Zentrale Funktion für die IP-Validierung und DB-Aktualisierung
async function handleIpUpdate(sensor_id, ip_address) {
    if (!validateIp(ip_address)) {
        throw { status: 400, message: 'Ungültige IP-Adresse.' };
    }

    if (!sensor_id) {
        throw { status: 400, message: 'sensor_id ist erforderlich.' };
    }

    const result = await updateSensorIp(sensor_id, ip_address);

    if (result.rowsAffected[0] === 0) {
        throw { status: 404, message: 'Sensor nicht gefunden.' };
    }

    return { message: 'IP-Adresse erfolgreich aktualisiert.' };
}

// Funktion zur Validierung der IP-Adresse
function validateIp(ip_address) {
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip_address);
}

// Funktion für den Datenbankzugriff zur IP-Aktualisierung
async function updateSensorIp(sensor_id, ip_address) {
    let pool;
    try {
        pool = await sql.connect(config);
        const query = `
            UPDATE SENSOR
            SET ip_address = @ip_address
            WHERE sensor_id = @sensor_id
        `;
        const request = pool.request();
        request.input('sensor_id', sql.VarChar, sensor_id);
        request.input('ip_address', sql.VarChar, ip_address);

        const result = await request.query(query);
        console.log('SQL Update ausgeführt, Rows Affected:', result.rowsAffected[0]);

        return result;
    } catch (error) {
        console.error('Fehler beim DB-Update der IP-Adresse:', error);
        throw error;
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}


module.exports = {
    updateSensorDataAndFetchInterval,
    getSensorData,
    getAllSensors,
    handleIpUpdate,
};
