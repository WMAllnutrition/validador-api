const express = require('express');
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

const router = express.Router();

// Ruta para obtener datos
router.get('/get-data', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT TOP 10 * FROM dbo.test_table');
    res.json(result.recordset);
    await pool.close();
  } catch (err) {
    console.error('Error al consultar la base de datos:', err);
    res.status(500).send('Error al consultar la base de datos');
  }
});

module.exports = router;
