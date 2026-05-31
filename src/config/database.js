const { Sequelize } = require("sequelize");
require("dotenv").config();

const getEnv = (...keys) => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(process.env, key)) {
      return process.env[key];
    }
  }

  return undefined;
};

const dbName = getEnv("DB_NAME", "MYSQLDATABASE");
const dbUser = getEnv("DB_USER", "MYSQLUSER");
const dbPassword = getEnv("DB_PASSWORD", "MYSQLPASSWORD");
const dbHost = getEnv("DB_HOST", "MYSQLHOST");
const dbPort = getEnv("DB_PORT", "MYSQLPORT");

const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: dbHost,
    port: dbPort,
    dialect: "mysql",
    logging: false,
  },
);

module.exports = sequelize;
