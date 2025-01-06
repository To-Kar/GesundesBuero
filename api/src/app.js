const { app } = require('@azure/functions');

require('./controllers/historyController');
require('./controllers/notificationController')
require('./controllers/roomController')
require('./controllers/sensorController');
require('./controllers/settingsController')
require('./swagger/swaggerRoutes');