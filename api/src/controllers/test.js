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