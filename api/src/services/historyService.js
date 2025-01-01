const historyRepository = require('../repository/historyRepository');
const httpResponses = require('../utils/httpResponse');

async function getRoomHistory(roomId, startDate, endDate) {
    if (!roomId) {
        throw httpResponses.badRequest('Room ID is required.');
    }

    // Standardwerte setzen, falls Parameter fehlen
    const defaultStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Letzte 7 Tage
    const defaultEndDate = new Date();

    const history = await historyRepository.getHistoryByRoom(
        roomId,
        startDate || defaultStartDate,
        endDate || defaultEndDate
    );

    if (!history || history.length === 0) {
        throw httpResponses.notFound(`No history found for room ${roomId}`);
    }

    return history;
}

module.exports = {
    getRoomHistory,
};
