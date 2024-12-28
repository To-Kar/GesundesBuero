// services/notificationService.js
const notificationRepository = require('../repository/notificationRepository');
const settingsRepository = require('../repository/settingsRepository');
const sensorRepository = require('../repository/sensorRepository');

async function createNotification(sensorId, roomId, description, type) {
    try {
        await notificationRepository.deleteByRoomAndType(roomId, type);
        const notificationId = await notificationRepository.getNextNotificationId();
        await notificationRepository.createNotification({
            notificationId,
            sensorId,
            roomId,
            type,
            description
        });
    } catch (error) {
        console.error('Fehler beim Erstellen der Benachrichtigung:', error);
        throw error;
    }
}

async function getAllNotifications() {
    return await notificationRepository.getAllWithRoomNames();
}

async function checkSensorData(sensorData, settings) {
    const tempDiff = Math.round(Math.abs(sensorData.temperature - sensorData.target_temp));
    const humidityDiff = Math.round(Math.abs(sensorData.humidity - sensorData.target_humidity));
   
    if (tempDiff > settings.temperature_offset) {
        const message = `Raum ${sensorData.name}: Temperatur (${sensorData.temperature}°C) weicht um ${tempDiff.toFixed(1)}°C vom Zielwert (${sensorData.target_temp}°C) ab`;
        await createNotification(sensorData.sensor_id, sensorData.room_id, message, 'Temperatur');
    }
   
    if (humidityDiff > settings.humidity_offset) {
        const message = `Raum ${sensorData.name}: Luftfeuchtigkeit (${sensorData.humidity}%) weicht um ${humidityDiff}% vom Zielwert (${sensorData.target_humidity}%) ab`;
        await createNotification(sensorData.sensor_id, sensorData.room_id, message, 'Feuchtigkeit');
    }
}

async function checkExistingSensorData() {
    try {
        console.log('Starting checkExistingSensorData...');
       
        const [settings] = await settingsRepository.fetchOffsets();
        const sensorsWithRoomData = await sensorRepository.getSensorsWithRoomData();
       
        for (const sensorData of sensorsWithRoomData) {
            await checkSensorData(sensorData, settings);
        }
       
        console.log('checkExistingSensorData completed');
    } catch (error) {
        console.error('Error in checkExistingSensorData:', error);
        throw error;
    }
}


module.exports = {
    createNotification,
    getAllNotifications,
    checkExistingSensorData
};