const { app } = require('@azure/functions');
const validateApiKey = require('../utils/validateApiKey'); 
const errorHandlerWrapper = require('../utils/errorHandler'); 
const sensorService = require('../services/sensorService');
const httpResponses = require('../utils/httpResponse');
const { validateJwt, ROLES } = require('../utils/validateJwt');
//const { checkThresholdsAndNotify } = require('./notifications');


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
    handler: errorHandlerWrapper(async (req, context) => {
        await validateJwt(req, context);
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
    handler: errorHandlerWrapper(async (req, context) => {
        // JWT Validierung
        await validateJwt(req, context, ROLES.ADMIN);
        
        const sensor_id = req.params.sensor_id;
        const body = await req.json();
        
        if (!body.ip_address) {
            return httpResponses.badRequest('IP-Adresse muss angegeben werden');
        }

        const result = await sensorService.handleIpUpdate(sensor_id, body.ip_address);
        return httpResponses.success(result);
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
 *                 $ref: '#/components/schemas/Sensor'
 */
app.http('room-sensor-data', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'room-sensor-data/{sensorId?}', 
    handler: errorHandlerWrapper(async (request, context) => {
        await validateJwt(request, context);
        context.log('Anfrage für sensor-data erhalten');

        const sensorId = request.params.sensorId; 
        context.log(`Angeforderte sensorId: ${sensorId}`);

        const result = await sensorService.getSensorData(sensorId);

        return httpResponses.success(result, 200);
    }),
});



/**
 * @swagger
 * /sensors:
 *   post:
 *     summary: Neuen Sensor hinzufügen
 *     tags:
 *       - Sensoren
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sensor'
 *     responses:
 *       201:
 *         description: Sensor erfolgreich hinzugefügt
 */
app.http('addSensor', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'sensors',
    handler: errorHandlerWrapper(async (req, context) => {
        await validateJwt(req, context, ROLES.ADMIN);
        const body = await req.json();
        const result = await sensorService.addSensor(body);
        return httpResponses.success(result, 201);
    }),
});




/**
 * @swagger
 * /sensors/{sensor_id}:
 *   delete:
 *     summary: Sensor löschen
 *     tags:
 *       - Sensoren
 *     parameters:
 *       - in: path
 *         name: sensor_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID des Sensors
 *     responses:
 *       200:
 *         description: Sensor erfolgreich gelöscht
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.http('deleteSensor', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'sensors/{sensor_id}',
    handler: errorHandlerWrapper(async (req, context) => {
        await validateJwt(req, context, ROLES.ADMIN);
        const sensor_id = req.params.sensor_id;
        const result = await sensorService.deleteSensor(sensor_id);
        return httpResponses.success(result, 200);
    }),
});

