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
        
        const dbRequest = pool.request();
        let query = `
            SELECT 
                sensor_id,
                temperature AS current_temp,
                humidity AS current_humidity,
                timestamp AS last_updated,
                co2 AS co2,
                is_connected
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
// Aktualisieren des is_connected-Status in der Datenbank
async function updateSensorStatus(sensorId, isConnected) {
    let pool;
    try {
        pool = await sql.connect(config);
        const query = `
            UPDATE SENSOR
            SET is_connected = @isConnected
            WHERE sensor_id = @sensorId
        `;
        const request = pool.request();
        request.input('sensorId', sql.VarChar, sensorId);
        request.input('isConnected', sql.Bit, isConnected ? 1 : 0);
        
        await request.query(query);
        console.log(`Sensor ${sensorId} erfolgreich aktualisiert. Status: ${isConnected}`);
    } catch (error) {
        console.error(`Fehler beim Aktualisieren des Sensors ${sensorId}:`, error);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

async function insertSensor(sensor_id, ip_address) {
    let pool;
    try {
        pool = await sql.connect(config);

        const query = `
            INSERT INTO SENSOR (sensor_id, ip_address)
            VALUES (@sensor_id, @ip_address)
        `;

        const request = pool.request();
        request.input('sensor_id', sql.VarChar, sensor_id);
        request.input('ip_address', sql.VarChar, ip_address);

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            throw { status: 500, message: 'Sensor konnte nicht hinzugefügt werden.' };
        }

        return result;
    } catch (error) {
        console.error('Fehler beim Hinzufügen des Sensors:', error);
        throw error;
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}


async function removeSensor(sensor_id) {
    let pool;
    try {
        pool = await sql.connect(config);

        const query = `
            DELETE FROM SENSOR
            WHERE sensor_id = @sensor_id
        `;

        const request = pool.request();
        request.input('sensor_id', sql.VarChar, sensor_id);

        const result = await request.query(query);
        return result;
    } catch (error) {
        console.error('Fehler beim Löschen des Sensors:', error);
        throw error;
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}




module.exports = {
    updateSensorData,
    fetchSensorData,
    fetchAllSensors,
    updateSensorIp,
    getSensorsWithRoomData,
    updateSensorStatus,
    insertSensor,
    removeSensor


};