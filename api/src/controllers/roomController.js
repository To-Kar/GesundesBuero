const { app } = require('@azure/functions');
const roomService = require('../services/roomService');


app.http('room', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'rooms/{roomId?}',
    handler: async (request, context) => {
        context.log('Anfrage für rooms erhalten');

        const roomId = request.params.roomId;
        context.log(`Angeforderte roomId: ${roomId}`);

        // Call the Service and handle Response
        const response = await roomService.getRooms(roomId);
        return response;
    },
});
