const express = require('express');
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');
const ExcelJS = require('exceljs');

const router = express.Router();

router.post('/generate-codes', async (req, res) => {
  const { batchSize } = req.body;

  if (!batchSize || batchSize <= 0) {
    return res.status(400).json({ error: 'El tamaño del lote debe ser mayor a 0.' });
  }

  try {
    const pool = await sql.connect(dbConfig);

    // Obtener códigos existentes
    const existingCodesResult = await pool.request().query(`
      SELECT Codigo FROM dbo.test_table
    `);
    const existingCodes = new Set(existingCodesResult.recordset.map(row => row.Codigo));

    // Generar códigos nuevos
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const generateCode = () => {
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return code;
    };

    const newCodes = new Set();
    while (newCodes.size < batchSize) {
      const code = generateCode();
      if (!existingCodes.has(code)) {
        newCodes.add(code);
      }
    }

    // Insertar los nuevos códigos en la base de datos
    const values = Array.from(newCodes)
      .map(code => `('${code}', 0)`)
      .join(',');

    const insertQuery = `
      INSERT INTO dbo.test_table (Codigo, Validado)
      VALUES ${values}
    `;
    await pool.request().query(insertQuery);

    // Crear archivo Excel con los nuevos códigos
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Nuevos Códigos');

    worksheet.columns = [
      { header: 'Código', key: 'codigo', width: 20 },
    ];

    newCodes.forEach(code => {
      worksheet.addRow({ codigo: code });
    });

    // Configurar la respuesta para enviar el archivo Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=nuevos-codigos.xlsx');

    // Enviar el archivo Excel como respuesta
    await workbook.xlsx.write(res);
    res.end();

    await pool.close();
  } catch (err) {
    console.error('Error al generar códigos:', err);
    res.status(500).send('Error al generar códigos en la base de datos');
  }
});

module.exports = router;
