class Room {
    constructor({ room_id, sensor_id = null, name, imageURL = null, target_temp = null, target_humidity = null }) {
        if (!room_id) throw new Error('room_id ist erforderlich');
        if (!name) throw new Error('name ist erforderlich');
       
        this.room_id = room_id;
        this.sensor_id = sensor_id;
        this.name = name;
        this.imageURL = imageURL;
        this.target_temp = target_temp;
        this.target_humidity = target_humidity;
    }

    toJSON() {
        return {
            room_id: this.room_id,
            sensor_id: this.sensor_id,
            name: this.name,
            imageURL: this.imageURL,
            target_temp: this.target_temp,
            target_humidity: this.target_humidity
        };
    }

    static fromDb(row) {
        return new Room({
            room_id: row.room_id,
            sensor_id: row.sensor_id,
            name: row.name,
            imageURL: row.imageURL,
            target_temp: row.target_temp,
            target_humidity: row.target_humidity
        });
    }

    static validate(roomData) {
        if (!roomData.room_id || !roomData.name) {
            throw new Error('room_id und name sind erforderlich');
        }
    }
}

module.exports = Room;