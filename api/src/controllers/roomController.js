const { app } = require('@azure/functions');
const roomService = require('../services/roomService');
const httpResponses = require('../utils/httpResponse');
const errorHandlerWrapper = require('../utils/errorHandler'); 
const { validateJwt, ROLES } = require('../utils/validateJwt');
const Room = require('../models/Room');



/**
 * @swagger
 * /rooms/{roomId?}:
 *   get:
 *     summary: Räume abrufen
 *     tags:
 *       - Räume
 *     parameters:
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID eines spezifischen Raums. Wenn nicht angegeben, werden alle Räume zurückgegeben.
 *     responses:
 *       200:
 *         description: Erfolgreich abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   room_id:
 *                     type: string
 *                     description: Die eindeutige ID des Raums.
 *                   name:
 *                     type: string
 *                     description: Der Name des Raums.
 *                   imageURL:
 *                     type: string
 *                     description: Die URL des Bildes, das den Raum darstellt.
 *                   target_temp:
 *                     type: number
 *                     description: Zieltemperatur des Raums.
 *                   target_humidity:
 *                     type: number
 *                     description: Ziel-Luftfeuchtigkeit des Raums.
 *                   sensor_id:
 *                     type: string
 *                     description: Die ID des Sensors, der dem Raum zugeordnet ist.
 */
app.http('room', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'rooms/{roomId?}', 
    handler: errorHandlerWrapper(async (request, context) => {
        await validateJwt(request, context);
        const roomId = request.params.roomId;
        const rooms = await roomService.getRooms(roomId);
        return httpResponses.success(roomId ? rooms[0].toJSON() : rooms.map(r => r.toJSON()));
    }),
});

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Raum hinzufügen
 *     tags:
 *       - Räume
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       201:
 *         description: Raum erfolgreich hinzugefügt
 */
app.http('addRoom', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'rooms',
    handler: errorHandlerWrapper(async (request, context) => {
        // JWT Validierung
        await validateJwt(request, context, ROLES.ADMIN);
        const roomData = await request.json();

        // Validierung
        Room.validate(roomData);
        // Service-Aufruf Raum hinzufügen
        const result = await roomService.addRoom(roomData);

        return httpResponses.success({ message: result.message }, 201);
    }),
});


/**
 * @swagger
  * /rooms/{roomId}:
 *   patch:
 *     summary: Raum aktualisieren
 *     tags:
 *       - Räume
 *     parameters:
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID des Raums, der aktualisiert werden soll
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               target_temp:
 *                 type: number
 *               target_humidity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Raum erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.http('updateRoom', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    route: 'rooms/{roomId}',
    handler: errorHandlerWrapper(async (request, context) => {
      // JWT Validierung
      await validateJwt(request, context, ROLES.ADMIN);
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


/**
 * @swagger
 * /rooms/{roomId}:
 *   delete:
 *     summary: Raum löschen
 *     tags:
 *       - Räume
 *     parameters:
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID des Raums, der gelöscht werden soll
 *     responses:
 *       200:
 *         description: Raum erfolgreich gelöscht
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
  app.http('deleteRoom', {
    methods: ['DELETE'],
    route: 'rooms/{roomId}',
    handler: errorHandlerWrapper(async (request, context) => {
        // JWT Validierung
        await validateJwt(request, context, ROLES.ADMIN);
        const roomId = request.params.roomId;

        if (!roomId) {
            return httpResponses.badRequest('Room ID is required.');
        }

        // Service-Aufruf zur Löschung des Raums
        const result = await roomService.deleteRoom(roomId);
        return httpResponses.success({ message: result.message }, 200);
    }),
});


/**
 * @swagger
 * /rooms/{roomId}/targets:
 *   patch:
 *     summary: Zielwerte für Temperatur und Luftfeuchtigkeit aktualisieren
 *     tags:
 *       - Räume
 *     parameters:
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID des Raums, dessen Zielwerte aktualisiert werden sollen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               target_temp:
 *                 type: number
 *               target_humidity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Zielwerte erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.http('updateTargets', {
    methods: ['PATCH'],
    route: 'rooms/{roomId}/targets',
    handler: errorHandlerWrapper(async (request, context) => {
        // JWT Validierung
        await validateJwt(request, context);
        const roomId = request.params.roomId;
        const targetData = await request.json();

        Room.validate({
            room_id: roomId,
            name: 'Temporary',
            ...targetData
        });

        // Service-Aufruf zur Aktualisierung der Sollwerte
        const result = await roomService.updateRoomTargets(roomId, targetData);
        return httpResponses.success(result, 200);
    }),
});