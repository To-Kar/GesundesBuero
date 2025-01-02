const { app } = require('@azure/functions');
const swaggerDocsHandler = require('./swaggerDocsHandler');
const swaggerUiHandler = require('./swaggerUiHandler');


app.http('swagger-docs', {
  methods: ['GET'],
  route: 'swagger.json',
  handler: swaggerDocsHandler,
});


app.http('swagger-ui', {
  methods: ['GET'],
  route: 'swagger-ui-assets/{*filename}',
  handler: swaggerUiHandler,
});
