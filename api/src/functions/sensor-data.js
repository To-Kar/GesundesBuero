const { app } = require('@azure/functions');
const sql = require('mssql');

// Database configuration
const config = {
    server: '',
    database: 'GesundesBuero',
    user: '',
    password: '',
    options: {
        encrypt: true,
        trustServerCertificate: false,
    },
    port: 1433,
};

// REST API to fetch sensor data
app.http('sensor-data', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'rooms/{roomId?}/sensor-data', // Make roomId optional
    handler: async (request, context) => {
        const roomId = request.params.roomId; // Get roomId from request, may be undefined
        context.log(`Received request for roomId: ${roomId}`);

        let pool;
        try {
            // Connect to the database
            pool = await sql.connect(config);
            context.log('Connected to the database.');

            // Build the query
            let query = `
                SELECT 
                    R.target_temp, 
                    R.target_humidity,
                    R.room_id
                FROM ROOM R
            `;

           

            context.log(`Executing query: ${query}`);

            // Create database request
            const dbRequest = pool.request();

            // Add roomId input parameter if necessary
            if (roomId) {
                dbRequest.input('roomId', sql.VarChar, roomId);
            }

            // Execute the query
            const result = await dbRequest.query(query);

            context.log(`Query result: ${JSON.stringify(result.recordset)}`);

            // Handle no results found
            if (result.recordset.length === 0) {
                context.log(`No data found for roomId: ${roomId}`);
                return {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                    jsonBody: { error: `Room with ID ${roomId} not found.` },
                };
            }

            // Return results
            if (roomId) {
                context.log(`Fetched data for roomId: ${roomId}:`, result.recordset[0]);
                return {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                    jsonBody: result.recordset[0],
                };
            } else {
                context.log('Fetched data for all rooms.');
                return {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                    jsonBody: result.recordset,
                };
            }

        } catch (error) {
            // Handle errors
            context.log(`Error occurred: ${error.message}`);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                jsonBody: { error: 'Internal Server Error', details: error.message },
            };
        } finally {
            // Close the database connection
            if (pool) {
                pool.close();
            }
        }
    },
});
