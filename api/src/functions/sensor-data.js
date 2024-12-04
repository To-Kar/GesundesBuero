require('dotenv').config();

const { app } = require('@azure/functions');
const sql = require('mssql');


// Verbindungsdetails zur Azure SQL-Datenbank
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: false,
    },
};


// Funktion zum Schreiben von Daten
async function insertSensorData(data) {
    try {
        // Verbindung zur Datenbank herstellen
        const pool = await sql.connect(config);

        const insertData = {
            sensor_id: data.sensor_id,
            temperature: data.temperature,
            humidity: data.humidity,
            timestamp: new Date(), // aktueller Zeitstempel
        };

        // SQL-Abfrage für das Einfügen
        const insertQuery = `
            INSERT INTO SENSOR (sensor_id, temperature, humidity, timestamp)
            VALUES (@sensor_id, @temperature, @humidity, @timestamp)
        `;

        // Daten einfügen
        await pool.request()
            .input('sensor_id', sql.VarChar, insertData.sensor_id)
            .input('temperature', sql.Decimal(5, 2), insertData.temperature)
            .input('humidity', sql.Int, insertData.humidity)
            .input('timestamp', sql.DateTime, insertData.timestamp || null)
            .query(insertQuery);

        console.log(`Daten erfolgreich in die Tabelle SENSOR geschrieben:`, data);

        
        await pool.close();

        
    } catch (error) {
        console.error('Fehler beim Schreiben in die Tabelle:', error.message);
        throw new Error(error.message);
    }
}

// REST API
app.http('sensor-data', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'sensor/sensor-data',
    handler: async (request, context) => {
        context.log(`HTTP function processed request for url "${request.url}"`);
    
        try {
            // JSON aus dem Request lesen
            const body = await request.json(); 
    
            // Body-Parameter auslesen
            const { sensor_id, temperature, humidity, timestamp } = body;
    
            // Logging for Debugging
            context.log('Request body:', body);
            context.log('sensor_id:', sensor_id);
            context.log('temperature:', temperature);
            context.log('humidity:', humidity);
            context.log('timestamp:', timestamp);
    
            // Validierung
            if (!sensor_id || temperature === undefined || humidity === undefined) {
                context.log('Validation failed: Missing required fields.');
                return {
                    status: 400,
                    jsonBody: { error: 'Fehler: sensor_id, temperature und humidity sind erforderlich.' },
                };
            }
    
            // Daten in die Datenbank schreiben
            const tableData = await insertSensorData({
                sensor_id,
                temperature,
                humidity,
                timestamp,
            });
    
      
            return {
                status: 200,
                jsonBody: {
                    message: `Daten erfolgreich für Sensor ${sensor_id} gespeichert.`,
                    table: tableData,
                },
            };
        } catch (error) {
            context.log('Fehler in der API:', error.message);
            return {
                status: 500,
                jsonBody: { error: 'Fehler beim Verarbeiten der Anfrage.' },
            };
        }
    },
});

    
