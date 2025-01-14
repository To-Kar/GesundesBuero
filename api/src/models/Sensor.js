class Sensor {
    constructor({ sensor_id, temperature = null, humidity = null, timestamp = null, ip_address = null, co2_detected = false }) {
        if (!sensor_id) throw new Error('sensor_id ist erforderlich');
       
        this.sensor_id = sensor_id;
        this.temperature = temperature;
        this.humidity = humidity;
        this.timestamp = timestamp;
        this.ip_address = ip_address;
        this.co2_detected = co2_detected;
    }

    static fromDb(row) {
        return new Sensor({
            sensor_id: row.sensor_id,
            temperature: row.temperature,
            humidity: row.humidity,
            timestamp: row.timestamp,
            ip_address: row.ip_address,
            co2_detected: row.co2_detected
        });
    }

    toJSON() {
        return {
            sensor_id: this.sensor_id,
            temperature: this.temperature,
            humidity: this.humidity,
            timestamp: this.timestamp,
            ip_address: this.ip_address,
            co2_detected: this.co2_detected
        };
    }
}
module.exports = Sensor;