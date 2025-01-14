const BaseRepository = require('../db/baseRepository');
const Notification = require('../models/Notification');

class NotificationRepository extends BaseRepository {
    constructor() {
        super();
    }

    async createNotification(notification) {
        return this.executeQuery(async (pool) => {
            const request = pool.request();
            request.input('notification_id', this.sql.VarChar, notification.notification_id);
            request.input('sensor_id', this.sql.VarChar, notification.sensor_id);
            request.input('room_id', this.sql.VarChar, notification.room_id);
            request.input('type', this.sql.VarChar, notification.type);
            request.input('description', this.sql.NVarChar, notification.description);
            request.input('timestamp', this.sql.DateTime2, notification.timestamp);
           
            await request.query(`
                INSERT INTO Notification (
                    notification_id,
                    sensor_id,
                    room_id,
                    type,
                    description,
                    status,
                    timestamp
                ) VALUES (
                    @notification_id,
                    @sensor_id,
                    @room_id,
                    @type,
                    @description,
                    0,
                    @timestamp
                )
            `);
            
            return notification;
        });
    }

    async deleteByRoomAndType(roomId, type) {
        return this.executeQuery(async (pool) => {
            const request = pool.request();
            request.input('room_id', this.sql.VarChar, roomId);
            request.input('type', this.sql.VarChar, type);
            await request.query(`
                DELETE FROM Notification
                WHERE room_id = @room_id
                AND type = @type
            `);
        });
    }

    async getNextNotificationId() {
        return this.executeQuery(async (pool) => {
            const result = await pool.request().query(`
                SELECT ISNULL(MAX(CAST(notification_id AS INT)), 0) + 1 AS next_id
                FROM Notification
            `);
            return result.recordset[0].next_id.toString();
        });
    }

    async getAllWithRoomNames() {
        return this.executeQuery(async (pool) => {
            const query = `
                SELECT
                    n.*,
                    r.name as room_name
                FROM Notification n
                LEFT JOIN ROOM r ON n.room_id = r.room_id
                ORDER BY timestamp DESC
            `;
            const result = await pool.request().query(query);
            return result.recordset.map(row => {
                const notification = Notification.fromDb(row);
                notification.room_name = row.room_name;
                return notification;
            });
        });
    }

    async updateNotificationStatus(notificationId, status) {
        return this.executeQuery(async (pool) => {
            const request = pool.request();
            request.input('notification_id', this.sql.VarChar, notificationId);
            request.input('status', this.sql.Bit, status);
           
            await request.query(`
                UPDATE Notification
                SET status = @status
                WHERE notification_id = @notification_id
            `);
        });
    }
}

module.exports = new NotificationRepository();