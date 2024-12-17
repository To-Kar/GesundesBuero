// rooms.js
require('dotenv').config();
const { app } = require('@azure/functions');
const sql = require('mssql');

// Datenbankkonfiguration
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

// Route zum Abrufen von Raumdaten
app.http('room', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'rooms/{roomId?}', // Optionaler roomId-Parameter
    handler: async (request, context) => {
        context.log('Anfrage für rooms erhalten');

        const roomId = request.params.roomId; // roomId aus Routenparameter
        context.log(`Angeforderte roomId: ${roomId}`);

        let pool;
        try {
            // Verbindung zur Datenbank herstellen
            pool = await sql.connect(config);

            if (!pool.connected) {
                return {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Database Connection Error',
                        message: 'Could not establish database connection',
                    }),
                };
            }

            // Abfrage zum Abrufen der Raumdaten
            let query = `
                SELECT 
                    room_id,
                    name,
                    imageURL,
                    target_temp,
                    target_humidity,
                    sensor_id
                FROM ROOM
            `;

            if (roomId) {
                query += ' WHERE room_id = @roomId';
            }

            const dbRequest = pool.request();
            if (roomId) {
                dbRequest.input('roomId', sql.VarChar, roomId);
            }

            const result = await dbRequest.query(query);

            if (result.recordset.length === 0) {
                return {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Not Found',
                        message: roomId ? `Raum ${roomId} nicht gefunden` : 'Keine Räume gefunden',
                    }),
                };
            }

            // Raumdaten zurückgeben
            const rooms = result.recordset;

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify(roomId ? rooms[0] : rooms),
            };
        } catch (error) {
            context.error('Fehler aufgetreten:', error);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Interner Serverfehler',
                    message: error.message,
                }),
            };
        } finally {
            if (pool) {
                await pool.close();
            }
        }
    },
});

// Neue Route für das Aktualisieren von Sollwerten
app.http('updateTargets', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    route: 'rooms/{roomId}/targets',
    handler: async (request, context) => {
        context.log('Anfrage zum Aktualisieren der Sollwerte erhalten');

        const roomId = request.params.roomId; // Raum-ID aus der Route
        const { target_temp, target_humidity } = await request.json(); // Sollwerte aus der Anfrage
        context.log(`Aktualisierung für Raum ${roomId}:`, { target_temp, target_humidity });

        if (!roomId || (!target_temp && !target_humidity)) {
            return {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Bad Request',
                    message: 'Room ID und mindestens ein Sollwert (target_temp oder target_humidity) sind erforderlich',
                }),
            };
        }

        let pool;
        try {
            // Verbindung zur Datenbank herstellen
            pool = await sql.connect(config);

            if (!pool.connected) {
                return {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Database Connection Error',
                        message: 'Could not establish database connection',
                    }),
                };
            }

            // Update-Abfrage für Sollwerte
            const dbRequest = pool.request();
            dbRequest.input('roomId', sql.VarChar, roomId);

            let query = 'UPDATE ROOM SET ';
            if (target_temp !== undefined) {
                query += 'target_temp = @target_temp';
                dbRequest.input('target_temp', sql.Float, target_temp);
            }
            if (target_humidity !== undefined) {
                if (target_temp !== undefined) {
                    query += ', ';
                }
                query += 'target_humidity = @target_humidity';
                dbRequest.input('target_humidity', sql.Float, target_humidity);
            }
            query += ' WHERE room_id = @roomId';

            const result = await dbRequest.query(query);

            if (result.rowsAffected[0] === 0) {
                return {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Not Found',
                        message: `Raum ${roomId} nicht gefunden`,
                    }),
                };
            }

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify({ message: 'Sollwerte erfolgreich aktualisiert' }),
            };
        } catch (error) {
            context.error('Fehler beim Aktualisieren der Sollwerte:', error);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Interner Serverfehler',
                    message: error.message,
                }),
            };
        } finally {
            if (pool) {
                await pool.close();
            }
        }
    },
});

