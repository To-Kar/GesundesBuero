const sql = require('mssql');
const config = require('../config/dbConfig');

async function getHistoryByRoom(roomId, startDate, endDate) {
    const pool = await sql.connect(config);

    const query = `
        SELECT sensor_id, room_id, temperature, humidity, co2, timestamp
        FROM sensor_history
        WHERE room_id = @roomId
          AND timestamp BETWEEN @startDate AND @endDate
        ORDER BY timestamp ASC;
    `;

    const request = pool.request();
    request.input('roomId', sql.VarChar, roomId);
    request.input('startDate', sql.DateTime, startDate);
    request.input('endDate', sql.DateTime, endDate);

    const result = await request.query(query);
    await pool.close();

    return result.recordset; // Gibt die Historien-Daten zurück
}

module.exports = {
    getHistoryByRoom,
};
