const { app } = require('@azure/functions');

const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.VITE_CLIENT_ID;

app.http('httpTrigger1', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        
        // Log für Tenant und Client ID
        console.log(`Tenant_ID: ${TENANT_ID}`);
        console.log(`Client_ID: ${CLIENT_ID}`);
        
        // Query-Parameter richtig auslesen
        const name = request.query.name || await request.text() || 'world';

        // Rückgabe von Tenant und Client ID in der Response
        return {
            body: `Hello, ${name}!\nTenant_ID: ${TENANT_ID}\nClient_ID: ${CLIENT_ID}`
        };
    }
});
