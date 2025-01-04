// controllers/notificationController.js
const { app } = require('@azure/functions');
const notificationService = require('../services/notificationService');
const httpResponses = require('../utils/httpResponse');
const errorHandlerWrapper = require('../utils/errorHandler');


app.http('notifications', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'notifications',
    handler: errorHandlerWrapper(async (req, context) => {
        // JWT Validierung

        const notifications = await notificationService.getAllNotifications();
        return httpResponses.success({
            success: true,
            data: notifications
        });
    })
});