const { app } = require('@azure/functions');
const historyService = require('../services/historyService');
const httpResponses = require('../utils/httpResponse');
const errorHandlerWrapper = require('../utils/errorHandler');

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


