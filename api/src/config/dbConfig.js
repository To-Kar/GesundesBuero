const sql = require('mssql');
require('dotenv').config();

const config = {
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

module.exports = config;