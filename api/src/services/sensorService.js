// services/sensorService.js
const sensorRepository = require('../repository/sensorRepository');
const settingsRepository = require('../repository/settingsRepository');
const notificationService = require('./notificationService');

async function checkSensorThresholds(sensorData, settings) {
    const tempDiff = Math.round(Math.abs(sensorData.temperature - sensorData.target_temp));
    const humidityDiff = Math.round(Math.abs(sensorData.humidity - sensorData.target_humidity));
    
    if (tempDiff > settings.temperature_offset) {
        const message = `Raum ${sensorData.name}: Temperatur (${sensorData.temperature}°C) weicht um ${tempDiff.toFixed(1)}°C vom Zielwert (${sensorData.target_temp}°C) ab`;
        await notificationService.createNotification(sensorData.sensor_id, sensorData.room_id, message, 'Temperatur');
    }
    
    if (humidityDiff > settings.humidity_offset) {
        const message = `Raum ${sensorData.name}: Luftfeuchtigkeit (${sensorData.humidity}%) weicht um ${humidityDiff}% vom Zielwert (${sensorData.target_humidity}%) ab`;
        await notificationService.createNotification(sensorData.sensor_id, sensorData.room_id, message, 'Feuchtigkeit');
    }
}

async function updateSensorDataAndFetchInterval(body) {
    const { sensor_id, temperature, humidity, timestamp, co2 } = body;
    
    if (!sensor_id || temperature === undefined || humidity === undefined) {
        throw { status: 400, message: 'Fehler: sensor_id, temperature und humidity sind erforderlich.' };
    }

    // Daten in der DB aktualisieren
    await sensorRepository.updateSensorData({ sensor_id, temperature, humidity, timestamp, co2 });
    
    // Schwellwerte prüfen
    const [settings] = await settingsRepository.fetchOffsets();
    const sensorsWithRoomData = await sensorRepository.getSensorsWithRoomData();
    const sensorData = sensorsWithRoomData.find(s => s.sensor_id === sensor_id);
    
    if (sensorData) {
        await checkSensorThresholds(sensorData, settings);
    }

    const interval = await settingsRepository.fetchIntervalFromSettings();
    return { interval };
}

// Helper-Funktion zur Prüfung der Sensor-Verfügbarkeit
function isSensorActive(lastUpdated, timeout) {
    if (!lastUpdated) return false;

    // Explizite Umwandlung zu UTC, unabhängig von der ursprünglichen Zeitzone
    const lastUpdatedTime = new Date(lastUpdated).getTime();
    const currentTime = Date.now();

    const difference = Math.abs(lastUpdatedTime - currentTime);
    const timeout_computed = timeout * 1000 * 2 + (60 * 60 * 1000);

    console.log(`Sensor geprüft: Last Updated: ${new Date(lastUpdatedTime).toISOString()}, 
    Current Time (UTC): ${new Date(currentTime).toISOString()}, 
    Timeout: ${timeout_computed}, Diff: ${difference}ms`);

    // Prüfen, ob der Sensor innerhalb des Intervalls aktualisiert wurde
    return difference <= timeout_computed;
}




// Sensordaten abrufen und Verfügbarkeit prüfen
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

    // Dynamisches Update-Intervall aus der Datenbank abrufen
    const updateInterval = await settingsRepository.fetchIntervalFromSettings();

    // Sensor-Daten transformieren und is_connected prüfen
    const transformedData = sensors.map(sensor => {

        const isConnected = isSensorActive(sensor.last_updated, updateInterval);
        console.log(`Sensor ID: ${sensor.sensor_id}, Last Updated: ${sensor.last_updated}, is_connected: ${isConnected}`);

        return {
            ...sensor,
            is_connected: isConnected
        };
    });

    return sensorId ? transformedData[0] : transformedData;
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
    handleIpUpdate,
    checkSensorThresholds
};