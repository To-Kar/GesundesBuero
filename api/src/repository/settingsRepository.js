const BaseRepository = require('../db/baseRepository');

class SettingsRepository extends BaseRepository {
    constructor() {
        super();
    }

    async fetchIntervalFromSettings() {
        return this.executeQuery(async (pool) => {
            const selectQuery = `SELECT update_interval FROM Settings WHERE id = 1`;
            const result = await pool.request().query(selectQuery);
            
            if (result.recordset.length === 0) {
                throw new Error('Keine Daten in der Tabelle Settings gefunden.');
            }
            
            return result.recordset[0].update_interval;
        });
    }

    async fetchSettings() {
        return this.executeQuery(async (pool) => {
            const query = 'SELECT update_interval FROM Settings WHERE id = 1';
            const result = await pool.request().query(query);
            return result.recordset[0];
        });
    }

    async updateInterval(update_interval) {
        return this.executeQuery(async (pool) => {
            const request = pool.request();
            const updateQuery = `
                UPDATE Settings
                SET update_interval = @update_interval
                WHERE id = 1;
                SELECT @@ROWCOUNT as affected;
            `;
            request.input('update_interval', this.sql.Int, update_interval);
            const result = await request.query(updateQuery);
            return result.recordset[0]?.affected || 0;
        });
    }

    async fetchOffsets() {
        return this.executeQuery(async (pool) => {
            const query = 'SELECT temperature_offset, humidity_offset FROM Settings WHERE id = 1;';
            const result = await pool.request().query(query);
            return result.recordset;
        });
    }

    async updateOffsets(temperature_offset, humidity_offset) {
        return this.executeQuery(async (pool) => {
            const query = `
                UPDATE Settings
                SET temperature_offset = @temperature_offset,
                    humidity_offset = @humidity_offset
                WHERE id = 1;
            `;
            const request = pool.request();
            request.input('temperature_offset', this.sql.Float, temperature_offset);
            request.input('humidity_offset', this.sql.Float, humidity_offset);
            
            return await request.query(query);
        });
    }
}

module.exports = new SettingsRepository();