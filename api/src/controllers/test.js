const sql = require('mssql');
const config = {
    user: '',
    password: '',
    server: '',
    database: '',
    options: {
        encrypt: true,
        trustServerCertificate: false,
    },
    port: 1433,
};

async function alterNotificationTable() {
    try {
        const pool = await sql.connect(config);
       
        // Prüfe ob die alte Spalte existiert
        const checkColumn = await pool.request().query(`
            SELECT * 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Notification' 
            AND COLUMN_NAME = 'timestamp'
        `);

        if (checkColumn.recordset.length > 0) {
            // Lösche die alte Spalte
            await pool.request().query(`
                ALTER TABLE Notification
                DROP COLUMN timestamp
            `);
        }

        // Füge die neue Spalte hinzu
        await pool.request().query(`
            ALTER TABLE Notification
            ADD timestamp datetime NOT NULL
            CONSTRAINT DF_Notification_timestamp DEFAULT GETDATE()
        `);

        console.log('Tabelle erfolgreich geändert');
        
        // Zeige die aktuelle Tabellenstruktur
        const tableInfo = await pool.request().query(`
            SELECT 
                COLUMN_NAME, 
                DATA_TYPE,
                COLUMN_DEFAULT,
                IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Notification'
            ORDER BY ORDINAL_POSITION
        `);
        
        console.log('\nAktuelle Tabellenstruktur:');
        console.table(tableInfo.recordset);

        await pool.close();
    } catch (error) {
        console.error('Fehler beim Ändern der Tabelle:', error.message);
    }
}

alterNotificationTable();

tabelle erstellen

-- Drop existing tables if they exist
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS sensor;
DROP TABLE IF EXISTS room;
DROP TABLE IF EXISTS settings;

-- Create tables
CREATE TABLE room (
    room_id VARCHAR(50) PRIMARY KEY,
    sensor_id VARCHAR(50),
    name NVARCHAR(100),
    imageURL NVARCHAR(MAX),
    target_temp INTEGER,
    target_humidity INTEGER
);

CREATE TABLE sensor (
    sensor_id VARCHAR(50) PRIMARY KEY,
    temperature DECIMAL(4,1),
    humidity INTEGER,
    [timestamp] DATETIME2,
    ip_address VARCHAR(15),
    co2_detected BIT
);

CREATE TABLE notification (
    notification_id VARCHAR(50) PRIMARY KEY,
    room_id VARCHAR(50),
    sensor_id VARCHAR(50),
    type NVARCHAR(50),
    description NVARCHAR(MAX),
    status BIT,
    [timestamp] DATETIME2,
    FOREIGN KEY (room_id) REFERENCES room(room_id),
    FOREIGN KEY (sensor_id) REFERENCES sensor(sensor_id)
);

CREATE TABLE settings (
    id INTEGER PRIMARY KEY,
    update_interval INTEGER,
    [offset] INTEGER,
    temperature_offset DECIMAL(3,1),
    humidity_offset DECIMAL(3,1)
);

-- Insert data into room table
INSERT INTO room (room_id, sensor_id, name, imageURL, target_temp, target_humidity) VALUES
('room1', 'sensor3', 'Büroraum 1', 'https://media.istockphoto.com/id/1460755337/de/foto/weißes-farbthema-modernes-büro-mit-sichtbetonboden-und-viel-anlage-3d-rendering.jpg?s=612x612&w=0&k=20&c=tMs8J0l3ywwqTsK7m0tMDeihJENbSqLbLT1WONWMhuY=', 24, 50),
('room2', 'sensor2', 'Neuer Büroraum', 'https://media.istockphoto.com/id/1460755337/de/foto/weißes-farbthema-modernes-büro-mit-sichtbetonboden-und-viel-anlage-3d-rendering.jpg?s=612x612&w=0&k=20&c=tMs8J0l3ywwqTsK7m0tMDeihJENbSqLbLT1WONWMhuY=', 20, 50),
('room3', NULL, 'Neuer Büroraum', 'https://media.istockphoto.com/id/1460755337/de/foto/weißes-farbthema-modernes-büro-mit-sichtbetonboden-und-viel-anlage-3d-rendering.jpg?s=612x612&w=0&k=20&c=tMs8J0l3ywwqTsK7m0tMDeihJENbSqLbLT1WONWMhuY=', 20, 55);

-- Insert data into sensor table
INSERT INTO sensor (sensor_id, temperature, humidity, [timestamp], ip_address, co2_detected) VALUES
('sensor1', 22, 40, '2024-12-25 17:29:47.350', '192.168.1.100', 0),
('sensor2', 27.2, 32, '2024-12-26 13:26:04.163', '192.168.1.101', 1),
('sensor3', 25.5, 65, '2024-12-19 15:30:00.000', '192.168.157.1', 1);

-- Insert data into notification table
INSERT INTO notification (notification_id, room_id, sensor_id, type, description, status, [timestamp]) VALUES
('226', 'room3', 'sensor2', 'Temperatur', 'Raum Neuer Büroraum: Temperatur (25.5°C) weicht um 6.0°C vom Zielwert (20°C) ab', 0, '2024-12-26 14:12:15.330'),
('227', 'room3', 'sensor2', 'Feuchtigkeit', 'Raum Neuer Büroraum: Luftfeuchtigkeit (65%) weicht um 10% vom Zielwert (55%) ab', 0, '2024-12-26 14:12:15.527'),
('230', 'room1', 'sensor3', 'Temperatur', 'Raum Büroraum 1: Temperatur (25.5°C) weicht um 2.0°C vom Zielwert (24°C) ab', 0, '2024-12-26 14:45:40.560'),
('231', 'room1', 'sensor3', 'Feuchtigkeit', 'Raum Büroraum 1: Luftfeuchtigkeit (65%) weicht um 15% vom Zielwert (50%) ab', 0, '2024-12-26 14:45:40.867'),
('232', 'room2', 'sensor2', 'Temperatur', 'Raum Neuer Büroraum: Temperatur (27.2°C) weicht um 7.0°C vom Zielwert (20°C) ab', 0, '2024-12-26 14:45:41.080'),
('233', 'room2', 'sensor2', 'Feuchtigkeit', 'Raum Neuer Büroraum: Luftfeuchtigkeit (32%) weicht um 18% vom Zielwert (50%) ab', 0, '2024-12-26 14:45:41.270');

-- Insert data into settings table
INSERT INTO settings (id, update_interval, [offset], temperature_offset, humidity_offset) VALUES
(1, 250, 0, 1, 1),
(2, 600, 1, -0.5, 3),
(3, 900, NULL, 0.8, -1.5),
(4, 1800, 3, -1, 2.5);