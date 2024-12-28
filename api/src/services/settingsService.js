const settingsRepository = require('../repository/settingsRepository');


async function getSettings() {
    const settings = await settingsRepository.fetchSettings();

    if (!settings) {
        throw { status: 404, message: 'Einstellungen nicht gefunden' };
    }

    return { update_interval: settings.update_interval };
}



async function updateInterval(body) {
    const { update_interval } = body;

    // Validierung der Eingabe
    if (update_interval === undefined || typeof update_interval !== 'number') {
        throw { 
            status: 400, 
            message: 'Fehlende oder ungültige Daten: update_interval ist erforderlich und muss eine Zahl sein',
            received: { update_interval, type: typeof update_interval }
        };
    }

    // Weitergabe an das Repository
    const affectedRows = await settingsRepository.updateInterval(update_interval);

    if (affectedRows === 0) {
        throw { 
            status: 404, 
            message: 'Eintrag in der Tabelle Settings mit id = 1 wurde nicht gefunden.' 
        };
    }

    return { 
        message: 'Intervall erfolgreich aktualisiert', 
        update_interval 
    };
}


async function getOffsets() {
    const result = await settingsRepository.fetchOffsets();

    if (!result || result.length === 0) {
        throw { status: 404, message: 'Einstellungen nicht gefunden.' };
    }

    return result[0];
}



async function updateOffsets(body) {
    const { temperature_offset, humidity_offset } = body;

    // Validierung der Eingabedaten
    if (
        temperature_offset === undefined ||
        humidity_offset === undefined ||
        typeof temperature_offset !== 'number' ||
        typeof humidity_offset !== 'number'
    ) {
        throw {
            status: 400,
            message: 'Ungültige Daten: temperature_offset und humidity_offset sind erforderlich und müssen Zahlen sein.'
        };
    }

    // Repository-Funktion aufrufen, um die Offsets zu aktualisieren
    const result = await settingsRepository.updateOffsets(temperature_offset, humidity_offset);

    if (result.rowsAffected[0] === 0) {
        throw { status: 404, message: 'Einstellungen nicht gefunden.' };
    }

    return { message: 'Offsets erfolgreich aktualisiert.' };
}



module.exports = {
    getSettings,
    updateInterval,
    getOffsets,
    updateOffsets,


};
