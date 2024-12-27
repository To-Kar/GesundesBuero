const roomRepository = require('../repository/roomRepository');
const httpResponses = require('../utils/httpResponse');
const sql = require('mssql');
const config = require('../config/dbConfig');

/**
 * Service zur Verwaltung der Raumdaten.
 * Kapselt die Geschäftslogik und trennt die Controller- und Datenbankschichten.
 */
async function getRooms(roomId) {
    const rooms = await roomRepository.fetchRooms(roomId);

    if (!rooms || rooms.length === 0) {
         const error = new Error(roomId ? `Raum ${roomId} nicht gefunden` : 'Keine Räume gefunden');
         error.status = 404;
         throw error;
    }

    return rooms;
}


async function addRoom(roomData) {
    const result = await roomRepository.saveRoom(roomData);
    return {
        status: 201,
        message: 'Raum erfolgreich hinzugefügt.',
    };
}


async function updateRoom(roomId, roomData) {
    const { name, sensor_id, image_url, target_temp, target_humidity } = roomData;
  
    // Wenn Sensor angegeben ist, prüfe, ob er einem anderen Raum zugewiesen ist
    if (sensor_id) {
      const assignedRoom = await roomRepository.getRoomBySensor(sensor_id, roomId);
  
      if (assignedRoom) {
        await roomRepository.removeSensorFromRoom(assignedRoom.room_id);
      }
    }
  
    // Raum aktualisieren
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
  
    return { message: 'Room updated successfully.' };
  }


  async function deleteRoom(roomId) {
    // Verknüpfte Benachrichtigungen löschen
    await roomRepository.deleteNotificationsByRoom(roomId);

    // Raum löschen
    const result = await roomRepository.deleteRoom(roomId);

    if (result.rowsAffected[0] === 0) {
        const error = new Error('Room not found.');
        error.status = 404;
        throw error;
    }

    return { message: 'Room and related notifications deleted successfully.' };
}


async function updateRoomTargets(roomId, targets) {
    // Validierung der Eingabedaten
    if (!targets || (targets.target_temp === undefined && targets.target_humidity === undefined)) {
        const error = new Error('Kein Sollwert zum Aktualisieren angegeben.');
        error.status = 400;
        throw error;
    }

    // Aufruf der Repository-Methode
    const result = await roomRepository.updateRoomTargets(roomId, targets);

    if (!result || result.rowsAffected[0] === 0) {
        const error = new Error(`Raum ${roomId} nicht gefunden`);
        error.status = 404;
        throw error;
        
    }

    return { message: 'Sollwerte erfolgreich aktualisiert' };
}



module.exports = {
    getRooms,
    addRoom,
    updateRoom,
    deleteRoom,
    updateRoomTargets
};
