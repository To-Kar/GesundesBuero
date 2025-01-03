class Notification {
    constructor({ notification_id, room_id, sensor_id, type, description = null, status = false, timestamp = null }) {
        if (!notification_id) throw new Error('notification_id ist erforderlich');
        
        this.notification_id = notification_id;
        this.room_id = room_id;
        this.sensor_id = sensor_id;
        this.type = type;
        this.description = description;
        this.status = status;
        this.timestamp = timestamp;
    }

    static fromDb(row) {
        return new Notification({
            notification_id: row.notification_id,
            room_id: row.room_id,
            sensor_id: row.sensor_id,
            type: row.type,
            description: row.description,
            status: row.status,
            timestamp: row.timestamp
        });
    }
}

module.exports = Notification;
