const sql = require('mssql');
const config = require('../config/dbConfig');

class DatabasePool {
    constructor() {
        if (!DatabasePool.instance) {
            this.pool = new sql.ConnectionPool(config);
            this.poolConnect = this.pool.connect();
        
            process.on('azurefunctions:runtimeStopped', async () => {
                await this.close();
            });
            
            DatabasePool.instance = this;
        }
        return DatabasePool.instance;
    }

    async getPool() {
        if (!this.poolConnect) {
            this.poolConnect = this.pool.connect();
        }
        return this.poolConnect;
    }

    async close() {
        try {
            if (this.pool) {
                await this.pool.close();
                this.poolConnect = null;
                console.log('Database pool closed successfully');
            }
        } catch (err) {
            console.error('Error closing database pool:', err);
        }
    }
}

const databasePool = new DatabasePool();
module.exports = databasePool;