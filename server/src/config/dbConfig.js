const sql = require('mssql');

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    server: process.env.DB_SERVER,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    connectionTimeout: 30000,  
    requestTimeout: 30000,      
    options: {
        encrypt: true,
        trustServerCertificate: true  // if deploy => false
    }
};

async function connectDB() {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('Connected to the SQL Database');

        const tableCheckQuery = `
            SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'user';
        `;
        
        const tableCreateQuery = `
            CREATE TABLE [user] (
                id VARCHAR(255) PRIMARY KEY,          -- oid
                email VARCHAR(255) NOT NULL,          -- preferred_username
                name VARCHAR(255) NOT NULL,           -- name
                tenant_id VARCHAR(255) NOT NULL,      -- tid
                token_issue_time BIGINT NOT NULL,     -- iat
                token_expiration_time BIGINT NOT NULL,-- exp
                nonce VARCHAR(255),                   -- nonce
                identity_provider VARCHAR(255),       -- idp
                token_id VARCHAR(255),                -- uti
                resource_id VARCHAR(255)              -- aud
            );
        `;

        const result = await pool.request().query(tableCheckQuery);
        if (result.recordset.length === 0) {
            await pool.request().query(tableCreateQuery);
            console.log('user table did not exist, created a new one.');
        } else {
            console.log('user table already exists.');
        }
    } catch (err) {
        console.error('Unable to connect to the database or create table:', err);
    }
}

module.exports = { connectDB, sql };
