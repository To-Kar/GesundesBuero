const sql = require('mssql');
const config = require('../config/dbConfig');

// Funktion zum Aktualisieren von Daten
async function updateSensorData(data) {
    try {
        const pool = await sql.connect(config);

        // SQL-Abfrage f端r die Aktualisierung
        const updateQuery = `
            UPDATE SENSOR
            SET temperature = @temperature,
                humidity = @humidity,
                timestamp = @timestamp,
                co2 = @co2
            WHERE sensor_id = @sensor_id
        `;

        // Parameter binden und Abfrage ausf端hren
        const request = pool.request();
        request.input('sensor_id', sql.VarChar, data.sensor_id);
        request.input('temperature', sql.Decimal(5, 2), data.temperature);
        request.input('humidity', sql.Int, data.humidity);
        request.input('timestamp', sql.DateTime, data.timestamp); 
        request.input('co2', sql.Int, data.co2);

        await request.query(updateQuery);


        console.log(`Daten erfolgreich f端r Sensor ${data.sensor_id} aktualisiert:`, data);

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
        
        const settingsResult = await pool.request()
            .query('SELECT update_interval FROM SETTINGS WHERE id = 1');
        const updateInterval = settingsResult.recordset[0]?.update_interval || 300;
        
        const dbRequest = pool.request();
        let query = `
            SELECT 
                sensor_id,
                temperature AS current_temp,
                humidity AS current_humidity,
                timestamp AS last_updated,
                co2 AS co2,
                CAST(ABS(DATEDIFF(SECOND, timestamp, GETDATE())) as int) as time_diff,
                CAST(
                    CASE 
                        WHEN ABS(DATEDIFF(SECOND, timestamp, GETDATE())) <= (@updateInterval) THEN 1 
                        ELSE 0 
                    END 
                AS bit) AS is_connected
            FROM SENSOR
        `;

        if (sensorId) {
            query += ' WHERE sensor_id = @sensorId';
            dbRequest.input('sensorId', sql.VarChar, sensorId);
        }
        
        dbRequest.input('updateInterval', sql.Int, updateInterval);

        const result = await dbRequest.query(query);
        
        // Enhanced debug logging
        console.log('Sensor Data with connection status:', result.recordset.map(record => ({
            sensor_id: record.sensor_id,
            last_updated: record.last_updated,
            time_diff: record.get_date,
            timestamp: record.timestamp,
            is_connected: Boolean(record.is_connected),
            updateInterval: updateInterval
        })));
        
        return result.recordset.map(record => ({
            ...record,
            is_connected: Boolean(record.is_connected),
            time_diff: Math.abs(record.time_diff) // Ensure positive time difference
        }));
        
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
        console.log('SQL Update ausgef端hrt, Rows Affected:', result.rowsAffected[0]);

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