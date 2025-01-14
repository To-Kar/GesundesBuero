const sql = require('mssql');
const databasePool = require('./pool');

class BaseRepository {
    constructor() {
        this.sql = sql;
    }

    async executeQuery(callback) {
        try {
            await databasePool.getPool();
            const pool = databasePool.pool;
            return await callback(pool);
        } catch (error) {
            console.error(`Database error in ${this.constructor.name}:`, error);
            throw {
                status: error.status || 500,
                message: error.message,
                details: error
            };
        }
    }
}

module.exports = BaseRepository;