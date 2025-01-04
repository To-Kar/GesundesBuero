// app.js
const { app } = require('@azure/functions');

// Funktionen importieren
require('./controllers/historyController');
require('./controllers/notificationController');
require('./controllers/roomController');
require('./controllers/sensorController');
require('./controllers/settingsController');