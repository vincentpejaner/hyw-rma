const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
  database:
    process.env.MYSQLDATABASE ||
    process.env.MYSQL_DATABASE ||
    process.env.DB_NAME ||
    "rma_practice",
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

module.exports = db;
