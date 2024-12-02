import { apiClient } from './apiClient';

// Room API service
export const roomApi = {
    // Get all rooms with their sensor data
    async getAllRooms() {
        try {
            const response = await apiClient.get('/sensor-data');
            return this._transformRoomData(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            throw error;
        }
    },

    // Get a single room by ID
    async getRoomById(roomId) {
        try {
            const response = await apiClient.get(`/sensor-data?roomId=${roomId}`);
            return this._transformRoomData(response.data, true);
        } catch (error) {
            console.error(`Error fetching room ${roomId}:`, error);
            throw error;
        }
    },

    // Update room settings
    async updateRoomSettings(roomId, settings) {
        try {
            const response = await apiClient.put(`/rooms/${roomId}`, settings);
            return this._transformRoomData(response.data, true);
        } catch (error) {
            console.error(`Error updating room ${roomId}:`, error);
            throw error;
        }
    },

    // Private method to transform room data
    _transformRoomData(data, isSingle = false) {
        const transform = roomData => ({
            number: roomData.room_id || "N/A",
            name: roomData.name || "Room",
            temperature: roomData.current_temp || "N/A",
            humidity: roomData.current_humidity || "N/A",
            target_temperature: roomData.target_temp || "N/A",
            target_humidity: roomData.target_humidity || "N/A",
            image: roomData.imageURL || `/assets/images/room${roomData.room_id}.jpg`,
            status: roomData.status || { temp_status: 'unknown', humidity_status: 'unknown' }
        });

        return isSingle ? transform(data) : data.map(transform);
    }
};