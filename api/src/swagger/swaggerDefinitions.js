module.exports = {
    openapi: '3.0.0',
    info: {
      title: 'Gesundes Büro API',
      version: '1.0.0',
      description: 'API-Dokumentation für die Funktionen der Anwendung Gesundes Büro.'
    },

    servers: [
      {
        url: '/api',
      }
    ],

    components: {
      schemas: {
        HistoryEntry: {
          type: 'object',
          properties: {
              timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Zeitstempel des Eintrags',
              },
              temperature: {
                  type: 'number',
                  description: 'Temperatur zu diesem Zeitpunkt',
              },
              humidity: {
                  type: 'number',
                  description: 'Luftfeuchtigkeit zu diesem Zeitpunkt',
              },
              co2: {
                  type: 'number',
                  description: 'CO2-Wert zu diesem Zeitpunkt',
              },
          },
          required: ['timestamp', 'temperature', 'humidity'],
        },
        Notification: {
          type: 'object',
          properties: {
            notification_id: { type: 'string', description: 'Eindeutige ID der Benachrichtigung' },
            message: { type: 'string', description: 'Nachricht der Benachrichtigung' },
            created_at: { type: 'string', format: 'date-time', description: 'Erstellungszeitpunkt der Benachrichtigung' }
          },
          required: ['notification_id', 'message']
        },
        Room: {
          type: 'object',
          properties: {
            room_id: { type: 'string', description: 'ID des Raums' },
            name: { type: 'string', description: 'Name des Raums' },
            imageURL: { type: 'string', description: 'URL des Raum-Bilds' },
            target_temp: { type: 'number', description: 'Zieltemperatur des Raums' },
            target_humidity: { type: 'number', description: 'Ziel-Luftfeuchtigkeit des Raums' },
            sensor_id: { type: 'string', description: 'Sensor-ID, die dem Raum zugeordnet ist' }
          },
          required: ['room_id', 'name']
        },
        Settings: {
          type: 'object',
          properties: {
            update_interval: { type: 'number', description: 'Abfrageintervall in Minuten' },
            temperature_offset: { type: 'number', description: 'Temperatur-Offset in Grad' },
            humidity_offset: { type: 'number', description: 'Luftfeuchtigkeits-Offset in Prozent' }
          },
          required: ['update_interval']
        },
        Sensor: {
          type: 'object',
          properties: {
            sensor_id: { type: 'string', description: 'Eindeutige ID des Sensors' },
            ip_address: { type: 'string', description: 'IP-Adresse des Sensors' },
            temperature: { type: 'number', description: 'Gemessene Temperatur' },
            humidity: { type: 'number', description: 'Gemessene Luftfeuchtigkeit' },
            co2: { type: 'number', description: 'Gemessener CO₂-Wert' },
            is_connected: { type: 'boolean', description: 'Verbindungsstatus des Sensors' }
          },
          required: ['sensor_id']
        },
        SensorData: {
          type: 'object',
          properties: {
            sensor_id: { type: 'string', description: 'Eindeutige ID des Sensors' },
            timestamp: { type: 'string', format: 'date-time', description: 'Zeitpunkt der Messung' },
            temperature: { type: 'number', description: 'Gemessene Temperatur' },
            humidity: { type: 'number', description: 'Gemessene Luftfeuchtigkeit' },
            co2: { type: 'number', description: 'Gemessener CO₂-Wert' }
          },
          required: ['sensor_id']
        }
      }
    }
  };