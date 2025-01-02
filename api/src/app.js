const { app } = require('@azure/functions');


require('./controllers/sensorController');
require('./controllers/notificationController');
require('./controllers/settingsController');
require('./controllers/roomController');


require('./swagger/swaggerRoutes');