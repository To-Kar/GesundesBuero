class Notification {
    constructor({ notification_id, room_id, sensor_id, type, description = null, status = false, timestamp = null }) {
        if (!notification_id) throw new Error('notification_id ist erforderlich');
        if (!room_id) throw new Error('room_id ist erforderlich');
        if (!sensor_id) throw new Error('sensor_id ist erforderlich');
        if (!type) throw new Error('type ist erforderlich');
       
        this.notification_id = notification_id;
        this.room_id = room_id;
        this.sensor_id = sensor_id;
        this.type = type;
        this.description = description;
        this.status = status;
        this.timestamp = timestamp || new Date();
    }

    static fromDb(row) {
        return new Notification({
            notification_id: row.notification_id,
            room_id: row.room_id,
            sensor_id: row.sensor_id,
            type: row.type,
            description: row.description,
            status: Boolean(row.status),
            timestamp: row.timestamp
        });
    }

    toJSON() {
        const json = {
            notification_id: this.notification_id,
            room_id: this.room_id,
            sensor_id: this.sensor_id,
            type: this.type,
            description: this.description,
            status: this.status,
            timestamp: this.timestamp
        };
        
        if (this.room_name) {
            json.room_name = this.room_name;
        }
        
        return json;
    }
}

module.exports = Notification;