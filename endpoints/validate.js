const express = require('express');
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

const router = express.Router();

// Ruta para validar un código
router.get('/validate', async (req, res) => {
  const { codigo, correo } = req.query;

  if (!codigo || !correo) {
    return res.status(400).json({ error: 'El código y el correo son obligatorios.' });
  }

  try {
    const pool = await sql.connect(dbConfig);

    // Consulta para verificar si el código existe y su estado actual
    const validation_table = process.env.AWS_VALIDATION_TABLE;
    const email_table = process.env.AWS_EMAIL_TABLE;

    const query = `
      SELECT Codigo, Validado 
      FROM ${validation_table} 
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
      UPDATE ${validation_table}
      SET Validado = 1
      WHERE Codigo = @Codigo
    `;

    await pool.request()
      .input('Codigo', sql.NVarChar, codigo)
      .query(updateQuery);

    // Insertar el correo en la tabla de correos
    const insertEmailQuery = `
      IF NOT EXISTS (SELECT 1 FROM ${email_table} WHERE email_address = @Correo)
      BEGIN
        INSERT INTO ${email_table} (email_address)
        VALUES (@Correo)
      END
    `;

    await pool.request()
      .input('Correo', sql.NVarChar, correo)
      .query(insertEmailQuery);

    // Retornar los datos actualizados
    res.status(200).json({
      mensaje: 'El código ha sido validado con éxito.',
      codigo,
      validado: true,
      primera_vez: true,
    });

    await pool.close();
  } catch (err) {
    console.error('Error al consultar o actualizar el código:', err);
    res.status(500).send('Error al consultar o actualizar la base de datos');
  }
});

module.exports = router;
