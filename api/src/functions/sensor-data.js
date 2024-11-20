const { app } = require('@azure/functions');

// Mock-Datenstruktur für Räume mit sensor-data Key-Value Pair (später echte Daten aus Datenbank)
const rooms = {
    "room1": {
        sensorData: {
            temperature: 22.5,
            humidity: 39.0
        }
    },
    "room2": {
        sensorData: {
            temperature: 24.5,
            humidity: 37.0
        }
    },
    "room3": {
        sensorData: {
            temperature: 20.5,
            humidity: 45.0
        }
    },
    "room4": {
        sensorData: {
            temperature: 23.5,
            humidity: 46.0
        }
    },
    "room5": {
        sensorData: {
            temperature: 22.5,
            humidity: 47.0
        }
    }
};

app.http('sensor-data', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'rooms/{roomId}/sensor-data', // Route definieren
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        const roomId = request.params.roomId; // roomId aus der URL

        // überprüfen ob Raum vorhanden
        if (!rooms[roomId]) {
            context.log(`Room with ID ${roomId} not found`); // Anzeige auf Terminal
            return {
                body: { error: `Room with ID ${roomId} not found` }
            };
        }
        // Daten zurückgeben
        context.log(`Sensor data for ${roomId}:`, rooms[roomId].sensorData); //Anzeige auf Terminal
        return {
            body: rooms[roomId].sensorData
        };
    }
});



