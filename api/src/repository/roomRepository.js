const sql = require('mssql');
const config = require('../config/dbConfig');

async function fetchRooms(roomId) {
    let pool;
    pool = await sql.connect(config);

    const dbRequest = pool.request();
    let query = `
        SELECT 
            room_id,
            name,
            imageURL,
            target_temp,
            target_humidity,
            sensor_id
        FROM ROOM
    `;

    if (roomId) {
        query += ' WHERE room_id = @roomId';
        dbRequest.input('roomId', sql.VarChar, roomId);
    }

    const result = await dbRequest.query(query);
    return result.recordset;
}


async function saveRoom(roomData) {
    const { room_id, name, sensor_id, image_url, target_temp, target_humidity } = roomData;

    let pool;
    try {
        pool = await sql.connect(config);
        const query = `
          INSERT INTO ROOM (room_id, name, sensor_id, imageURL, target_temp, target_humidity)
          VALUES (@room_id, @name, @sensor_id, @image_url, @target_temp, @target_humidity)
        `;

        const requestDb = pool.request();
        requestDb.input('room_id', sql.VarChar, room_id);
        requestDb.input('name', sql.NVarChar, name);
        requestDb.input('sensor_id', sql.VarChar, sensor_id || null);
        requestDb.input('image_url', sql.NVarChar, image_url || null);
        requestDb.input('target_temp', sql.Float, target_temp || 22);
        requestDb.input('target_humidity', sql.Float, target_humidity || 50);

        const result = await requestDb.query(query);
        return result;
    } catch (error) {
        console.error('Fehler in saveRoom:', error);
        throw error;
    } finally {
        if (pool) await pool.close();
    }
}


async function getRoomBySensor(sensor_id, excludeRoomId) {
    const pool = await sql.connect(config);
    const query = `
      SELECT room_id
      FROM ROOM
      WHERE sensor_id = @sensor_id AND room_id != @roomId
    `;
    const result = await pool.request()
      .input('sensor_id', sql.VarChar, sensor_id)
      .input('roomId', sql.VarChar, excludeRoomId)
      .query(query);
  
    await pool.close();
    return result.recordset[0];  // Entweder Raum oder undefined
}
  
async function removeSensorFromRoom(roomId) {
    const pool = await sql.connect(config);
    const query = `
      UPDATE ROOM
      SET sensor_id = NULL
      WHERE room_id = @roomId
    `;
    await pool.request()
      .input('roomId', sql.VarChar, roomId)
      .query(query);
  
    await pool.close();
}
  
async function updateRoom(roomId, roomData) {
    const pool = await sql.connect(config);
  
    const updateFields = [];
    const requestDb = pool.request();
  
    if (roomData.name !== undefined) {
      updateFields.push(`name = @name`);
      requestDb.input('name', sql.NVarChar, roomData.name);
    }
    if (roomData.sensor_id !== undefined) {
      updateFields.push(`sensor_id = @sensor_id`);
      requestDb.input('sensor_id', sql.VarChar, roomData.sensor_id);
    }
    if (roomData.image_url !== undefined) {
      updateFields.push(`imageURL = @image_url`);
      requestDb.input('image_url', sql.NVarChar, roomData.image_url);
    }
    if (roomData.target_temp !== undefined) {
      updateFields.push(`target_temp = @target_temp`);
      requestDb.input('target_temp', sql.Float, roomData.target_temp);
    }
    if (roomData.target_humidity !== undefined) {
      updateFields.push(`target_humidity = @target_humidity`);
      requestDb.input('target_humidity', sql.Float, roomData.target_humidity);
    }
  
    const query = `
      UPDATE ROOM
      SET ${updateFields.join(', ')}
      WHERE room_id = @roomId
    `;
    requestDb.input('roomId', sql.VarChar, roomId);
  
    const result = await requestDb.query(query);
  
    await pool.close();
    return result;
}


async function deleteNotificationsByRoom(roomId) {
    const pool = await sql.connect(config);
    const query = `
        DELETE FROM NOTIFICATION
        WHERE room_id = @roomId
    `;
    await pool.request()
        .input('roomId', sql.VarChar, roomId)
        .query(query);
    
    await pool.close();
}

async function deleteRoom(roomId) {
    const pool = await sql.connect(config);
    const query = `
        DELETE FROM ROOM
        WHERE room_id = @roomId
    `;
    const result = await pool.request()
        .input('roomId', sql.VarChar, roomId)
        .query(query);

    await pool.close();
    return result;
}


async function updateRoomTargets(roomId, targets) {
    const pool = await sql.connect(config);

    if (!pool.connected) {
        throw { status: 503, message: 'Could not establish database connection' };
    }

    const dbRequest = pool.request();
    dbRequest.input('roomId', sql.VarChar, roomId);

    let query = 'UPDATE ROOM SET ';
    const updateFields = [];

    if (targets.target_temp !== undefined) {
        updateFields.push('target_temp = @target_temp');
        dbRequest.input('target_temp', sql.Float, targets.target_temp);
    }
    if (targets.target_humidity !== undefined) {
        updateFields.push('target_humidity = @target_humidity');
        dbRequest.input('target_humidity', sql.Float, targets.target_humidity);
    }

    query += updateFields.join(', ');
    query += ' WHERE room_id = @roomId';

    const result = await dbRequest.query(query);

    await pool.close();
    return result;
}


async function updateRoomTargets(roomId, targets) {
    let pool;
    try {
        pool = await sql.connect(config);

        if (!pool.connected) {
            throw { status: 503, message: 'Could not establish database connection' };
        }

        const dbRequest = pool.request();
        dbRequest.input('roomId', sql.VarChar, roomId);

        let query = 'UPDATE ROOM SET ';
        const updateFields = [];

        if (targets.target_temp !== undefined) {
            updateFields.push('target_temp = @target_temp');
            dbRequest.input('target_temp', sql.Float, targets.target_temp);
        }
        if (targets.target_humidity !== undefined) {
            updateFields.push('target_humidity = @target_humidity');
            dbRequest.input('target_humidity', sql.Float, targets.target_humidity);
        }

        query += updateFields.join(', ');
        query += ' WHERE room_id = @roomId';

        const result = await dbRequest.query(query);
        return result;
  
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}


module.exports = {
    fetchRooms,
    saveRoom,
    getRoomBySensor,
    removeSensorFromRoom,
    updateRoom,
    deleteNotificationsByRoom,
    deleteRoom,
    updateRoomTargets,
};
