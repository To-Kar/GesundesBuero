const sensorRepository = require('../repository/sensorRepository');
const settingsRepository = require('../repository/settingsRepository');
const notificationService = require('./notificationService');

async function updateSensorDataAndFetchInterval(body) {
    const { sensor_id, temperature, humidity, timestamp, co2 } = body;
   
    if (!sensor_id || temperature === undefined || humidity === undefined) {
        throw { status: 400, message: 'Fehler: sensor_id, temperature und humidity sind erforderlich.' };
    }
    
    // Daten in der DB aktualisieren
    await sensorRepository.updateSensorData({ sensor_id, temperature, humidity, timestamp, co2 });
   
    // Benachrichtigungen prüfen
    const [settings] = await settingsRepository.fetchOffsets();
    const sensorsWithRoomData = await sensorRepository.getSensorsWithRoomData();
    const sensorData = sensorsWithRoomData.find(s => s.sensor_id === sensor_id);
   
    if (sensorData) {
        // Nutze direkt checkExistingSensorData statt checkSensorThresholds
        await notificationService.checkExistingSensorData();
    }

    const interval = await settingsRepository.fetchIntervalFromSettings();
    return { interval };
}

async function getSensorData(sensorId) {
    const sensors = await sensorRepository.fetchSensorData(sensorId);
   
    if (!sensors || sensors.length === 0) {
        throw {
            status: 404,
            message: sensorId ?
                `Sensordaten für Sensor ${sensorId} nicht gefunden` :
                'Keine Sensordaten gefunden'
        };
    }
   
    return sensorId ? sensors[0] : sensors;
}

async function getAllSensors() {
    const sensors = await sensorRepository.fetchAllSensors();
    if (!sensors || sensors.length === 0) {
        throw { status: 404, message: 'Keine Sensor-Daten gefunden.' };
    }
    return sensors;
}

async function handleIpUpdate(sensor_id, ip_address) {
    if (!validateIp(ip_address)) {
        throw { status: 400, message: 'Ungültige IP-Adresse.' };
    }
    if (!sensor_id) {
        throw { status: 400, message: 'sensor_id ist erforderlich.' };
    }
    const result = await sensorRepository.updateSensorIp(sensor_id, ip_address);
    if (result.rowsAffected[0] === 0) {
        throw { status: 404, message: 'Sensor nicht gefunden.' };
    }
   
    return { message: 'IP-Adresse erfolgreich aktualisiert.' };
}

function validateIp(ip_address) {
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip_address);
}

module.exports = {
    updateSensorDataAndFetchInterval,
    getSensorData,
    getAllSensors,
    handleIpUpdate
};