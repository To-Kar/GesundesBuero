require('dotenv').config();
const { app } = require('@azure/functions');
const sql = require('mssql');

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

app.http('settings', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'settings',
    handler: async (req, context) => {
        let pool;
        try {
            pool = await sql.connect(config);
            const query = 'SELECT update_interval FROM Settings WHERE id = 1';
            const result = await pool.request().query(query);
            
            if (result.recordset.length === 0) {
                return {
                    status: 404,
                    body: JSON.stringify({ error: 'Einstellungen nicht gefunden' })
                };
            }

            return {
                status: 200,
                body: JSON.stringify({ update_interval: result.recordset[0].update_interval })
            };
        } catch (error) {
            context.error('Fehler beim Abrufen der Einstellungen:', error);
            return {
                status: 500,
                body: JSON.stringify({ error: 'Interner Serverfehler' })
            };
        } finally {
            if (pool) {
                await pool.close();
            }
        }
    }
});

app.http('interval', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'settings/interval',
  handler: async (req, context) => {
      let body;
      try {
          body = await req.json();
      } catch (error) {
          return {
              status: 400,
              body: JSON.stringify({ error: 'Invalid JSON body' })
          };
      }

      const { update_interval } = body;
      
      if (update_interval === undefined || typeof update_interval !== 'number') {
          return {
              status: 400,
              body: JSON.stringify({ 
                  error: 'Fehlende oder ungültige Daten: update_interval ist erforderlich und muss eine Zahl sein',
                  received: { update_interval, type: typeof update_interval }
              })
          };
      }

      let pool;
      try {
          pool = await sql.connect(config);
          const request = pool.request();
          
          const updateQuery = `
              UPDATE Settings
              SET update_interval = @update_interval
              WHERE id = 1;
              
              SELECT @@ROWCOUNT as affected;
          `;
          
          request.input('update_interval', sql.Int, update_interval);
          const result = await request.query(updateQuery);
          
          if (result.recordset[0].affected === 0) {
              return {
                  status: 404,
                  body: JSON.stringify({ 
                      error: 'Eintrag in der Tabelle Settings mit id = 1 wurde nicht gefunden.' 
                  })
              };
          }

          return {
              status: 200,
              body: JSON.stringify({ 
                  message: 'Intervall erfolgreich aktualisiert',
                  update_interval 
              })
          };
      } catch (err) {
          context.error('Fehler beim Aktualisieren des Intervalls:', err);
          return {
              status: 500,
              body: JSON.stringify({ error: 'Fehler beim Aktualisieren des Intervalls' })
          };
      } finally {
          if (pool) {
              await pool.close();
          }
      }
  }
});



app.http('sensors', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'sensors',
    handler: async (req, context) => {
        let pool;
        try {
            // Verbinde mit der Datenbank
            pool = await sql.connect(config);

            // SQL-Query, um die benötigten Daten zu holen
            const query = `
                SELECT 
                    Sensor.sensor_id,
                    Sensor.ip_address,
                    ROOM.room_id
                FROM 
                    Sensor
                LEFT JOIN 
                    ROOM
                ON 
                    Sensor.sensor_id = ROOM.sensor_id
            `;

            // Führe die Query aus
            const result = await pool.request().query(query);

            // Prüfe, ob Daten vorhanden sind
            if (result.recordset.length === 0) {
                return {
                    status: 404,
                    jsonBody: { error: 'Keine Sensor-Daten gefunden' },
                };
            }

            // Gib die Ergebnisse zurück
            return {
                status: 200,
                jsonBody: result.recordset, // Die Daten als JSON zurückgeben
            };
        } catch (error) {
            context.log('Fehler beim Abrufen der Sensor-Daten:', error.message);
            return {
                status: 500,
                jsonBody: { error: 'Fehler beim Abrufen der Sensor-Daten' },
            };
        } finally {
            if (pool) {
                await pool.close();
            }
        }
    },
});


app.http('ip', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    route: 'sensors/{sensor_id}/ip',
    handler: async (req, context) => {
        let body;
        try {
            body = await req.json(); // JSON-Body auslesen
        } catch (error) {
            return {
                status: 400,
                body: JSON.stringify({ error: 'Ungültiger JSON-Body' })
            };
        }

        const { sensor_id, ip_address } = body;

        // **Debugging hinzufügen**
        console.log('Empfangene Daten im Backend:', { sensor_id, ip_address });

        // Validierung der IP-Adresse
        if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip_address)) {
            return {
                status: 400,
                body: JSON.stringify({ error: 'Ungültige IP-Adresse.' })
            };
        }

        if (!sensor_id) {
            return {
                status: 400,
                body: JSON.stringify({ error: 'sensor_id ist erforderlich.' })
            };
        }

        let pool;
        try {
            pool = await sql.connect(config);
            const query = `
                UPDATE SENSOR
                SET ip_address = @ip_address
                WHERE sensor_id = @sensor_id
            `;
            const request = pool.request();
            request.input('sensor_id', sql.VarChar, sensor_id);
            request.input('ip_address', sql.VarChar, ip_address);
            const result = await request.query(query);

            if (result.rowsAffected[0] === 0) {
                return {
                    status: 404,
                    body: JSON.stringify({ error: 'Sensor nicht gefunden.' })
                };
            }

            return {
                status: 200,
                body: JSON.stringify({ message: 'IP-Adresse erfolgreich aktualisiert.' })
            };
        } catch (error) {
            context.error('Fehler beim Aktualisieren der IP-Adresse:', error);
            return {
                status: 500,
                body: JSON.stringify({ error: 'Interner Serverfehler.' })
            };
        } finally {
            if (pool) {
                await pool.close();
            }
        }
    }
});


