const express = require('express');
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

const router = express.Router();

// Ruta para validar un código
router.get('/validate', async (req, res) => {
  const { codigo } = req.query;

  if (!codigo) {
    return res.status(400).json({ error: 'El código es obligatorio.' });
  }

  try {
    const pool = await sql.connect(dbConfig);

    // Consulta para verificar si el código existe y su estado actual
    const query = `
      SELECT Codigo, Validado 
      FROM dbo.test_table 
      WHERE Codigo = @Codigo
    `;
    const result = await pool.request()
      .input('Codigo', sql.NVarChar, codigo)
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Código no encontrado.' });
    }

    const { Validado } = result.recordset[0];

    if (Validado) {
      // Caso: Código ya validado anteriormente
      return res.status(200).json({
        mensaje: 'El código ya ha sido validado anteriormente.',
        codigo,
        validado: true,
        primera_vez: false // Indica que no es la primera vez
      });
    }

    // Caso: Código no validado, actualizar a true
    const updateQuery = `
      UPDATE dbo.test_table
      SET Validado = 1
      WHERE Codigo = @Codigo
    `;
    await pool.request()
      .input('Codigo', sql.NVarChar, codigo)
      .query(updateQuery);

    // Retornar los datos actualizados
    res.status(200).json({
      mensaje: 'El código ha sido validado con éxito.',
      codigo,
      validado: true,
      primera_vez: true // Indica que es la primera vez que se valida
    });

    await pool.close();
  } catch (err) {
    console.error('Error al consultar o actualizar el código:', err);
    res.status(500).send('Error al consultar o actualizar la base de datos');
  }
});

module.exports = router;
