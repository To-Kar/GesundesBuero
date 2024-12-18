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

async function createNotification(pool, sensorId, roomId, description, type) {
    try {
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        
        try {
            // Lösche vorherige Benachrichtigung für diesen Raum und Typ
            const deleteRequest = transaction.request();
            deleteRequest.input('room_id', sql.VarChar, roomId);
            deleteRequest.input('type', sql.VarChar, type);
            await deleteRequest.query(`
                DELETE FROM Notification 
                WHERE room_id = @room_id 
                AND type = @type
            `);

            // Generiere eine neue notification_id
            const idRequest = transaction.request();
            const result = await idRequest.query(`
                SELECT ISNULL(MAX(CAST(notification_id AS INT)), 0) + 1 AS next_id 
                FROM Notification
            `);
            const notificationId = result.recordset[0].next_id.toString();

            // Füge neue Benachrichtigung ein
            const insertRequest = transaction.request();
            insertRequest.input('notification_id', sql.VarChar, notificationId);
            insertRequest.input('sensor_id', sql.VarChar, sensorId);
            insertRequest.input('room_id', sql.VarChar, roomId);
            insertRequest.input('type', sql.VarChar, type);
            insertRequest.input('description', sql.NVarChar, description);

            await insertRequest.query(`
                INSERT INTO Notification (
                    notification_id,
                    sensor_id, 
                    room_id, 
                    type,
                    description, 
                    status
                ) VALUES (
                    @notification_id,
                    @sensor_id,
                    @room_id,
                    @type,
                    @description,
                    0
                )
            `);

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Fehler beim Erstellen der Benachrichtigung:', error);
        throw error;
    }
}

async function checkExistingSensorData() {
    let pool;
    try {
        pool = await sql.connect(config);
        
        // Offsets als Schwellenwerte abrufen
        const offsetQuery = 'SELECT temperature_offset, humidity_offset FROM Settings WHERE id = 1;';
        const offsetResult = await pool.request().query(offsetQuery);
        
        if (offsetResult.recordset.length === 0) {
            console.error('Keine Offsets gefunden, verwende Standardwerte');
            var offsets = { temperature_offset: 2, humidity_offset: 5 };
        } else {
            var offsets = offsetResult.recordset[0];
        }
        
        const query = `
            SELECT
                s.sensor_id,
                s.temperature,
                s.humidity,
                r.room_id,
                r.name,
                r.target_temp,
                r.target_humidity
            FROM SENSOR s
            JOIN ROOM r ON s.sensor_id = r.sensor_id
        `;
        
        const result = await pool.request().query(query);
        
        for (const row of result.recordset) {
            const tempDiff = Math.round(Math.abs(row.temperature - row.target_temp));
            const humidityDiff = Math.round(Math.abs(row.humidity - row.target_humidity));
            
            // Temperaturabweichung mit Offset als Schwellenwert prüfen
            if (tempDiff > offsets.temperature_offset) {
                const message = `Raum ${row.name}: Temperatur (${row.temperature}°C) weicht um ${tempDiff.toFixed(1)}°C vom Zielwert (${row.target_temp}°C) ab`;
                await createNotification(pool, row.sensor_id, row.room_id, message, 'Temperatur');
            }
            
            // Feuchtigkeitsabweichung mit Offset als Schwellenwert prüfen
            if (humidityDiff > offsets.humidity_offset) {
                const message = `Raum ${row.name}: Luftfeuchtigkeit (${row.humidity}%) weicht um ${humidityDiff}% vom Zielwert (${row.target_humidity}%) ab`;
                await createNotification(pool, row.sensor_id, row.room_id, message, 'Feuchtigkeit');
            }
        }
        
        console.log('Initiale Prüfung der Sensordaten abgeschlossen');
    } catch (error) {
        console.error('Fehler bei der initialen Prüfung:', error);
        throw error;
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

// GET-Endpunkt für Benachrichtigungen
app.http('notifications', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'notifications',  // Explizite Route definiert
    handler: async (request, context) => {
        let pool;
        try {
            pool = await sql.connect(config);
            const query = `
                SELECT 
                    n.*,
                    r.name as room_name
                FROM Notification n
                LEFT JOIN ROOM r ON n.room_id = r.room_id
                ORDER BY timestamp DESC
            `;
            const request = pool.request();
            const result = await request.query(query);

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                jsonBody: {
                    success: true,
                    data: result.recordset
                }
            };
        } catch (error) {
            context.log.error('Error in notifications:', error);
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                jsonBody: {
                    success: false,
                    message: "Ein Fehler ist aufgetreten",
                    error: error.message,
                    data: []
                }
            };
        } finally {
            if (pool) {
                await pool.close();
            }
        }
    }
});

checkExistingSensorData().catch(error => {
    console.error('Fehler bei der initialen Prüfung:', error);
});

module.exports = {
    createNotification,
    checkExistingSensorData
};