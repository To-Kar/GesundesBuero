import { apiClient } from './apiClient';

// Sensor API service
export const sensorApi = {
    // Get latest sensor data for a room
    async getLatestSensorData(roomId) {
        try {
            const response = await apiClient.get(`/sensor-data/latest/${roomId}`);
            return this._transformSensorData(response.data);
        } catch (error) {
            console.error(`Error fetching sensor data for room ${roomId}:`, error);
            throw error;
        }
    },

    // Get historical sensor data for a room
    async getHistoricalData(roomId, startDate, endDate) {
        try {
            const response = await apiClient.get(`/sensor-data/history/${roomId}`, {
                params: { startDate, endDate }
            });
            return response.data.map(this._transformSensorData);
        } catch (error) {
            console.error(`Error fetching historical data for room ${roomId}:`, error);
            throw error;
        }
    },

    // Private method to transform sensor data
    _transformSensorData(data) {
        return {
            sensorId: data.sensor_id,
            roomId: data.room_id,
            temperature: data.temperature,
            humidity: data.humidity,
            timestamp: new Date(data.timestamp),
            status: {
                temp_status: this._calculateStatus(data.temperature, data.target_temp),
                humidity_status: this._calculateStatus(data.humidity, data.target_humidity, true)
            }
        };
    },

    // Calculate status based on current and target values
    _calculateStatus(current, target, isHumidity = false) {
        if (!current || !target) return 'unknown';
        const diff = Math.abs(current - target);
        const threshold = isHumidity ? 5 : 1; // 5% for humidity, 1°C for temperature
        
        if (diff <= threshold) return 'optimal';
        if (diff <= threshold * 2) return 'warning';
        return 'critical';
    }
}; 