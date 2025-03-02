const swaggerJsDoc = require('swagger-jsdoc');
const baseDefinitions = require('./swaggerDefinitions');


const swaggerOptions = {
  definition: baseDefinitions,

  apis: ['./src/controllers/*.js'], 
};

// Swagger-Spezifikation generieren
const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
  swaggerDocs,
};
