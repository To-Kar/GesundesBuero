const notificationRepository = require('../repository/notificationRepository');
const settingsRepository = require('../repository/settingsRepository');
const sensorRepository = require('../repository/sensorRepository');
const Notification = require('../models/Notification');

async function createNotification(sensorId, roomId, description, type) {
    try {
        await notificationRepository.deleteByRoomAndType(roomId, type);
        const notificationId = await notificationRepository.getNextNotificationId();
        
        const notification = new Notification({
            notification_id: notificationId,
            sensor_id: sensorId,
            room_id: roomId,
            type: type,
            description: description,
            timestamp: new Date()
        });

        return await notificationRepository.createNotification(notification);
    } catch (error) {
        console.error('Fehler beim Erstellen der Benachrichtigung:', error);
        throw error;
    }
}

async function getAllNotifications() {
    return await notificationRepository.getAllWithRoomNames();
}

function checkCO2Level(co2Value) {
    if (co2Value == null || isNaN(co2Value)) return "N/A";
    if (co2Value < 800) return "Gut";
    if (co2Value >= 800 && co2Value <= 1000) return "Ok";
    return "Hoch";
}

async function checkSensorData(sensorData, settings) {
    // Temperatur- und Feuchtigkeitsprüfung
    const tempDiff = Math.round(Math.abs(sensorData.temperature - sensorData.target_temp));
    const humidityDiff = Math.round(Math.abs(sensorData.humidity - sensorData.target_humidity));
    
    if (tempDiff > settings.temperature_offset) {
        const message = `Temperatur (${sensorData.temperature}°C) weicht um ${tempDiff.toFixed(1)}°C vom Zielwert (${sensorData.target_temp}°C) ab`;
        await createNotification(sensorData.sensor_id, sensorData.room_id, message, 'Temperatur');
    }
    
    if (humidityDiff > settings.humidity_offset) {
        const message = `Luftfeuchtigkeit (${sensorData.humidity}%) weicht um ${humidityDiff}% vom Zielwert (${sensorData.target_humidity}%) ab`;
        await createNotification(sensorData.sensor_id, sensorData.room_id, message, 'Feuchtigkeit');
    }

    if (sensorData.co2 != null && !isNaN(sensorData.co2)) {
        const co2Status = checkCO2Level(sensorData.co2);
        if (co2Status === "Hoch") {
            const message = `CO₂-Wert ist zu hoch (${sensorData.co2} ppm)`;
            await createNotification(
                sensorData.sensor_id,
                sensorData.room_id,
                message,
                'CO2'
            );
        }
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

async function updateNotificationStatus(notificationId, status) {
    return await notificationRepository.updateNotificationStatus(notificationId, status);
}

module.exports = {
    createNotification,
    getAllNotifications,
    checkExistingSensorData,
    updateNotificationStatus
};