const fs = require('fs');

const isDevelopment = process.env.NODE_ENV === 'dev';
console.log("isDevelopment", isDevelopment)

const sslConfig = isDevelopment
  ? {
    key: fs.readFileSync('./localhost-key.pem'),
    cert: fs.readFileSync('./localhost-cert.pem'),
  }
  : {
    key: fs.readFileSync(process.env.SSL_KEY_PROD),
    cert: fs.readFileSync(process.env.SSL_CERT_PROD),
    ca: fs.readFileSync(process.env.SSL_CHAIN_PROD),
  };

module.exports = sslConfig;