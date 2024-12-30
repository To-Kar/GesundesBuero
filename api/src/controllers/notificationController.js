// controllers/notificationController.js
const { app } = require('@azure/functions');
const notificationService = require('../services/notificationService');
const httpResponses = require('../utils/httpResponse');
const errorHandlerWrapper = require('../utils/errorHandler');



/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Benachrichtigungen abrufen
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: Erfolgreich abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
app.http('notifications', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'notifications',
    handler: errorHandlerWrapper(async (request, context) => {
        const notifications = await notificationService.getAllNotifications();
        return httpResponses.success({
            success: true,
            data: notifications
        });
    })
});