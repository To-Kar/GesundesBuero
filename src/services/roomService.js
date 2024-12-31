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
    number: roomData.room_id ? roomData.room_id.toString() : 'N/A', 
    name: roomData.name || 'Room',
    sensor_id: roomData.sensor_id, 
    co2: roomData.co2 || 'N/A',
    temperature: roomData.current_temp || 'N/A',
    humidity: roomData.current_humidity || 'N/A',
    target_temperature: roomData.target_temp || 'N/A',
    target_humidity: roomData.target_humidity || 'N/A',
    image: roomData.imageURL || `/assets/images/room${roomData.room_id}.jpg`,
    is_connected: roomData.is_connected || false,
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

            // Merging is_connected from sensor data
            for (const room of rooms) {
                const sensorData = await sensorApi.getLatestSensorData(room.room_id);
            }

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
            const rooms = await this.getAllRooms();
            let sensorDataArray = [];
            
            try {
                sensorDataArray = await sensorApi.getAllLatestSensorData();
            } catch (error) {
                console.warn('Keine Sensordaten verfügbar:', error);
            }

            return rooms.map((room) => {
                const sensorData = sensorDataArray.find((sensor) => sensor.sensorId === room.sensor_id);
                
                const roomWithSensorData = {
                    ...room,
                    co2: sensorData ? sensorData.co2 : 'N/A',
                    temperature: sensorData ? sensorData.temperature : 'N/A',
                    humidity: sensorData ? sensorData.humidity : 'N/A',
                    status: sensorData 
                        ? sensorData.status 
                        : { temp_status: 'unknown', humidity_status: 'unknown' },
                    is_connected: sensorData ? sensorData.is_connected : room.is_connected
                };
                return roomWithSensorData;
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
    
    async updateTarget(roomId, type, value) {
        try {
          const settings = { [type]: value };
          await roomApi.updateRoomSettings(roomId, settings);
        } catch (error) {
          console.error(`Fehler beim Speichern des Sollwerts für ${type}:`, error);
          throw error;  // Fehler weiterwerfen, damit die Komponente darauf reagieren kann
        }
      },
};


