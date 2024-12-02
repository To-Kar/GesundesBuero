const { app } = require('@azure/functions');
const sql = require('mssql');

// Database configuration using environment variables
//I will add the environment variables to the azure workflow later so it knows to load them
const config = {
    server: '',
    database: '',
    user: '',
    password: '',
    options: {
        encrypt: true,
        trustServerCertificate: false,
    },
    port: 1433,
};

app.http('sensor-data', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'sensor-data',
    handler: async (request, context) => {
        // Log environment check (remove in production)
        context.log('Database connection details:', {
            server: config.server,
            database: config.database,
            user: config.user,
            // Never log passwords
            hasPassword: !!config.password
        });

        const roomId = request.query.get('roomId'); // Get roomId from query parameter
        context.log(`Received request for roomId: ${roomId}`);

        let pool;
        try {
            // Connect to the database
            pool = await sql.connect(config);
            
            if (!pool.connected) {
                return {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Database Connection Error',
                        message: 'Could not establish database connection'
                    })
                };
            }

            // Build the query to join ROOM and SENSOR tables
            let query = `
                SELECT 
                    R.room_id,
                    R.name,
                    R.imageURL,
                    R.target_temp,
                    R.target_humidity,
                    S.temperature as current_temp,
                    S.humidity as current_humidity,
                    S.timestamp as last_updated
                FROM ROOM R
                LEFT JOIN SENSOR S ON R.sensor_id = S.sensor_id
            `;

            if (roomId) {
                query += ' WHERE R.room_id = @roomId';
            }

            // Add ordering to get the most recent data
            query += ' ORDER BY R.room_id';

            const request = pool.request();
            if (roomId) {
                request.input('roomId', sql.VarChar, roomId);
            }

            const result = await request.query(query);

            if (result.recordset.length === 0) {
                return {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Not Found',
                        message: roomId ? `Room ${roomId} not found` : 'No rooms found'
                    })
                };
            }

            // Transform the data for the response
            const transformedData = result.recordset.map(room => ({
                room_id: room.room_id,
                name: room.name,
                imageURL: room.imageURL,
                target_temp: room.target_temp,
                target_humidity: room.target_humidity,
                current_temp: room.current_temp,
                current_humidity: room.current_humidity,
                last_updated: room.last_updated,
                status: {
                    temp_status: getTempStatus(room.current_temp, room.target_temp),
                    humidity_status: getHumidityStatus(room.current_humidity, room.target_humidity)
                }
            }));

            return {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify(roomId ? transformedData[0] : transformedData)
            };

        } catch (error) {
            context.error('Error occurred:', error);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Internal Server Error',
                    message: error.message
                })
            };
        } finally {
            if (pool) {
                await pool.close();
            }
        }
    }
});

// Helper functions to determine status
function getTempStatus(current, target) {
    if (!current || !target) return 'unknown';
    const diff = Math.abs(current - target);
    if (diff <= 1) return 'optimal';
    if (diff <= 2) return 'warning';
    return 'critical';
}

function getHumidityStatus(current, target) {
    if (!current || !target) return 'unknown';
    const diff = Math.abs(current - target);
    if (diff <= 5) return 'optimal';
    if (diff <= 10) return 'warning';
    return 'critical';
}
