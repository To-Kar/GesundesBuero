const roomRepository = require('../repository/roomRepository');

/**
 * Service zur Verwaltung der Raumdaten.
 * Kapselt die Geschäftslogik und trennt die Controller- und Datenbankschichten.
 */
async function getRooms(roomId = null) {
    try {
        const rooms = await roomRepository.fetchRooms(roomId);

        if (!rooms || rooms.length === 0) {
            return createErrorResponse(404, 'Not Found', roomId ? `Raum ${roomId} nicht gefunden` : 'Keine Räume gefunden');
        }

        return createSuccessResponse(200, rooms);
    } catch (error) {
        console.error('Fehler in getRooms:', error);
        return createErrorResponse(500, 'Interner Serverfehler', error.message);
    }
}

function createSuccessResponse(status, data) {
    return {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify(data),
    };
}

function createErrorResponse(status, error, message) {
    return {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({
            error,
            message,
        }),
    };
}

module.exports = {
    getRooms,
};
