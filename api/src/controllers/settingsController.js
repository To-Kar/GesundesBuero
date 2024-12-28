const { app } = require('@azure/functions');
const errorHandlerWrapper = require('../utils/errorHandler'); 
const httpResponses = require('../utils/httpResponse');
const settingsService = require('../services/settingsService');


app.http('settings', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'settings',
    handler: errorHandlerWrapper(async () => {
        const settings = await settingsService.getSettings();
        return httpResponses.success(settings, 200);
    }),
});


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


app.http('getOffsets', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'settings/offsets',
    handler: errorHandlerWrapper(async () => {
        const result = await settingsService.getOffsets();
        return httpResponses.success(result);
    })
});



// PATCH - Offsets aktualisieren
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
  