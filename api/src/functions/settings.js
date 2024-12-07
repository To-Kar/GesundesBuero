const { app } = require('@azure/functions');
const sql = require('mssql');

// Verbindungsinformationen zur Azure SQL-Datenbank
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  port: 1433,
};

// HTTP Trigger Funktion, um das Intervall zu aktualisieren
app.http('updateInterval', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  handler: async (req, res) => {
    console.log('HTTP-Trigger aufgerufen: Aktualisierung des Intervalls');

    const { update_interval } = req.body;

    if (update_interval === undefined || typeof update_interval !== 'number') {
      res.status(400).json({ error: 'Fehlende oder ungültige Daten: update_interval ist erforderlich und muss eine Zahl sein' });
      return;
    }

    try {
      const pool = await sql.connect(config);
      console.log('Datenbankverbindung erfolgreich hergestellt.');
      const request = pool.request();
      
      const updateQuery = `
        UPDATE Settings
        SET update_interval = @update_interval
        WHERE id = 1
      `;
      console.log('Update-Query wird ausgeführt:', updateQuery);
      
      request.input('update_interval', sql.Int, update_interval);
      const result = await request.query(updateQuery);
      
      console.log('Query-Ergebnis:', result);
    
      if (result.rowsAffected[0] === 0) {
        res.status(404).json({ error: 'Eintrag in der Tabelle Settings mit id = 1 wurde nicht gefunden.' });
      } else {
        res.status(200).json({ message: 'Intervall erfolgreich aktualisiert', update_interval });
      }
      await pool.close();
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Intervalls:', err);
      res.status(500).json({ error: 'Fehler beim Aktualisieren des Intervalls' });
    }
    
  },

  
});


app.http('getSettings', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const query = 'SELECT update_interval FROM Settings WHERE id = 1';
      const result = await pool.request().query(query);

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Einstellungen nicht gefunden' });
      }

      res.status(200).json({ update_interval: result.recordset[0].update_interval });
    } catch (error) {
      console.error('Fehler beim Abrufen der Einstellungen:', error.message);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  },
});


