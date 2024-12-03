require('dotenv').config()

const dbConfig = {
  user: process.env.AWS_DB_USER,
  password: process.env.AWS_DB_PASSWORD,
  server: process.env.AWS_DB_URL,
  database: 'all_nutrition',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

module.exports = dbConfig;
