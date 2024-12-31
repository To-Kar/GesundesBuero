const { app } = require('@azure/functions');
const historyService = require('../services/historyService');
const httpResponses = require('../utils/httpResponse');
const errorHandlerWrapper = require('../utils/errorHandler');

// GET /api/room-history/:roomId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
app.http('getRoomHistory', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'room-history/{roomId}', // Endpunkt für die Raumhistorie
    handler: errorHandlerWrapper(async (request) => {
        const { roomId } = request.params;
        const { startDate, endDate } = request.query;

        if (!roomId) {
            return httpResponses.badRequest('Room ID is required.');
        }

        const history = await historyService.getRoomHistory(roomId, startDate, endDate);
        return httpResponses.success(history);
    }),
});
