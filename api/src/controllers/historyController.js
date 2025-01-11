const { app } = require('@azure/functions');
const historyService = require('../services/historyService');
const httpResponses = require('../utils/httpResponse');
const errorHandlerWrapper = require('../utils/errorHandler');


/**
 * @swagger
 * /room-history/{roomId}:
 *   get:
 *     summary: Historische Daten für einen Raum abrufen
 *     tags:
 *       - Historie
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID des Raums, dessen Historie abgerufen werden soll
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Startdatum für den Historie-Zeitraum (z. B. 2023-01-01T00:00:00Z)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Enddatum für den Historie-Zeitraum (z. B. 2023-12-31T23:59:59Z)
 *     responses:
 *       200:
 *         description: Erfolgreich die Historie abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HistoryEntry'
 *       400:
 *         description: Fehlende oder ungültige Parameter
 *       500:
 *         description: Interner Serverfehler
 */
app.http('getRoomHistory', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'room-history/{roomId}', // Endpunkt für die Raumhistorie
    handler: errorHandlerWrapper(async (request) => {
        const { roomId } = request.params;

        // Query-Parameter manuell aus der URL extrahieren
        const url = new URL(request.url, `http://${request.headers.host}`);
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        // Debugging: Logge die empfangenen Werte
        console.log("Empfangene Parameter:", { roomId, startDate, endDate });
        console.log("Request URL:", request.url);
        console.log("Query Params:", url.searchParams);
        console.log("Path Params:", request.params);

        if (!roomId) {
            return httpResponses.badRequest('Room ID is required.');
        }

        if (!startDate || !endDate) {
            console.error("Fehlende Parameter:", { startDate, endDate });
            return httpResponses.badRequest('StartDate and EndDate are required.');
        }

        const history = await historyService.getRoomHistory(roomId, startDate, endDate);
        return httpResponses.success(history);
    }),
});


