const { app } = require('@azure/functions');
const { swaggerDocs } = require('./config/swaggerConfig');
const path = require('path');
const fs = require('fs');


app.http('swagger-docs', {
    methods: ['GET'],
    route: 'swagger.json',
    handler: async () => ({
      status: 200,
      body: swaggerDocs,
      headers: { 'Content-Type': 'application/json' },
    }),
  });
  
  // Swagger-UI bereitstellen
  app.http('swagger-ui', {
    methods: ['GET'],
    route: 'swagger-ui-assets/{*filename}',
    handler: async (request) => {
      const filename = request.params.filename || 'index.html';
      const filePath = path.join(swaggerUiDist.getAbsoluteFSPath(), filename);
  
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath);
        const contentType = filename.endsWith('.html') ? 'text/html' :
                            filename.endsWith('.css') ? 'text/css' :
                            filename.endsWith('.js') ? 'application/javascript' : 'application/octet-stream';
  
        return {
          status: 200,
          body: fileContent,
          headers: { 'Content-Type': contentType },
        };
      }
  
      return {
        status: 404,
        body: `File not found: ${filename}`,
      };
    },
  });


require('./controllers/sensorController');
require('./controllers/notificationController');
require('./controllers/settingsController');
require('./controllers/roomController');
  
  console.log('Swagger UI verfügbar unter: http://localhost:7071/swagger-ui-assets');
  console.log('Swagger JSON verfügbar unter: http://localhost:7071/swagger.json');