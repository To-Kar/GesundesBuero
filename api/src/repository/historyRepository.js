const BaseRepository = require('../db/baseRepository');
const History = require('../models/History');

class HistoryRepository extends BaseRepository {
    constructor() {
        super();
    }

    async getHistoryByRoom(roomId, startDate, endDate) {
        return this.executeQuery(async (pool) => {
            const query = `
                SELECT sensor_id, room_id, temperature, humidity, co2, timestamp
                FROM sensor_history
                WHERE room_id = @roomId
                  AND timestamp BETWEEN @startDate AND @endDate
                ORDER BY timestamp ASC;
            `;
            const request = pool.request();
            request.input('roomId', this.sql.VarChar, roomId);
            request.input('startDate', this.sql.DateTime, startDate);
            request.input('endDate', this.sql.DateTime, endDate);
            
            const result = await request.query(query);
            return result.recordset.map(row => History.fromDb(row));
        });
    }
}

module.exports = new HistoryRepository();