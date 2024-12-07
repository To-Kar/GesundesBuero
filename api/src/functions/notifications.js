require('dotenv').config();

const { app } = require('@azure/functions');
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: false,
    },
    port: 1433,
};

app.http('notifications', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        let pool
        try {
            pool = await sql.connect(config);

            const query = `
                    SELECT * FROM Notification
                        `

            const request = pool.request();
            const result = await request.query(query);

            return {
                status: 200,
                jsonBody: result.recordset,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

        } catch (error) {
            context.log.error('Error in notifications:', error);
            return {
                status: 500,
                jsonBody: {
                    message: "Ein Fehler ist aufgetreten",
                    error: error.message
                }
            };
        }finally {
            if (pool) {
                await pool.close();
            }
        }
    }
});