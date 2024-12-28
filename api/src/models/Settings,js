class Settings {
    constructor({ id, update_interval = null, offset = null, temperature_offset = null, humidity_offset = null }) {
        if (!id) throw new Error('id ist erforderlich');
        
        this.id = id;
        this.update_interval = update_interval;
        this.offset = offset;
        this.temperature_offset = temperature_offset;
        this.humidity_offset = humidity_offset;
    }

    static fromDb(row) {
        return new Settings({
            id: row.id,
            update_interval: row.update_interval,
            offset: row.offset,
            temperature_offset: row.temperature_offset,
            humidity_offset: row.humidity_offset
        });
    }
}

module.exports = Settings;
