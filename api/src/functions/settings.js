const { app } = require('@azure/functions');
const sql = require('mssql');

// Verbindungsinformationen zur Azure SQL Datenbank
const dbConfig = {
  user: '',
  password: '',
  server: '',
  database: '',
  options: {
    encrypt: true, // Erforderlich für Azure SQL Verbindungen
    trustServerCertificate: false
  },
  port: 1433
};

// HTTP Trigger Funktion, um Sensordaten vom Frontend zu empfangen
app.http('sensorFunction', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (req, res) => {
    console.log('HTTP-Trigger aufgerufen: Verarbeitung der Sensordaten');

    const { sensor_id, temperature, humidity } = req.body;

    if (!sensor_id || temperature === undefined || humidity === undefined) {
      res.status(400).json({ error: 'Fehlende Daten: sensor_id, temperature und humidity sind erforderlich' });
      return;
    }

    try {
      // Verbindung zur Azure SQL Datenbank herstellen
      const pool = await sql.connect(dbConfig);
      const request = pool.request();

      const insertQuery = `
        IF EXISTS (SELECT 1 FROM SENSOR WHERE sensor_id = @sensor_id)
        BEGIN
          UPDATE SENSOR SET temperature = @temperature, humidity = @humidity, timestamp = GETDATE() WHERE sensor_id = @sensor_id
        END
        ELSE
        BEGIN
          INSERT INTO SENSOR (sensor_id, temperature, humidity, timestamp) VALUES (@sensor_id, @temperature, @humidity, GETDATE())
        END
      `;

      request.input('sensor_id', sql.VarChar, sensor_id);
      request.input('temperature', sql.Decimal(5, 2), temperature);
      request.input('humidity', sql.TinyInt, humidity);

      await request.query(insertQuery);

      res.status(200).json({ message: 'Daten erfolgreich gespeichert' });
    } catch (err) {
      console.error('Fehler beim Speichern der Daten:', err);
      res.status(500).json({ error: 'Fehler beim Speichern der Daten' });
    }
  }
});
