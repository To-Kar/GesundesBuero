const swaggerJsDoc = require('swagger-jsdoc');


// Swagger Optionen
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gesundes Büro API',
      version: '1.0.0',
      description: 'API-Dokumentation für die Funktionen der Anwendung Gesundes Büro.',
    },
  },
  apis: ['./src/controllers/*.js'], // Der Pfad zu den Dateien mit Swagger-Kommentaren
};

// Swagger-Spezifikation generieren
const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
  swaggerDocs,
};
