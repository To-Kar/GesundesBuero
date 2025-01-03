const roomRepository = require('../repository/roomRepository');
const sensorRepository = require('../repository/sensorRepository');
const settingsRepository = require('../repository/settingsRepository');
const sensorService = require('./sensorService');
const notificationService = require('./notificationService');

async function getRooms(roomId) {
    const rooms = await roomRepository.fetchRooms(roomId);
    if (!rooms || rooms.length === 0) {
        const error = new Error(roomId ? 
            `Raum ${roomId} nicht gefunden` : 
            'Keine Räume gefunden'
        );
        error.status = 404;
        throw error;
    }
    return rooms;
}

async function addRoom(roomData) {
    const { room_id, sensor_id } = roomData;  // sensor_id hier extrahieren

    await roomRepository.saveRoom(roomData);

    if (sensor_id) {
        const assignedRoom = await roomRepository.getRoomBySensor(sensor_id, room_id);  // room_id übergeben
        if (assignedRoom) {
            await roomRepository.removeSensorFromRoom(assignedRoom.room_id);
        }
    }
    return {
        status: 201,
        message: 'Raum erfolgreich hinzugefügt.',
    };
}


async function updateRoom(roomId, roomData) {
    const { name, sensor_id, image_url, target_temp, target_humidity } = roomData;

    if (sensor_id) {
        const assignedRoom = await roomRepository.getRoomBySensor(sensor_id, roomId);
        if (assignedRoom) {
            await roomRepository.removeSensorFromRoom(assignedRoom.room_id);
        }
    }

    const result = await roomRepository.updateRoom(roomId, {
        name,
        sensor_id,
        image_url,
        target_temp,
        target_humidity,
    });

    if (result.rowsAffected[0] === 0) {
        const error = new Error('Room not found.');
        error.status = 404;
        throw error;
    }

    // Benachrichtigungen prüfen wenn relevant
    if (target_temp !== undefined || target_humidity !== undefined || sensor_id !== undefined) {
        await notificationService.checkExistingSensorData();
    }

    return { message: 'Room updated successfully.' };
}

async function deleteRoom(roomId) {
    await roomRepository.deleteNotificationsByRoom(roomId);
    const result = await roomRepository.deleteRoom(roomId);
    
    if (result.rowsAffected[0] === 0) {
        const error = new Error('Room not found.');
        error.status = 404;
        throw error;
    }
    
    return { message: 'Room and related notifications deleted successfully.' };
}

async function updateRoomTargets(roomId, targets) {
    if (!targets || (targets.target_temp === undefined && targets.target_humidity === undefined)) {
        const error = new Error('Kein Sollwert zum Aktualisieren angegeben.');
        error.status = 400;
        throw error;
    }

    const result = await roomRepository.updateRoomTargets(roomId, targets);
    if (!result || result.rowsAffected[0] === 0) {
        const error = new Error(`Raum ${roomId} nicht gefunden`);
        error.status = 404;
        throw error;
    }

    // Benachrichtigungen nach Update prüfen
    await notificationService.checkExistingSensorData();
    
    return { message: 'Sollwerte erfolgreich aktualisiert' };
}

module.exports = {
    getRooms,
    addRoom,
    updateRoom,
    deleteRoom,
    updateRoomTargets
};