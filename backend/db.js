const mysql = require('mysql2');

const db = mysql.createConnection({
    
    host: '192.168.254.130',
    user:  'remote_user',
    password: '1234',
    database: 'rma_practice',
    port : 3306
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

module.exports = db;