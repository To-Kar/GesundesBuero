const sql = require('mssql');
const config = require('../config/dbConfig');


async function fetchRooms(roomId = null) {
    let pool;
    try {
        pool = await sql.connect(config);
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
        }

        const dbRequest = pool.request();
        if (roomId) {
            dbRequest.input('roomId', sql.VarChar, roomId);
        }

        const result = await dbRequest.query(query);
        return result.recordset;  
    } catch (error) {
        console.error('Fehler in fetchRooms:', error);
        throw error;  
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

module.exports = {
    fetchRooms,
};
