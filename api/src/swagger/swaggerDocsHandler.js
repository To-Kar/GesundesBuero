// src/utils/swaggerDocsHandler.js
const { swaggerDocs } = require('./swaggerConfig');


module.exports = async function swaggerDocsHandler() {
  return {
    status: 200,
    body: JSON.stringify(swaggerDocs),
    headers: { 'Content-Type': 'application/json' }
  };
};
