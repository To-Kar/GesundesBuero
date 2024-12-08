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

app.http('getSettings', {
    methods: ['GET'],
    authLevel: 'anonymous',
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

app.http('updateInterval', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
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
