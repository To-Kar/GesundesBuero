const BaseRepository = require('../db/baseRepository');
const Room = require('../models/Room');

class RoomRepository extends BaseRepository {
    constructor() {
        super();
    }

    async fetchRooms(roomId) {
        return this.executeQuery(async (pool) => {
            const dbRequest = pool.request();
            let query = `
                SELECT 
                    room_id,
                    name,
                    imageURL,
                    target_temp,
                    target_humidity,
                    sensor_id
                FROM ROOM
            `;

            if (roomId) {
                query += ' WHERE room_id = @roomId';
                dbRequest.input('roomId', this.sql.VarChar, roomId);
            }

            const result = await dbRequest.query(query);
            return result.recordset.map(row => Room.fromDb(row));
        });
    }

    async saveRoom(roomData) {
        return this.executeQuery(async (pool) => {
            const room = new Room(roomData);
            const query = `
              INSERT INTO ROOM (room_id, name, sensor_id, imageURL, target_temp, target_humidity)
              VALUES (@room_id, @name, @sensor_id, @image_url, @target_temp, @target_humidity)
            `;

            const requestDb = pool.request();
            requestDb.input('room_id', this.sql.VarChar, room.room_id);
            requestDb.input('name', this.sql.NVarChar, room.name);
            requestDb.input('sensor_id', this.sql.VarChar, room.sensor_id || null);
            requestDb.input('image_url', this.sql.NVarChar, room.image_url || null);
            requestDb.input('target_temp', this.sql.Float, room.target_temp || 22);
            requestDb.input('target_humidity', this.sql.Float, room.target_humidity || 50);

            return await requestDb.query(query);
        });
    }

    async getRoomBySensor(sensor_id, excludeRoomId) {
        return this.executeQuery(async (pool) => {
            const query = `
              SELECT room_id
              FROM ROOM
              WHERE sensor_id = @sensor_id AND room_id != @roomId
            `;
            const result = await pool.request()
                .input('sensor_id', this.sql.VarChar, sensor_id)
                .input('roomId', this.sql.VarChar, excludeRoomId)
                .query(query);
            
            return result.recordset[0];
        });
    }

    async removeSensorFromRoom(roomId) {
        return this.executeQuery(async (pool) => {
            const query = `
              UPDATE ROOM
              SET sensor_id = NULL
              WHERE room_id = @roomId
            `;
            return await pool.request()
                .input('roomId', this.sql.VarChar, roomId)
                .query(query);
        });
    }

    async updateRoom(roomId, roomData) {
        return this.executeQuery(async (pool) => {
            const updateFields = [];
            const requestDb = pool.request();

            if (roomData.name !== undefined) {
                updateFields.push(`name = @name`);
                requestDb.input('name', this.sql.NVarChar, roomData.name);
            }
            if (roomData.sensor_id !== undefined) {
                updateFields.push(`sensor_id = @sensor_id`);
                requestDb.input('sensor_id', this.sql.VarChar, roomData.sensor_id);
            }
            if (roomData.image_url !== undefined) {
                updateFields.push(`imageURL = @image_url`);
                requestDb.input('image_url', this.sql.NVarChar, roomData.image_url);
            }
            if (roomData.target_temp !== undefined) {
                updateFields.push(`target_temp = @target_temp`);
                requestDb.input('target_temp', this.sql.Float, roomData.target_temp);
            }
            if (roomData.target_humidity !== undefined) {
                updateFields.push(`target_humidity = @target_humidity`);
                requestDb.input('target_humidity', this.sql.Float, roomData.target_humidity);
            }

            const query = `
              UPDATE ROOM
              SET ${updateFields.join(', ')}
              WHERE room_id = @roomId
            `;
            requestDb.input('roomId', this.sql.VarChar, roomId);

            return await requestDb.query(query);
        });
    }

    async deleteNotificationsByRoom(roomId) {
        return this.executeQuery(async (pool) => {
            const query = `
                DELETE FROM NOTIFICATION
                WHERE room_id = @roomId
            `;
            return await pool.request()
                .input('roomId', this.sql.VarChar, roomId)
                .query(query);
        });
    }

    async deleteRoom(roomId) {
        return this.executeQuery(async (pool) => {
            const query = `
                DELETE FROM ROOM
                WHERE room_id = @roomId
            `;
            return await pool.request()
                .input('roomId', this.sql.VarChar, roomId)
                .query(query);
        });
    }

    async updateRoomTargets(roomId, targets) {
        return this.executeQuery(async (pool) => {
            const dbRequest = pool.request();
            dbRequest.input('roomId', this.sql.VarChar, roomId);

            let query = 'UPDATE ROOM SET ';
            const updateFields = [];

            if (targets.target_temp !== undefined) {
                updateFields.push('target_temp = @target_temp');
                dbRequest.input('target_temp', this.sql.Float, targets.target_temp);
            }
            if (targets.target_humidity !== undefined) {
                updateFields.push('target_humidity = @target_humidity');
                dbRequest.input('target_humidity', this.sql.Float, targets.target_humidity);
            }

            query += updateFields.join(', ');
            query += ' WHERE room_id = @roomId';

            return await dbRequest.query(query);
        });
    }
}

module.exports = new RoomRepository();