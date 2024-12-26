// sensorApi.js

import { apiClient } from './apiClient';

// Funktion zur Berechnung des Status basierend auf aktuellen und Zielwerten
const calculateStatus = (current, target, isHumidity = false) => {
    if (current == null || target == null) return 'unknown';
    const diff = Math.abs(current - target);
    const threshold = isHumidity ? 5 : 1; // 5% für Luftfeuchtigkeit, 1°C für Temperatur

    if (diff <= threshold) return 'optimal';
    if (diff <= threshold * 2) return 'warning';
    return 'critical';
};

// Private Funktion zur Transformation der Sensordaten
const transformSensorData = (data) => ({
    sensorId: data.sensor_id,
    roomId: data.room_id ? data.room_id.toString() : 'N/A', // Stellen Sie sicher, dass roomId ein String ist
    temperature: data.current_temp || data.temperature || 'N/A',
    humidity: data.current_humidity || data.humidity || 'N/A',
    timestamp: new Date(data.last_updated || data.timestamp),
    status: {
        temp_status: calculateStatus(data.current_temp, data.target_temp),
        humidity_status: calculateStatus(data.current_humidity, data.target_humidity, true),
    },
});

// Sensor API Service
export const sensorApi = {
    // Aktuelle Sensordaten für einen Raum abrufen
    async getLatestSensorData(roomId) {
        try {
            const response = await apiClient.get('/room-sensor-data', {
                params: { roomId },
            });
            const data = Array.isArray(response.data) ? response.data[0] : response.data;
            console.log(`Sensordaten für Raum ${roomId}:`, data); // Debugging

            return transformSensorData(data);
        } catch (error) {
            console.error(`Fehler beim Abrufen der Sensordaten für Raum ${roomId}:`, error);
            return null; // Bei Fehler null zurückgeben
        }
    },

    // Neue Methode: Alle aktuellen Sensordaten abrufen
    async getAllLatestSensorData() {
        try {
            const response = await apiClient.get('/room-sensor-data');
            //console.log('Alle Sensordaten:', response.data); // Debugging

            return response.data.map(transformSensorData);
        } catch (error) {
            console.error('Fehler beim Abrufen aller Sensordaten:', error);
            throw error;
        }
    },

    // Historische Sensordaten für einen Raum abrufen (optional)
    async getHistoricalData(roomId, startDate, endDate) {
        try {
            const response = await apiClient.get('/room-sensor-data/history', {
                params: { roomId, startDate, endDate },
            });
            return response.data.map(transformSensorData);
        } catch (error) {
            console.error(`Fehler beim Abrufen der historischen Daten für Raum ${roomId}:`, error);
            throw error;
        }
    },

    // Alle Sensoren abrufen
    async getAvailableSensors() {
        try {
          const response = await apiClient.get('/sensors');
          return response.data.map(sensor => ({
            sensor_id: sensor.sensor_id,
            ip_address: sensor.ip_address,
            room_id: sensor.room_id || null,
          }));
        } catch (error) {
          console.error('Fehler beim Abrufen der Sensor-Daten:', error);
          throw error;
        }
      },
};