app.http('updateRoom', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'rooms/{roomId}',
  handler: async (request, context) => {
    const roomId = request.params.roomId;
    const { name, sensor_id, image_url, target_temp, target_humidity } = await request.json();

    context.log('Update Payload:', { name, sensor_id, image_url, target_temp, target_humidity });

    if (!roomId) {
      return {
        status: 400,
        body: { error: 'Room ID is required.' },
      };
    }

    let pool;
    try {
      pool = await sql.connect(config);

      // Wenn ein Sensor angegeben wird, prüfe, ob er bereits einem anderen Raum zugewiesen ist
      if (sensor_id) {
        const checkSensorQuery = `
          SELECT room_id
          FROM ROOM
          WHERE sensor_id = @sensor_id AND room_id != @roomId
        `;
        const checkResult = await pool.request()
          .input('sensor_id', sql.VarChar, sensor_id)
          .input('roomId', sql.VarChar, roomId)
          .query(checkSensorQuery);

        if (checkResult.recordset.length > 0) {
          const previousRoomId = checkResult.recordset[0].room_id;

          // Entferne den Sensor aus dem vorherigen Raum
          const removeSensorQuery = `
            UPDATE ROOM
            SET sensor_id = NULL
            WHERE room_id = @previousRoomId
          `;
          await pool.request()
            .input('previousRoomId', sql.VarChar, previousRoomId)
            .query(removeSensorQuery);

          context.log(`Sensor ${sensor_id} wurde aus Raum ${previousRoomId} entfernt.`);
        }
      }

      // Aktualisiere den aktuellen Raum
      const updateFields = [];
      if (name !== undefined) updateFields.push(`name = @name`);
      if (sensor_id !== undefined) updateFields.push(`sensor_id = @sensor_id`);
      if (image_url !== undefined) updateFields.push(`imageURL = @image_url`);
      if (target_temp !== undefined) updateFields.push(`target_temp = @target_temp`);
      if (target_humidity !== undefined) updateFields.push(`target_humidity = @target_humidity`);

      if (updateFields.length === 0) {
        return {
          status: 400,
          body: { error: 'No fields to update.' },
        };
      }

      const query = `
        UPDATE ROOM
        SET ${updateFields.join(', ')}
        WHERE room_id = @roomId
      `;

      const requestDb = pool.request();
      requestDb.input('roomId', sql.VarChar, roomId);
      if (name !== undefined) requestDb.input('name', sql.NVarChar, name);
      if (sensor_id !== undefined) requestDb.input('sensor_id', sql.VarChar, sensor_id);
      if (image_url !== undefined) requestDb.input('image_url', sql.NVarChar, image_url);
      if (target_temp !== undefined) requestDb.input('target_temp', sql.Float, target_temp);
      if (target_humidity !== undefined) requestDb.input('target_humidity', sql.Float, target_humidity);

      const result = await requestDb.query(query);

      if (result.rowsAffected[0] === 0) {
        return {
          status: 404,
          body: { error: 'Room not found.' },
        };
      }

      return {
        status: 200,
        body: { message: 'Room updated successfully.' },
      };
    } catch (error) {
      context.log('Error updating room:', error);
      return {
        status: 500,
        body: { error: 'Internal server error.' },
      };
    } finally {
      if (pool) await pool.close();
    }
  },
});



  app.http('addRoom', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'rooms',
    handler: async (request, context) => {
      const { room_id, name, sensor_id, imageURL, target_temp, target_humidity } = await request.json();
  
      if (!room_id || !name) {
        return {
          status: 400,
          body: { error: 'room_id und name sind erforderlich.' },
        };
      }
  
      let pool;
      try {
        pool = await sql.connect(config);
  
        const query = `
          INSERT INTO ROOM (room_id, name, sensor_id, imageURL, target_temp, target_humidity)
          VALUES (@room_id, @name, @sensor_id, @imageURL, @target_temp, @target_humidity)
        `;
  
        const requestDb = pool.request();
        requestDb.input('room_id', sql.VarChar, room_id);
        requestDb.input('name', sql.NVarChar, name);
        requestDb.input('sensor_id', sql.VarChar, sensor_id || null);
        requestDb.input('imageURL', sql.NVarChar, imageURL || null);
        requestDb.input('target_temp', sql.Float, target_temp || 22);
        requestDb.input('target_humidity', sql.Float, target_humidity || 50);
  
        await requestDb.query(query);
  
        return {
          status: 201,
          body: { message: 'Raum erfolgreich hinzugefügt.' },
        };
      } catch (error) {
        context.log('Fehler beim Hinzufügen des Raums:', error);
        return {
          status: 500,
          body: { error: 'Interner Serverfehler' },
        };
      } finally {
        if (pool) await pool.close();
      }
    },
  });



  app.http('deleteRoom', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'rooms/{roomId}',
    handler: async (request, context) => {
      const roomId = request.params.roomId;
  
      if (!roomId) {
        return {
          status: 400,
          body: { error: 'Room ID is required.' },
        };
      }
  
      let pool;
      try {
        pool = await sql.connect(config);
  
        // 1. Verknüpfte Benachrichtigungen löschen
        const deleteNotificationsQuery = `
          DELETE FROM NOTIFICATION
          WHERE room_id = @roomId
        `;
        await pool.request()
          .input('roomId', sql.VarChar, roomId)
          .query(deleteNotificationsQuery);
  
        // 2. Raum löschen
        const deleteRoomQuery = `
          DELETE FROM ROOM
          WHERE room_id = @roomId
        `;
        const result = await pool.request()
          .input('roomId', sql.VarChar, roomId)
          .query(deleteRoomQuery);
  
        if (result.rowsAffected[0] === 0) {
          return {
            status: 404,
            body: { error: 'Room not found.' },
          };
        }
  
        return {
          status: 200,
          body: { message: 'Room and related notifications deleted successfully.' },
        };
      } catch (error) {
        context.log('Error deleting room:', error);
        return {
          status: 500,
          body: { error: 'Internal server error.' },
        };
      } finally {
        if (pool) await pool.close();
      }
    },
  });
  
  
  
