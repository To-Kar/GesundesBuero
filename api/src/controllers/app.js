// app.js

const { app } = require('@azure/functions');

// Funktionen importieren

require('./sensorController');

require('./notifications')
require('./settingsController')
require('./roomController')
