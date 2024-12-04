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

// Funktion zum Aktualisieren von Daten
async function updateSensorData(data) {
    try {
        const pool = await sql.connect(config);

        // SQL-Abfrage für die Aktualisierung
        const updateQuery = `
            UPDATE SENSOR
            SET temperature = @temperature,
                humidity = @humidity,
                timestamp = @timestamp
            WHERE sensor_id = @sensor_id
        `;

        // Parameter binden und Abfrage ausführen
        const request = pool.request();
        request.input('sensor_id', sql.VarChar, data.sensor_id);
        request.input('temperature', sql.Decimal(5, 2), data.temperature);
        request.input('humidity', sql.Int, data.humidity);
        request.input('timestamp', sql.DateTime, data.timestamp); 

        await request.query(updateQuery);

        console.log(`Daten erfolgreich für Sensor ${data.sensor_id} aktualisiert:`, data);

        await pool.close();
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Tabelle:', error.message);
        throw new Error(error.message);
    }
}

// REST API
app.http('sensor-data', {
    methods: ['PATCH'],
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
            const tableData = await updateSensorData({
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

    
