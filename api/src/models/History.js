class History {
    constructor({ sensor_id, room_id, temperature, humidity, co2, timestamp }) {
        this.sensor_id = sensor_id;
        this.room_id = room_id;
        this.temperature = temperature;
        this.humidity = humidity;
        this.co2 = co2;
        this.timestamp = timestamp;
    }

    static fromDb(row) {
        return new History({
            sensor_id: row.sensor_id,
            room_id: row.room_id,
            temperature: row.temperature,
            humidity: row.humidity,
            co2: row.co2,
            timestamp: row.timestamp,
        });
    }
}

module.exports = History;
