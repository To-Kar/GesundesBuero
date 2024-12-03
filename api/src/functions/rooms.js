// rooms.js

const { app } = require('@azure/functions');
const sql = require('mssql');

// Datenbankkonfiguration (verwende Umgebungsvariablen für sensible Daten)
const config = {
    server: '',
    database: '',
    user: '',
    password: '', // Passwort aus Umgebungsvariable
    options: {
        encrypt: true,
        trustServerCertificate: false,
    },
    port: 1433,
};

app.http('room', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'rooms/{roomId?}', // Optionaler roomId-Parameter
    handler: async (request, context) => {
        context.log('Anfrage für rooms erhalten');

        const roomId = request.params.roomId; // roomId aus Routenparameter
        context.log(`Angeforderte roomId: ${roomId}`);

        let pool;
        try {
            // Verbindung zur Datenbank herstellen
            pool = await sql.connect(config);

            if (!pool.connected) {
                return {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Database Connection Error',
                        message: 'Could not establish database connection',
                    }),
                };
            }

            // Abfrage zum Abrufen der Raumdaten
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

            if (result.recordset.length === 0) {
                return {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Not Found',
                        message: roomId ? `Raum ${roomId} nicht gefunden` : 'Keine Räume gefunden',
                    }),
                };
            }

            // Raumdaten zurückgeben
            const rooms = result.recordset;

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify(roomId ? rooms[0] : rooms),
            };
        } catch (error) {
            context.error('Fehler aufgetreten:', error);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Interner Serverfehler',
                    message: error.message,
                }),
            };
        } finally {
            if (pool) {
                await pool.close();
            }
        }
    },
});
