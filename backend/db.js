const mysql = require("mysql2");

function getConfigFromUrl(connectionString) {
  if (!connectionString) {
    return null;
  }

  try {
    const parsed = new URL(connectionString);

    return {
      host: parsed.hostname,
      user: decodeURIComponent(parsed.username || "root"),
      password: decodeURIComponent(parsed.password || ""),
      database: decodeURIComponent(
        parsed.pathname.replace(/^\//, "") || "rma_practice",
      ),
      port: Number(parsed.port || 3306),
    };
  } catch (error) {
    console.error("Invalid MySQL connection URL:", error.message);
    return null;
  }
}

const urlConfig =
  getConfigFromUrl(process.env.MYSQL_URL) ||
  getConfigFromUrl(process.env.DATABASE_URL) ||
  getConfigFromUrl(process.env.MYSQL_PUBLIC_URL);

const connectionConfig = {
  host:
    urlConfig?.host ||
    process.env.MYSQLHOST ||
    process.env.DB_HOST ||
    "localhost",
  user:
    urlConfig?.user ||
    process.env.MYSQLUSER ||
    process.env.DB_USER ||
    "root",
  password:
    urlConfig?.password ||
    process.env.MYSQLPASSWORD ||
    process.env.DB_PASSWORD ||
    "",
  database:
    urlConfig?.database ||
    process.env.MYSQLDATABASE ||
    process.env.MYSQL_DATABASE ||
    process.env.DB_NAME ||
    "rma_practice",
  port: Number(
    urlConfig?.port || process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  ),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
};

console.log("Initializing MySQL pool", {
  host: connectionConfig.host,
  port: connectionConfig.port,
  database: connectionConfig.database,
  user: connectionConfig.user,
});

const db = mysql.createPool(connectionConfig);

db.query("SELECT 1 AS db_ok", (err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

module.exports = db;
