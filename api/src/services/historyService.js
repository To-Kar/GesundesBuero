const historyRepository = require('../repository/historyRepository');
const httpResponses = require('../utils/httpResponse');

async function getRoomHistory(roomId, startDate, endDate) {
    if (!roomId) {
        throw httpResponses.badRequest('Room ID is required.');
    }

    const history = await historyRepository.getHistoryByRoom(roomId, startDate, endDate);

    if (!history || history.length === 0) {
        throw httpResponses.notFound(`No history found for room ${roomId}`);
    }

    return history;
}

module.exports = {
    getRoomHistory,
};
