module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Gesundes Büro API',
    version: '1.0.0',
    description: 'API-Dokumentation für die Funktionen der Anwendung Gesundes Büro.',
  },
  servers: [
    {
      url: '/api',
    },
  ],
  components: {
    schemas: {
      HistoryEntry: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Eindeutige ID des Verlaufs' },
          sensor_id: { type: 'string', description: 'ID des Sensors' },
          temperature: { type: 'number', description: 'Temperatur zu diesem Zeitpunkt' },
          humidity: { type: 'number', description: 'Luftfeuchtigkeit zu diesem Zeitpunkt' },
          co2: { type: 'number', description: 'CO2-Wert zu diesem Zeitpunkt' },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Zeitstempel des Eintrags',
          },
          room_id: { type: 'string', description: 'ID des Raums, zu dem der Verlauf gehört' },
        },
        required: ['sensor_id', 'timestamp'],
      },
      Notification: {
        type: 'object',
        properties: {
          notification_id: { type: 'string', description: 'Eindeutige ID der Benachrichtigung' },
          room_id: { type: 'string', description: 'ID des zugehörigen Raums' },
          sensor_id: { type: 'string', description: 'ID des zugehörigen Sensors' },
          type: { type: 'string', description: 'Typ der Benachrichtigung (z.B. Temperatur, CO2)' },
          description: { type: 'string', description: 'Beschreibung der Benachrichtigung' },
          status: { type: 'number', description: 'Status der Benachrichtigung (z.B. gelesen oder ungelesen)' },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Zeitstempel der Benachrichtigung',
          },
        },
        required: ['notification_id', 'type', 'description', 'timestamp'],
      },
      Room: {
        type: 'object',
        properties: {
          room_id: { type: 'string', description: 'ID des Raums' },
          name: { type: 'string', description: 'Name des Raums' },
          imageURL: { type: 'string', description: 'URL des Raum-Bilds' },
          target_temp: { type: 'number', description: 'Zieltemperatur des Raums' },
          target_humidity: { type: 'number', description: 'Ziel-Luftfeuchtigkeit des Raums' },
          sensor_id: { type: 'string', description: 'Sensor-ID, die dem Raum zugeordnet ist' },
        },
        required: ['room_id', 'name'],
      },
      SensorData: {
        type: 'object',
        properties: {
          sensor_id: { type: 'string', description: 'Eindeutige ID des Sensors' },
          temperature: { type: 'number', description: 'Gemessene Temperatur' },
          humidity: { type: 'number', description: 'Gemessene Luftfeuchtigkeit' },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Zeitpunkt der Messung',
          },
          ip_address: { type: 'string', description: 'IP-Adresse des Sensors' },
          co2: { type: 'number', description: 'Gemessener CO₂-Wert' },
          is_connected: { type: 'boolean', description: 'Verbindungsstatus des Sensors' },
        },
        required: ['sensor_id', 'timestamp'],
      },
      Settings: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'ID der Settings' },
          update_interval: { type: 'number', description: 'Abfrageintervall in Minuten' },
          temperature_offset: { type: 'number', description: 'Temperatur-Offset in Grad' },
          humidity_offset: { type: 'number', description: 'Luftfeuchtigkeits-Offset in Prozent' },
        },
        required: ['id', 'update_interval'],
      },
    },
  },
};
