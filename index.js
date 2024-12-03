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
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
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
https.createServer(sslConfig, app).listen(process.env.HTTPS_PORT, () => {
  console.log(`Servidor HTTPS corriendo en https://bdtest.allnutrition.cl:${process.env.HTTPS_PORT}`);
});

// Redirección de HTTP a HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(process.env.HTTP_PORT, () => {
  console.log(`Redirección de HTTP a HTTPS activa en el puerto ${process.env.HTTP_PORT}`);
});