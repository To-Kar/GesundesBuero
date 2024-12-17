require('dotenv').config();
const { app } = require('@azure/functions');
const sql = require('mssql');

// Datenbankkonfiguration
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: false,
        connectionTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Hilfsfunktion für Datenbankabfragen
async function executeQuery(context, query, params = {}) {
    let pool;
    try {
        pool = await sql.connect(config);
        const request = pool.request();

        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        const result = await request.query(query);
        return result;
    } catch (error) {
        context.error('Database query error:', error);
        throw error;
    } finally {
        if (pool) {
            try {
                await pool.close();
            } catch (err) {
                context.error('Error closing pool:', err);
            }
        }
    }
}

// Haupt-Handler
app.http('room-sensor-data', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'room-sensor-data/{sensorId?}',
    handler: async (request, context) => {
        context.log('Anfrage für Raum-Sensordaten erhalten');

        try {
            const sensorId = request.params.sensorId;
            context.log(`Angeforderte sensorId: ${sensorId}`);

            // update_interval aus der SETTINGS-Tabelle holen (Fallback 300 Sekunden)
            const settingsResult = await executeQuery(
                context,
                'SELECT update_interval FROM SETTINGS WHERE id = 1'
            );
            const updateInterval = settingsResult.recordset[0]?.update_interval || 300;

            // Abfrage zum Abrufen der Sensordaten mit Berechnung von is_connected
            const sensorQuery = `
                SELECT 
                    s.sensor_id,
                    s.temperature AS current_temp,
                    s.humidity AS current_humidity,
                    s.timestamp AS last_updated,
                    CAST(DATEDIFF(SECOND, s.timestamp, GETDATE()) as int) as time_diff,
                    CAST(
                        CASE 
                            WHEN DATEDIFF(SECOND, s.timestamp, GETDATE()) <= (@updateInterval + 60) THEN 1 
                            ELSE 0 
                        END 
                    AS int) AS is_connected
                FROM SENSOR s
                ${sensorId ? 'WHERE s.sensor_id = @sensorId' : ''}
            `;

            const sensorResult = await executeQuery(context, sensorQuery, {
                updateInterval: updateInterval,
                sensorId: sensorId
            });

            context.log('Debug sensor data:', sensorResult.recordset.map(record => ({
                sensor_id: record.sensor_id,
                time_diff: record.time_diff,
                is_connected: record.is_connected,
            })));

            if (!sensorResult.recordset.length) {
                return {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    },
                    body: JSON.stringify({
                        error: 'Not Found',
                        message: sensorId ? `Sensordaten für Sensor ${sensorId} nicht gefunden` : 'Keine Sensordaten gefunden'
                    })
                };
            }

            // Falls sensorId angegeben, nur das einzelne Objekt zurückgeben
            const responseData = sensorId ? sensorResult.recordset[0] : sensorResult.recordset;

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify(responseData)
            };

        } catch (error) {
            context.error('Fehler aufgetreten:', error);
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({
                    error: 'Database Error',
                    message: 'Failed to retrieve sensor data',
                    details: error.message
                })
            };
        }
    }
});
