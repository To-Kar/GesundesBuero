const { app } = require('@azure/functions');

app.http('notifications', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const notifications = [
                {
                    notification_id: 1,
                    room_id: "Room1",
                    sensor_id: "sensor1",
                    type: "Temperatur",
                    description: "Temperatur zu hoch in Raum 1",
                    timestamp: new Date().toISOString(),
                    status: true
                },
                {
                    notification_id: 2,
                    room_id: "Room2",
                    sensor_id: "sensor2",
                    type: "Feuchtigkeit",
                    description: "Luftfeuchtigkeit kritisch in Raum 2",
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    status: true
                },
                {
                    notification_id: 3,
                    room_id: "Room2",
                    sensor_id: "sensor2",
                    type: "Feuchtigkeit",
                    description: "Luftfeuchtigkeit kritisch in Raum 2",
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    status: true
                },
                {
                    notification_id: 4,
                    room_id: "Room2",
                    sensor_id: "sensor2",
                    type: "Feuchtigkeit",
                    description: "Luftfeuchtigkeit zu hoch in Raum 2",
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    status: true
                },
                {
                    notification_id: 5,
                    room_id: "Room2",
                    sensor_id: "sensor2",
                    type: "Feuchtigkeit",
                    description: "Luftfeuchtigkeit kritisch in Raum 2",
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    status: true
                },
                {
                    notification_id: 5,
                    room_id: "Room2",
                    sensor_id: "sensor2",
                    type: "Feuchtigkeit",
                    description: "Luftfeuchtigkeit kritisch in Raum 2",
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    status: true
                },
                {
                    notification_id: 5,
                    room_id: "Room2",
                    sensor_id: "sensor2",
                    type: "Feuchtigkeit",
                    description: "Luftfeuchtigkeit kritisch in Raum 2",
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    status: true
                },
                {
                    notification_id: 5,
                    room_id: "Room2",
                    sensor_id: "sensor2",
                    type: "Feuchtigkeit",
                    description: "Luftfeuchtigkeit kritisch in Raum 2",
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    status: true
                },
                {
                    notification_id: 5,
                    room_id: "Room2",
                    sensor_id: "sensor2",
                    type: "Feuchtigkeit",
                    description: "Luftfeuchtigkeit kritisch in Raum 2",
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    status: true
                }
            ];

            return {
                status: 200,
                jsonBody: notifications,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        } catch (error) {
            context.log.error('Error in notifications:', error);
            
            return {
                status: 500,
                jsonBody: {
                    message: "Ein Fehler ist aufgetreten",
                    error: error.message
                }
            };
        }
    }
});