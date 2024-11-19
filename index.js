const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const cors = require('cors');
const sql = require('mssql');

const app = express();

// Configurar CORS para múltiples dominios
const allowedOrigins = ['https://bdtest.allnutrition.cl', 'https://allnutrition.cl'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

// Configuración de conexión a la base de datos
const dbConfig = {
  user: 'admin',
  password: 'pj5CfH8DykqsqUsYvn4M',
  server: 'database-1.czqacy0uy5uy.us-east-1.rds.amazonaws.com',
  database: 'all_nutrition',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// Cargar certificados SSL
const isDevelopment = process.env.NODE_ENV === 'dev';
const options = isDevelopment
  ? {
    key: fs.readFileSync('./localhost-key.pem'), // Ruta a los certificados locales
    cert: fs.readFileSync('./localhost-cert.pem'),
  }
  : {
    key: fs.readFileSync('/home/ubuntu/certificados/privkey.pem'), // Ruta en producción
    cert: fs.readFileSync('/home/ubuntu/certificados/cert.pem'),
    ca: fs.readFileSync('/home/ubuntu/certificados/chain.pem'),
  };

// Configura tu app para manejar solicitudes
app.get('/', (req, res) => {
  res.send('¡Hola Mundo desde HTTPS!');
});

// Servidor HTTPS
https.createServer(options, app).listen(8443, () => {
  console.log('Servidor HTTPS corriendo en https://bdtest.allnutrition.cl:8443');
});

// Endpoint para consultar la base de datos
app.get('/api/get-data', async (req, res) => {
  try {
    // Conectar a la base de datos
    const pool = await sql.connect(dbConfig);

    // Ejecutar una consulta (ajusta la consulta según tu esquema de tablas)
    const result = await pool.request().query('SELECT TOP 10 * FROM dbo.test_table');

    // Retornar los datos como JSON
    res.json(result.recordset);

    // Cerrar la conexión
    await pool.close();
  } catch (err) {
    console.error('Error al consultar la base de datos:', err);
    res.status(500).send('Error al consultar la base de datos');
  }
});

// Redirección de HTTP a HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(8080, () => {
  console.log('Redirección de HTTP a HTTPS activa en el puerto 8080');
});

