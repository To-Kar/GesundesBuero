// repositories/notificationRepository.js
const sql = require('mssql');
const config = require('../config/dbConfig');

async function withConnection(operation) {
    let pool;
    try {
        pool = await sql.connect(config);
        return await operation(pool);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

// Bestehende Repository-Funktionen mit Verbindungshandling
async function deleteByRoomAndType(roomId, type) {
    return withConnection(async (pool) => {
        const request = pool.request();
        request.input('room_id', sql.VarChar, roomId);
        request.input('type', sql.VarChar, type);
        await request.query(`
            DELETE FROM Notification
            WHERE room_id = @room_id
            AND type = @type
        `);
    });
}

async function getNextNotificationId() {
    return withConnection(async (pool) => {
        const result = await pool.request().query(`
            SELECT ISNULL(MAX(CAST(notification_id AS INT)), 0) + 1 AS next_id
            FROM Notification
        `);
        return result.recordset[0].next_id.toString();
    });
}

async function createNotification(notification) {
    return withConnection(async (pool) => {
        const request = pool.request();
        request.input('notification_id', sql.VarChar, notification.notificationId);
        request.input('sensor_id', sql.VarChar, notification.sensorId);
        request.input('room_id', sql.VarChar, notification.roomId);
        request.input('type', sql.VarChar, notification.type);
        request.input('description', sql.NVarChar, notification.description);
        await request.query(`
            INSERT INTO Notification (
                notification_id,
                sensor_id,
                room_id,
                type,
                description,
                status
            ) VALUES (
                @notification_id,
                @sensor_id,
                @room_id,
                @type,
                @description,
                0
            )
        `);
    });
}

async function getAllWithRoomNames() {
    return withConnection(async (pool) => {
        const query = `
            SELECT
                n.*,
                r.name as room_name
            FROM Notification n
            LEFT JOIN ROOM r ON n.room_id = r.room_id
            ORDER BY timestamp DESC
        `;
        const result = await pool.request().query(query);
        return result.recordset;
    });
}

module.exports = {
    deleteByRoomAndType,
    getNextNotificationId,
    createNotification,
    getAllWithRoomNames
};