const sql = require('mssql');
require('dotenv').config();

/*const config = {
    user: 'sa',
    password: 'password',
    server: 'localhost',  // Oder IP-Adresse des Servers
    database: 'GesundesBuero',
    options: {
      encrypt: true,  // Verschlüsselung für Azure SQL, bei lokalem SQL auf false setzen
      trustServerCertificate: true  // Erforderlich für self-signed certificates
    },
    port: 1433
  };
  
  module.exports = config;*/
  

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // Use encryption
    enableArithAbort: true,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  connectionTimeout: 30000, // Increase connection timeout to 30 seconds
  requestTimeout: 30000 // Increase request timeout to 30 seconds
};

module.exports = config;

