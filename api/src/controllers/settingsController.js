const { app } = require('@azure/functions');
const errorHandlerWrapper = require('../utils/errorHandler'); 
const httpResponses = require('../utils/httpResponse');
const settingsService = require('../services/settingsService');

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
 *                 interval:
 *                   type: number
 *                 offsets:
 *                   type: object
 */
app.http('settings', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'settings',
    handler: errorHandlerWrapper(async () => {
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
 *               interval:
 *                 type: number
 *                 description: Das neue Intervall in Minuten
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
    handler: errorHandlerWrapper(async (req) => {
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
 *                 humidity_offset:
 *                   type: number
 */
app.http('getOffsets', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'settings/offsets',
    handler: errorHandlerWrapper(async () => {
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
 *                 description: Temperatur-Offset in Grad
 *               humidity_offset:
 *                 type: number
 *                 description: Luftfeuchtigkeits-Offset in Prozent
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
    handler: errorHandlerWrapper(async (req) => {
        const body = await req.json();
        const result = await settingsService.updateOffsets(body);
        return httpResponses.success(result);
    })
});
  
