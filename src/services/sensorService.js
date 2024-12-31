// sensorService.js

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
const transformSensorData = (data) => {
    return {
        sensorId: data.sensor_id,
        roomId: data.room_id ? data.room_id.toString() : 'N/A',
        temperature: data.current_temp || data.temperature || 'N/A',
        humidity: data.current_humidity || data.humidity || 'N/A',
        co2: data.co2 || 'N/A',
        timestamp: new Date(data.last_updated || data.timestamp),
        // Explizite Konvertierung von is_connected zu Boolean
        is_connected: data.is_connected,
        status: {
            temp_status: calculateStatus(data.current_temp, data.target_temp),
            humidity_status: calculateStatus(data.current_humidity, data.target_humidity, true),
        },
    };
};

// Sensor API Service
export const sensorService = {
    // Aktuelle Sensordaten für einen Raum abrufen
    async getLatestSensorData(roomId) {
        try {
            const response = await apiClient.get('/room-sensor-data', {
                params: { roomId },
            });
            const data = Array.isArray(response.data) ? response.data[0] : response.data;
            console.log('raw sensor data:', data);
            const transformed = transformSensorData(data);
            console.log('Transformed is_connected:', transformed.is_connected);
            
            return transformed;
        } catch (error) {
            console.error(`Fehler beim Abrufen der Sensordaten für Raum ${roomId}:`, error);
            return null; // Bei Fehler null zurückgeben
        }
    },

    // Alle aktuellen Sensordaten abrufen
    async getAllLatestSensorData() {
        try {
            const response = await apiClient.get('/room-sensor-data');

            return response.data.map(transformSensorData);
        } catch (error) {
            console.error('Fehler beim Abrufen aller Sensordaten:', error);
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


    async updateSensorIp(sensor) {
        try {
          await apiClient.patch(`/sensors/${sensor.sensor_id}/ip`, {
            sensor_id: sensor.sensor_id,
            ip_address: sensor.ip_address
          });
          console.log(`IP-Adresse erfolgreich aktualisiert: ${sensor.ip_address}`);
        } catch (error) {
          console.error('Fehler beim Aktualisieren der IP-Adresse:', error);
          throw error;
        }
      }
};


