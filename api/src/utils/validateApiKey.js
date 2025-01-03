// Middleware zur Validierung des API-Keys
function validateApiKey(req, context) {

    // Header auslesen
    const clientApiKey = req.headers.get ? req.headers.get('sensor-api-key') : req.headers['sensor-api-key'];
    const serverApiKey = process.env.API_KEY;

    if (!clientApiKey) {
        context.log('API-Key fehlt im Header.');
        return {
            status: 401,
            jsonBody: { error: 'API-Key fehlt. Zugriff verweigert.' },
        };
    }

    if (clientApiKey !== serverApiKey) {
        context.log('Ungültiger API-Key.');
        return {
            status: 403,
            jsonBody: { error: 'Ungültiger API-Key. Zugriff verweigert.' },
        };
    }
    return null; // API-Key validiert, Fehler ist null
}

module.exports = validateApiKey;