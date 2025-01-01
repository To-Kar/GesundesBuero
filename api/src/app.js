// app.js

const { app } = require('@azure/functions');

// Funktionen importieren

require('./controllers/sensorController');
require('./controllers/notificationController')
require('./controllers/settingsController')
require('./controllers/roomController')
require('./controllers/historyController')
