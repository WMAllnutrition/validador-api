const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const cors = require('cors'); // Importa cors

const app = express();

// Configurar CORS
app.use(cors({
  origin: 'https://bdtest.allnutrition.cl', // Permitir solo este dominio
  credentials: true // Habilitar envío de cookies u otros encabezados de autenticación, si es necesario
}));

// Cargar certificados SSL
const options = {
  key: fs.readFileSync('/home/ubuntu/certificados/privkey.pem'),
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

// Redirección de HTTP a HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(8080, () => {
  console.log('Redirección de HTTP a HTTPS activa en el puerto 8080');
});

/*
const sql = require('mssql');
const express = require('express');
const app = express();
const port = 3000;

// Configura la conexión a tu base de datos de SQL Server en AWS RDS
const dbConfig = {
  user: 'admin',
  password: 'pj5CfH8DykqsqUsYvn4M',
  server: 'database-1.czqacy0uy5uy.us-east-1.rds.amazonaws.com',  // Endpoint de AWS RDS
  database: 'NombreDeTuBaseDeDatos',  // Cambia esto al nombre de tu base de datos
  port: 1433,
  options: {
    encrypt: true, // Asegura la conexión
    trustServerCertificate: true // Solo si el certificado no es confiable
  }
};

// Conexión a la base de datos

async function connectToDatabase() {
  try {
    await sql.connect(dbConfig);
    console.log("Conexión a la base de datos exitosa.");
  } catch (err) {
    console.error("Error al conectar a la base de datos:", err);
  }
}

connectToDatabase();


// Ruta de ejemplo
app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

// Configura la ruta de la API para obtener los productos

app.get('/api/productos', async (req, res) => {
  try {
    // Consulta a tu tabla
    const result = await sql.query`SELECT * FROM test_table`;

    res.json(result.recordset);  // Devuelve los datos en JSON
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).send('Error al obtener los productos');
  }
});

// Inicia el servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://3.85.130.50:${port}`);
});
*/
