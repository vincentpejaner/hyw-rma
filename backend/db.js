const path = require("path");
const mysql = require("mysql2");

// Load environment variables from backend/.env regardless of where the process is started
require("dotenv").config({ path: path.join(__dirname, ".env") });

if (!process.env.MYSQLHOST || !process.env.MYSQLUSER) {
  console.warn(
    "[db] Missing MySQL env vars (MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE). " +
      "Double-check your Railway env or backend/.env file.",
  );
}

const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: Number(process.env.MYSQLPORT),
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
    connection.release();
  }
});

module.exports = db;
