const { app } = require('@azure/functions');
const validateApiKey = require('../utils/validateApiKey'); 
const errorHandlerWrapper = require('../utils/errorHandler'); 
const sensorService = require('../services/sensorService');
const httpResponses = require('../utils/httpResponse');


/**
 * @swagger
 * /sensors:
 *   get:
 *     summary: Alle Sensoren abrufen
 *     tags:
 *       - Sensoren
 *     responses:
 *       200:
 *         description: Erfolgreich alle Sensoren abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sensor'
 */
app.http('sensors', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'sensors',
    handler: errorHandlerWrapper(async () => {
        const result = await sensorService.getAllSensors();
        return httpResponses.success(result);
    }),
});

/**
 * @swagger
 * /sensors/{sensor_id}/ip:
 *   patch:
 *     summary: IP-Adresse eines Sensors aktualisieren
 *     tags:
 *       - Sensoren
 *     parameters:
 *       - in: path
 *         name: sensor_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID des Sensors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sensor_id:
 *                 type: string
 *               ip_address:
 *                 type: string
 *     responses:
 *       200:
 *         description: IP-Adresse erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.http('ip', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    route: 'sensors/{sensor_id}/ip',
    handler: errorHandlerWrapper(async (req) => {
        const body = await req.json();
        const { sensor_id, ip_address } = body;

        console.log('Empfangene Daten im Backend:', { sensor_id, ip_address });

        // Ip Adresse aktualisieren
        const result = await sensorService.handleIpUpdate(sensor_id, ip_address);

        return httpResponses.success(result)
    })
});


/**
 * @swagger
 * /sensor/sensor-data:
 *   patch:
 *     summary: Sensordaten aktualisieren
 *     tags:
 *       - Sensoren
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sensor_id:
 *                 type: string
 *               data:
 *                 type: object
 *                 description: Sensordaten (z.B. Temperatur, Feuchtigkeit, etc.)
 *     responses:
 *       200:
 *         description: Sensordaten erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
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


/**
 * @swagger
 * /room-sensor-data/{sensorId?}:
 *   get:
 *     summary: Sensordaten für einen bestimmten Sensor abrufen
 *     tags:
 *       - Sensoren
 *     parameters:
 *       - in: path
 *         name: sensorId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID des Sensors (optional)
 *     responses:
 *       200:
 *         description: Sensordaten erfolgreich abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SensorData'
 */
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

