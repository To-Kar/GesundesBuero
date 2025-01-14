const { app } = require('@azure/functions');
const notificationService = require('../services/notificationService');
const httpResponses = require('../utils/httpResponse');
const errorHandlerWrapper = require('../utils/errorHandler');
const { validateJwt } = require('../utils/validateJwt');

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
    handler: errorHandlerWrapper(async (req, context) => {
        await validateJwt(req, context);
        const notifications = await notificationService.getAllNotifications();
        return httpResponses.success({
            success: true,
            data: notifications.map(notification => notification.toJSON())
        });
    })
});

/**
 * @swagger
 * /notifications/{notificationId}/status:
 *   put:
 *     summary: Benachrichtigungsstatus aktualisieren
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status erfolgreich aktualisiert
 */
app.http('updateNotificationStatus', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'notifications/{notificationId}/status',
    handler: errorHandlerWrapper(async (req, context) => {
        await validateJwt(req, context);
        
        const notificationId = context.req.params.notificationId;
        const { status } = await req.json();
        
        if (typeof status !== 'boolean') {
            return httpResponses.badRequest('Status muss ein Boolean sein');
        }
        
        await notificationService.updateNotificationStatus(notificationId, status);
        return httpResponses.success({
            success: true,
            message: 'Status erfolgreich aktualisiert'
        });
    })
});