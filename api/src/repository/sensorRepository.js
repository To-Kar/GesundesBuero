const BaseRepository = require('../db/baseRepository');

class SensorRepository extends BaseRepository {
    constructor() {
        super();
    }

    async updateSensorData(data) {
        return this.executeQuery(async (pool) => {
            const updateQuery = `
                UPDATE SENSOR
                SET temperature = @temperature,
                    humidity = @humidity,
                    timestamp = @timestamp,
                    co2 = @co2
                WHERE sensor_id = @sensor_id
            `;

            const request = pool.request();
            request.input('sensor_id', this.sql.VarChar, data.sensor_id);
            request.input('temperature', this.sql.Decimal(5, 2), data.temperature);
            request.input('humidity', this.sql.Int, data.humidity);
            request.input('timestamp', this.sql.DateTime, data.timestamp); 
            request.input('co2', this.sql.Int, data.co2);

            return await request.query(updateQuery);
        });
    }

    async fetchSensorData(sensorId) {
        return this.executeQuery(async (pool) => {
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
                dbRequest.input('sensorId', this.sql.VarChar, sensorId);
            }

            const result = await dbRequest.query(query);
            return result.recordset;
        });
    }

    async fetchAllSensors() {
        return this.executeQuery(async (pool) => {
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
            return result.recordset;
        });
    }

    async updateSensorIp(sensor_id, ip_address) {
        return this.executeQuery(async (pool) => {
            const query = `
                UPDATE SENSOR
                SET ip_address = @ip_address
                WHERE sensor_id = @sensor_id
            `;
            const request = pool.request();
            request.input('sensor_id', this.sql.VarChar, sensor_id);
            request.input('ip_address', this.sql.VarChar, ip_address);

            return await request.query(query);
        });
    }

    async getSensorsWithRoomData() {
        return this.executeQuery(async (pool) => {
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
        });
    }

    async updateSensorStatus(sensorId, isConnected) {
        return this.executeQuery(async (pool) => {
            const query = `
                UPDATE SENSOR
                SET is_connected = @isConnected
                WHERE sensor_id = @sensorId
            `;
            const request = pool.request();
            request.input('sensorId', this.sql.VarChar, sensorId);
            request.input('isConnected', this.sql.Bit, isConnected ? 1 : 0);
            
            return await request.query(query);
        });
    }

    async insertSensor(sensor_id, ip_address) {
        return this.executeQuery(async (pool) => {
            const query = `
                INSERT INTO SENSOR (sensor_id, ip_address)
                VALUES (@sensor_id, @ip_address)
            `;

            const request = pool.request();
            request.input('sensor_id', this.sql.VarChar, sensor_id);
            request.input('ip_address', this.sql.VarChar, ip_address);

            const result = await request.query(query);

            if (result.rowsAffected[0] === 0) {
                throw { status: 500, message: 'Sensor konnte nicht hinzugefügt werden.' };
            }

            return result;
        });
    }

    async removeSensor(sensor_id) {
        return this.executeQuery(async (pool) => {
            const query = `
                DELETE FROM SENSOR
                WHERE sensor_id = @sensor_id
            `;

            const request = pool.request();
            request.input('sensor_id', this.sql.VarChar, sensor_id);

            return await request.query(query);
        });
    }
}

module.exports = new SensorRepository();