// services/sensorService.js
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
        await notificationService.checkExistingSensorData();
    }

    const interval = await settingsRepository.fetchIntervalFromSettings();
    return { interval };
}


// Prüfen auf Sensorverfügbarkeit
function isSensorActive(lastUpdated, timeout) {
    if (!lastUpdated) return false;

    // Explizite Umwandlung zu UTC, unabhängig von der ursprünglichen Zeitzone
    const lastUpdatedTime = new Date(lastUpdated).getTime();
    const currentTime = Date.now();

    const difference = Math.abs((currentTime + 1000*60*60) - lastUpdatedTime);
    const timeout_computed = timeout * 1000 * 2;

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
    
    const updateInterval = await settingsRepository.fetchIntervalFromSettings();

    const transformedData = [];
        for (const sensor of sensors) {
            const oldIsConnected = sensor.is_connected;
            const newIsConnected = isSensorActive(sensor.last_updated, updateInterval);
            console.log(`Sensor ID: ${sensor.sensor_id}, Last Updated: ${sensor.last_updated}, is_connected: ${newIsConnected}`);

            if (oldIsConnected !== newIsConnected) {
                await sensorRepository.updateSensorStatus(sensor.sensor_id, newIsConnected);
                console.log(`Sensor ${sensor.sensor_id} aktualisiert. old=${oldIsConnected}, new=${newIsConnected}`);
            } else {
                console.log(`Sensor ${sensor.sensor_id} unverändert (is_connected=${oldIsConnected}). Kein Update nötig.`);
            }
            transformedData.push({
                ...sensor,
            });
        }
    
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


async function addSensor(sensorData) {
    const { sensor_id, ip_address } = sensorData;

    if (!sensor_id || !ip_address) {
        throw { status: 400, message: 'sensor_id und ip_address sind erforderlich.' };
    }

    // IP-Validierung
    if (!validateIp(ip_address)) {
        throw { status: 400, message: 'Ungültige IP-Adresse.' };
    }

    // Sensor in die DB schreiben
    const result = await sensorRepository.insertSensor(sensor_id, ip_address);

    return { message: 'Sensor erfolgreich hinzugefügt.', sensor_id, ip_address};
}

async function deleteSensor(sensor_id) {
    if (!sensor_id) {
        throw { status: 400, message: 'sensor_id ist erforderlich.' };
    }

    const result = await sensorRepository.removeSensor(sensor_id);

    if (result.rowsAffected[0] === 0) {
        throw { status: 404, message: 'Sensor nicht gefunden.' };
    }

    return { message: `Sensor ${sensor_id} erfolgreich gelöscht.` };
}



module.exports = {
    updateSensorDataAndFetchInterval,
    getSensorData,
    getAllSensors,
    handleIpUpdate,
    addSensor,
    deleteSensor
};
