const { app } = require('@azure/functions');
const validateApiKey = require('../utils/validateApiKey'); 
const errorHandlerWrapper = require('../utils/errorHandler'); 

const sensorService = require('../services/sensorService');


const httpResponses = require('../utils/httpResponse');

const validateJwt = require('../utils/validateJwt');
//const { checkThresholdsAndNotify } = require('./notifications');




// GET - Alle Sensoren abrufen
app.http('sensors', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'sensors',
    handler: errorHandlerWrapper(async () => {
        const result = await sensorService.getAllSensors();
        return httpResponses.success(result);
    }),
});

app.http('ip', {
    methods: ['PATCH'],
    authLevel: 'function',
    route: 'sensors/{sensor_id}/ip',
    handler: async (req, context) => {
        try {
            await validateJwt(req, context);  // Token-Validierung

            const body = await req.json();
            const { sensor_id, ip_address } = body;

            console.log('Empfangene Daten im Backend:', { sensor_id, ip_address });

            // Ip Adresse aktualisieren
            const result = await sensorService.handleIpUpdate(sensor_id, ip_address);
            return httpResponses.success(result);
            
        } catch (error) {
            return { status: error.status || 500, body: error.body || 'Fehler bei der Verarbeitung' };
        }
    }
});


// gemessene Sensor-Daten aktualisieren
app.http('sensor-data', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    route: 'sensor/sensor-data',
    handler: errorHandlerWrapper(async (request, context) => {
        context.log(`HTTP function processed request for url "${request.url}"`);

        // API-Key Validierung im Controller
        const apiKeyError = validateApiKey(request, context);
        if (apiKeyError) {
            return apiKeyError; 
        }

        // JSON-Body auslesen
        const body = await request.json();

        // Service-Aufruf zur Verarbeitung der Sensor-Daten
        const result = await sensorService.updateSensorDataAndFetchInterval(body);

        return httpResponses.success(result, 200);
    }),
});

// Raumsensorwerte erhalten
app.http('room-sensor-data', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'room-sensor-data/{sensorId?}', 
    handler: errorHandlerWrapper(async (request, context) => {
        context.log('Anfrage für sensor-data erhalten');

        const sensorId = request.params.sensorId; 
        context.log(`Angeforderte sensorId: ${sensorId}`);

        const result = await sensorService.getSensorData(sensorId);

        return httpResponses.success(result, 200);
    }),
});


app.http('addSensor', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'sensors',
    handler: errorHandlerWrapper(async (req) => {
        const body = await req.json();
        const result = await sensorService.addSensor(body);
        return httpResponses.success(result, 201);
    }),
});

app.http('deleteSensor', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'sensors/{sensor_id}',
    handler: errorHandlerWrapper(async (req) => {
        const sensor_id = req.params.sensor_id;
        const result = await sensorService.deleteSensor(sensor_id);
        return httpResponses.success(result, 200);
    }),
});

