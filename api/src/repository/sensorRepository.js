const sql = require('mssql');
const config = require('../config/dbConfig');

// Funktion zum Aktualisieren von Daten
async function updateSensorData(data) {
    try {
        const pool = await sql.connect(config);

        // SQL-Abfrage für die Aktualisierung
        const updateQuery = `
            UPDATE SENSOR
            SET temperature = @temperature,
                humidity = @humidity,
                timestamp = @timestamp,
                co2 = @co2
            WHERE sensor_id = @sensor_id
        `;

        // Parameter binden und Abfrage ausführen
        const request = pool.request();
        request.input('sensor_id', sql.VarChar, data.sensor_id);
        request.input('temperature', sql.Decimal(5, 2), data.temperature);
        request.input('humidity', sql.Int, data.humidity);
        request.input('timestamp', sql.DateTime, data.timestamp); 
        request.input('co2', sql.Int, data.co2);

        await request.query(updateQuery);


        console.log(`Daten erfolgreich für Sensor ${data.sensor_id} aktualisiert:`, data);

        await pool.close();
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Tabelle:', error.message);
        throw new Error(error.message);
    }
}


async function fetchSensorData(sensorId) {
    let pool;
    try {
        pool = await sql.connect(config);
        
        const dbRequest = pool.request();
        let query = `
            SELECT 
                sensor_id,
                temperature AS current_temp,
                humidity AS current_humidity,
                timestamp AS last_updated,
                co2 AS co2
            FROM SENSOR
        `;

        if (sensorId) {
            query += ' WHERE sensor_id = @sensorId';
            dbRequest.input('sensorId', sql.VarChar, sensorId);
        }

        const result = await dbRequest.query(query);
        return result.recordset;
        
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}


async function fetchAllSensors() {
    const pool = await sql.connect(config);
    const query = `
        SELECT 
            Sensor.sensor_id,
            Sensor.ip_address,
            ROOM.room_id
        FROM 
            Sensor
        LEFT JOIN 
            ROOM
        ON 
            Sensor.sensor_id = ROOM.sensor_id
    `;

    const result = await pool.request().query(query);
    await pool.close();
    return result.recordset;
}


// Datenbankzugriff zur IP-Aktualisierung
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
async function getSensorsWithRoomData() {
    const pool = await sql.connect(config);
    try {
        const query = `
            SELECT
                s.sensor_id,
                s.temperature,
                s.humidity,
                s.co2,
                r.room_id,
                r.name,
                r.target_temp,
                r.target_humidity
            FROM SENSOR s
            JOIN ROOM r ON s.sensor_id = r.sensor_id
        `;
        const result = await pool.request().query(query);
        return result.recordset;
    } finally {
        await pool.close();
    }
}


module.exports = {
    updateSensorData,
    fetchSensorData,
    fetchAllSensors,
    updateSensorIp,
    getSensorsWithRoomData,


};