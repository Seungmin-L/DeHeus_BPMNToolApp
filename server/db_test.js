const express = require('express');
const sql = require('mssql');
const config = require('./config'); // Import database configuration

const app = express();
const port = 3000;

// Function to check and create the 'Users' table if it doesn't exist
async function ensureTableExists() {
  try {
    await sql.connect(config);
    // Check if the 'Users' table exists
    const tableExists = await sql.query(`SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'Users'`);
    if (tableExists.recordset.length === 0) {
      console.log("Table 'Users' does not exist. Creating table...");
      // Create the 'Users' table with necessary columns (tbu after connecting with SSO Login part)
      await sql.query(`CREATE TABLE Users (
        UserID NVARCHAR(255) PRIMARY KEY,
        Username NVARCHAR(255),
        DisplayName NVARCHAR(255),
        ProfilePictureURL NVARCHAR(255),
        AccessToken NVARCHAR(255),
        RefreshToken NVARCHAR(255),
        TokenExpiry DATETIME,
        Roles NVARCHAR(255)
      )`);
      console.log("Table 'Users' created successfully.");
    } else {
      console.log("Table 'Users' already exists.");
    }
  } catch (err) {
    console.error('Error when checking or creating table:', err);
  }
}

// Route handler for the root path to check database connection and table
app.get('/', async (req, res) => {
  try {
    await ensureTableExists();
    res.send("Database connection and table check complete.");
  } catch (err) {
    console.error('Database operation failed:', err);
    res.status(500).send("Failed to connect to database or check table.");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});