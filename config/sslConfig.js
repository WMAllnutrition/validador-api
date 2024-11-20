const fs = require('fs');

const isDevelopment = process.env.NODE_ENV === 'dev';

const sslConfig = isDevelopment
  ? {
    key: fs.readFileSync('./localhost-key.pem'),
    cert: fs.readFileSync('./localhost-cert.pem'),
  }
  : {
    key: fs.readFileSync('/home/ubuntu/certificados/privkey.pem'),
    cert: fs.readFileSync('/home/ubuntu/certificados/cert.pem'),
    ca: fs.readFileSync('/home/ubuntu/certificados/chain.pem'),
  };

module.exports = sslConfig;