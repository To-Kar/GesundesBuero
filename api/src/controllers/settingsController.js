const { app } = require('@azure/functions');
const errorHandlerWrapper = require('../utils/errorHandler'); 
const httpResponses = require('../utils/httpResponse');
const settingsService = require('../services/settingsService');
const { validateJwt, ROLES } = require('../utils/validateJwt');

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Abrufen der Anwendungseinstellungen
 *     tags:
 *       - Einstellungen
 *     responses:
 *       200:
 *         description: Erfolgreich die Einstellungen abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 update_interval:
 *                   type: number
 *                   description: Das Abfrageintervall in Minuten
 *                 temperature_offset:
 *                   type: number
 *                   description: Offset für die Temperaturmessung
 *                 humidity_offset:
 *                   type: number
 *                   description: Offset für die Luftfeuchtigkeitsmessung
 */
app.http('settings', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'settings',
    handler: errorHandlerWrapper(async (req, context) => {
        // JWT Validierung
        await validateJwt(req, context);
        const settings = await settingsService.getSettings();
        return httpResponses.success(settings, 200);
    }),
});

/**
 * @swagger
 * /settings/interval:
 *   patch:
 *     summary: Aktualisieren des Abfrageintervalls
 *     tags:
 *       - Einstellungen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               update_interval:
 *                 type: number
 *                 description: Neues Intervall in Minuten
 *     responses:
 *       200:
 *         description: Intervall erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.http('interval', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    route: 'settings/interval',
    handler: errorHandlerWrapper(async (req, context) => {
        // JWT Validierung
        await validateJwt(req, context, ROLES.ADMIN);
        const body = await req.json();

        const result = await settingsService.updateInterval(body);
        
        return httpResponses.success(result, 200);
    }),
});

/**
 * @swagger
 * /settings/offsets:
 *   get:
 *     summary: Abrufen der aktuellen Offsetwerte
 *     tags:
 *       - Einstellungen
 *     responses:
 *       200:
 *         description: Erfolgreich die Offsetwerte abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 temperature_offset:
 *                   type: number
 *                   description: Offset für die Temperaturmessung
 *                 humidity_offset:
 *                   type: number
 *                   description: Offset für die Luftfeuchtigkeitsmessung
 */
app.http('getOffsets', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'settings/offsets',
    handler: errorHandlerWrapper(async (req, context) => {
        // JWT Validierung
        await validateJwt(req, context);
        const result = await settingsService.getOffsets();
        return httpResponses.success(result);
    })
});



/**
 * @swagger
 * /settings/offsets:
 *   patch:
 *     summary: Aktualisieren der Offsetwerte
 *     tags:
 *       - Einstellungen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               temperature_offset:
 *                 type: number
 *                 description: Neuer Temperatur-Offset
 *               humidity_offset:
 *                 type: number
 *                 description: Neuer Luftfeuchtigkeits-Offset
 *     responses:
 *       200:
 *         description: Offsetwerte erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.http('updateOffsets', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    route: 'settings/offsets',
    handler: errorHandlerWrapper(async (req, context) => {
        // JWT Validierung
        await validateJwt(req, context, ROLES.ADMIN);
        const body = await req.json();
        const result = await settingsService.updateOffsets(body);
        return httpResponses.success(result);
    })
});
  
