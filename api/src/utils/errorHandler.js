const httpResponses = require('./httpResponse');

function errorHandlerWrapper(fn) {
    return async (request, context) => {
        try {
            // Führt Hauptlogik aus
            return await fn(request, context);
        } catch (error) {
            context.log('Fehler im Controller:', error);

            // Spezifische Fehlerbehandlung
            switch (error.status) {
                case 400:
                    return httpResponses.badRequest(error.message || 'Ungültige Anfrage.');
                case 401:
                    return httpResponses.unauthorized(error.message || 'Nicht autorisiert.');
                case 403:
                    return httpResponses.forbidden(error.message || 'Zugriff verweigert.');
                case 404:
                    return httpResponses.notFound(error.message || 'Nicht gefunden.');
                case 409:
                    return httpResponses.error(error.message || 'Konflikt – Ressource existiert bereits.', 409);
                default:
                    return httpResponses.error(
                        error.message || 'Interner Serverfehler',
                        error.status || 500
                    );
            }
        }
    };
}

module.exports = errorHandlerWrapper;
