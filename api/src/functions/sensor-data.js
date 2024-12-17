require('dotenv').config();

const { app } = require('@azure/functions');
const sql = require('mssql');
//const { checkThresholdsAndNotify } = require('./notifications');


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

        //await checkThresholdsAndNotify(data);  -> für was verwendet????

        console.log(`Daten erfolgreich für Sensor ${data.sensor_id} aktualisiert:`, data);

        await pool.close();
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Tabelle:', error.message);
        throw new Error(error.message);
    }
}

// Funktion zum Abrufen der Einstellungen (Intervall)
async function fetchIntervalFromSettings() {
    try {
        const pool = await sql.connect(config);

        // SQL-Abfrage für das Intervall
        const selectQuery = `SELECT update_interval FROM Settings WHERE id = 1`; 
        const result = await pool.request().query(selectQuery);

        // Prüfen, ob Daten vorhanden sind
        if (result.recordset.length === 0) {
            throw new Error('Keine Daten in der Tabelle Settings gefunden.');
        }

        const interval = result.recordset[0].update_interval;

        await pool.close();

        return interval;
    } catch (error) {
        console.error('Fehler beim Abrufen des Intervalls:', error.message);
        throw new Error(error.message);
    }
}

// Middleware zur Validierung des API-Keys
function validateApiKey(req, context) {

    // Header auslesen
    const clientApiKey = req.headers.get ? req.headers.get('sensor-api-key') : req.headers['sensor-api-key'];
    const serverApiKey = process.env.API_KEY;

    if (!clientApiKey) {
        context.log('API-Key fehlt im Header.');
        return {
            status: 401,
            jsonBody: { error: 'API-Key fehlt. Zugriff verweigert.' },
        };
    }

    if (clientApiKey !== serverApiKey) {
        context.log('Ungültiger API-Key.');
        return {
            status: 403,
            jsonBody: { error: 'Ungültiger API-Key. Zugriff verweigert.' },
        };
    }
    return null; // API-Key validiert, Fehler ist null
}

// REST API
app.http('sensor-data', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    route: 'sensor/sensor-data',
    handler: async (request, context) => {
        context.log(`HTTP function processed request for url "${request.url}"`);
    
        // API-Key Validierung
        const apiKeyError = validateApiKey(request, context);
        if (apiKeyError) {
            return apiKeyError; // Bei Fehler sofort zurückgeben
        }

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
            await updateSensorData({
                sensor_id,
                temperature,
                humidity,
                timestamp,
            });

            // Intervall aus der Tabelle Settings abrufen
            const interval = await fetchIntervalFromSettings();
    
            context.log('interval:', interval);
            return {
                status: 200,
                jsonBody: {
                    interval: interval,
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

    
