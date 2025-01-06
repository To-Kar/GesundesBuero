const { app } = require('@azure/functions');
const roomService = require('../services/roomService');
const httpResponses = require('../utils/httpResponse');
const errorHandlerWrapper = require('../utils/errorHandler'); 
const { validateJwt, ROLES } = require('../utils/validateJwt');




app.http('room', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'rooms/{roomId?}', 
    handler: errorHandlerWrapper(async (request, context) => {

        const roomId = request.params.roomId;
        const rooms = await roomService.getRooms(roomId);
        return httpResponses.success(roomId ? rooms[0] : rooms);
    }),
});


app.http('addRoom', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'rooms',
    handler: errorHandlerWrapper(async (request, context) => {
        // JWT Validierung

        const roomData = await request.json();

        // Validierung
        if (!roomData.room_id || !roomData.name) {
            return httpResponses.badRequest('room_id und name sind erforderlich.');
        }
        // Service-Aufruf Raum hinzufügen
        const result = await roomService.addRoom(roomData);

        return httpResponses.success({ message: result.message }, 201);
    }),
});



app.http('updateRoom', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    route: 'rooms/{roomId}',
    handler: errorHandlerWrapper(async (request, context) => {
      // JWT Validierung

      const roomId = request.params.roomId;
      const roomData = await request.json();
  
      if (!roomId) {
        return httpResponses.badRequest('Room ID is required.');
      }
  
      // Service-Aufruf zur Aktualisierung des Raums
      const result = await roomService.updateRoom(roomId, roomData);
  
      return httpResponses.success({ message: result.message }, 200);
    }),
  });



  app.http('deleteRoom', {
    methods: ['DELETE'],
    route: 'rooms/{roomId}',
    handler: errorHandlerWrapper(async (request, context) => {
        // JWT Validierung

        const roomId = request.params.roomId;

        if (!roomId) {
            return httpResponses.badRequest('Room ID is required.');
        }

        // Service-Aufruf zur Löschung des Raums
        const result = await roomService.deleteRoom(roomId);
        return httpResponses.success({ message: result.message }, 200);
    }),
});



app.http('updateTargets', {
    methods: ['PATCH'],
    route: 'rooms/{roomId}/targets',
    handler: errorHandlerWrapper(async (request, context) => {
        // JWT Validierung

        const roomId = request.params.roomId;
        const { target_temp, target_humidity } = await request.json();

        if (!roomId || (!target_temp && !target_humidity)) {
            return httpResponses.badRequest(
                'Room ID und mindestens ein Sollwert (target_temp oder target_humidity) sind erforderlich'
            );
        }

        // Service-Aufruf zur Aktualisierung der Sollwerte
        const result = await roomService.updateRoomTargets(roomId, { target_temp, target_humidity });
        return httpResponses.success(result, 200);
    }),
});