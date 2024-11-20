const express = require('express');
const https = require('https');
const http = require('http');
const endpoints = require('./endpoints');
const sslConfig = require('./config/sslConfig');
const cors = require('cors');

const app = express();

// Middleware para procesar JSON
app.use(express.json());


// Configurar CORS
const allowedOrigins = ['https://bdtest.allnutrition.cl', 'https://allnutrition.cl'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
}));

// Montar rutas
app.use(endpoints);

// Servidor HTTPS
https.createServer(sslConfig, app).listen(8443, () => {
  console.log('Servidor HTTPS corriendo en https://bdtest.allnutrition.cl:8443');
});

// Redirección de HTTP a HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(8080, () => {
  console.log('Redirección de HTTP a HTTPS activa en el puerto 8080');
});
