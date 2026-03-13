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
    process.env.MYSQLHOST,
  user:
    urlConfig?.user ||
    process.env.MYSQLUSER,
  password:
    urlConfig?.password ||
    process.env.MYSQLPASSWORD,
  database:
    urlConfig?.database ||
    process.env.MYSQLDATABASE ||
    process.env.MYSQL_DATABASE,
  port: Number(urlConfig?.port || process.env.MYSQLPORT),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
};

function getMissingDbConfig(config) {
  const missing = [];

  if (!config.host) missing.push("MYSQL_URL or MYSQLHOST");
  if (!config.user) missing.push("MYSQL_URL or MYSQLUSER");
  if (!config.database) missing.push("MYSQL_URL or MYSQLDATABASE");
  if (!Number.isFinite(config.port) || config.port <= 0) {
    missing.push("MYSQL_URL or MYSQLPORT");
  }

  return missing;
}

const missingDbConfig = getMissingDbConfig(connectionConfig);
if (missingDbConfig.length > 0) {
  throw new Error(
    `Missing required MySQL configuration: ${missingDbConfig.join(", ")}. ` +
      "Add Railway variable references to the backend service and redeploy.",
  );
}

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
