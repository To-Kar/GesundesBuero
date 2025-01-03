// app.js

const { app } = require('@azure/functions');
const validateJwt = require('./utils/validateJwt');

// Funktionen importieren

require('./controllers/sensorController');
require('./controllers/notificationController')
require('./controllers/settingsController')
require('./controllers/roomController')
require('./controllers/historyController')
