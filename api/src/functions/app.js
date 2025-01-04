// app.js

const { app } = require('@azure/functions');

// Funktionen importieren


require('./httpTrigger1');
require('../controllers/historyController');
require('../controllers/notificationController');
