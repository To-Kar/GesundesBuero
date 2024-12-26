// sensor-data.js
require('dotenv').config();

const { app } = require('@azure/functions');
const sql = require('mssql');

// Datenbankkonfiguration (verwende Umgebungsvariablen für sensible Daten)
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

app.http('room-sensor-data', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'room-sensor-data/{sensorId?}', // Optionaler sensorId-Parameter
    handler: async (request, context) => {
        context.log('Anfrage für sensor-data erhalten');

        const sensorId = request.params.sensorId; // sensorId aus Routenparameter
        context.log(`Angeforderte sensorId: ${sensorId}`);

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

            // Abfrage zum Abrufen der Sensordaten
            let query = `
                SELECT 
                    sensor_id,
                    temperature AS current_temp,
                    humidity AS current_humidity,
                    timestamp AS last_updated
                FROM SENSOR
            `;

            if (sensorId) {
                query += ' WHERE sensor_id = @sensorId';
            }

            const dbRequest = pool.request();
            if (sensorId) {
                dbRequest.input('sensorId', sql.VarChar, sensorId);
            }

            const result = await dbRequest.query(query);

            if (result.recordset.length === 0) {
                return {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Not Found',
                        message: sensorId ? `Sensordaten für Sensor ${sensorId} nicht gefunden` : 'Keine Sensordaten gefunden',
                    }),
                };
            }

            // Sensordaten zurückgeben
            const sensors = result.recordset;

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify(sensorId ? sensors[0] : sensors),
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



