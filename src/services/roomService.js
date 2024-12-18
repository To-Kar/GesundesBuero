// roomApi.js

import { apiClient } from './apiClient';
import { sensorApi } from './sensorService';

// Funktion zur Berechnung des Status basierend auf aktuellen und Zielwerten
const calculateStatus = (current, target, isHumidity = false) => {
    if (current == null || target == null) return 'unknown';
    const diff = Math.abs(current - target);
    const threshold = isHumidity ? 5 : 1; // 5% für Luftfeuchtigkeit, 1°C für Temperatur

    if (diff <= threshold) return 'optimal';
    if (diff <= threshold * 2) return 'warning';
    return 'critical';
};

// Private Funktion zur Transformation der Raumdaten
const transformRoomData = (roomData) => ({
    number: roomData.room_id ? roomData.room_id.toString() : 'N/A', // Stellen Sie sicher, dass number ein String ist
    name: roomData.name || 'Room',
    sensor_id: roomData.sensor_id, // Fügen Sie diese Zeile hinzu
    temperature: roomData.current_temp || 'N/A',
    humidity: roomData.current_humidity || 'N/A',
    target_temperature: roomData.target_temp || 'N/A',
    target_humidity: roomData.target_humidity || 'N/A',
    image: roomData.imageURL || `/assets/images/room${roomData.room_id}.jpg`,
    status: roomData.status || { temp_status: 'unknown', humidity_status: 'unknown' },
});

// Room API Service
export const roomApi = {
      // Räume und Offsets abrufen
  async getRoomsAndOffsets() {
    try {
      // Räume und Sensordaten abrufen
      const rooms = await this.getAllRoomsWithSensorData();

      // Offsets abrufen
      const offsetResponse = await apiClient.get('/settings/offsets');
      const offsets = offsetResponse.data;

      return { rooms, offsets };
    } catch (error) {
      console.error('Fehler beim Abrufen der Räume oder Offsets:', error);
      throw error;
    }
  },
    // Alle Räume abrufen
    async getAllRooms() {
        try {
            const response = await apiClient.get('/rooms');
            //console.log('Räume:', response.data); // Debugging

            return response.data.map(transformRoomData);
        } catch (error) {
            console.error('Fehler beim Abrufen der Räume:', error);
            throw error;
        }
    },

    // Alle Räume mit Sensordaten abrufen
    async getAllRoomsWithSensorData() {
        try {
            // Räume abrufen
            const rooms = await this.getAllRooms();

            // Alle Sensordaten abrufen
            const sensorDataArray = await sensorApi.getAllLatestSensorData();

            // Raumdaten mit Sensordaten kombinieren
            return rooms.map((room) => {
                // Verwende room.sensor_id für die Zuordnung
                const sensorData = sensorDataArray.find((sensor) => sensor.sensorId === room.sensor_id);
                //console.log(`Kombiniere Raum ${room.number} mit Sensordaten:`, sensorData);
            
                return {
                    ...room,
                    temperature: sensorData ? sensorData.temperature : 'N/A',
                    humidity: sensorData ? sensorData.humidity : 'N/A',
                    status: sensorData
                        ? sensorData.status
                        : { temp_status: 'unknown', humidity_status: 'unknown' },
                };
            });
            
        } catch (error) {
            console.error('Fehler beim Abrufen der Räume mit Sensordaten:', error);
            throw error;
        }
    },

    // Einzelnen Raum abrufen (optional)
    async getRoomById(roomId) {
        try {
            const response = await apiClient.get(`/rooms/${roomId}`);
            return transformRoomData(response.data);
        } catch (error) {
            console.error(`Fehler beim Abrufen von Raum ${roomId}:`, error);
            throw error;
        }
    },

    // Raumeinstellungen aktualisieren (optional)
    async updateRoomSettings(roomId, settings) {
        try {
            const response = await apiClient.patch(`/rooms/${roomId}/targets`, settings);
            return transformRoomData(response.data);
        } catch (error) {
            console.error(`Fehler beim Aktualisieren von Raum ${roomId}:`, error);
            throw error;
        }
    },

    // Raum hinzufügen
    async createRoom(roomData) {
        try {
            const response = await apiClient.post('/rooms', roomData);
            return transformRoomData(response.data);
        } catch (error) {
            console.error('Fehler beim Hinzufügen eines Raums:', error);
            throw error;
        }
    },

    // Raum aktualisieren
    async updateRoom(roomId, roomData) {
        try {
            const response = await apiClient.patch(`/rooms/${roomId}`, roomData);
            return transformRoomData(response.data);
        } catch (error) {
            console.error(`Fehler beim Aktualisieren von Raum ${roomId}:`, error);
            throw error;
        }
    },

    // Raum löschen
    async deleteRoom(roomId) {
        try {
            await apiClient.delete(`/rooms/${roomId}`);
        } catch (error) {
            console.error(`Fehler beim Löschen von Raum ${roomId}:`, error);
            throw error;
        }
    },

    
};
