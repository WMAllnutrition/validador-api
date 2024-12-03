const express = require('express');
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');
const ExcelJS = require('exceljs');

const router = express.Router();

function generateUniqueCodes(batchSize, existingCodes) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codes = new Set();

  while (codes.size < batchSize) {
    let code = '';
    for (let j = 0; j < 6; j++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    if (!existingCodes.has(code)) {
      codes.add(code);
    }
  }

  return Array.from(codes);
}

router.post('/generate-codes', async (req, res) => {
  const { batchSize, marca } = req.body;

  if (!batchSize || batchSize <= 0) {
    return res.status(400).json({ error: 'El tamaño del lote debe ser mayor a 0.' });
  }

  if (!marca || marca.trim() === '') {
    return res.status(400).json({ error: 'El campo "marca" es obligatorio.' });
  }

  try {
    const pool = await sql.connect(dbConfig);

    // Obtener códigos existentes
    const tableName = process.env.AWS_DB_TABLE;
    const existingCodesResult = await pool.request().query(`
      SELECT Codigo FROM ${tableName}  WITH (NOLOCK)
    `);
    const existingCodes = new Set(existingCodesResult.recordset.map(row => row.Codigo));

    const uniqueCodes = generateUniqueCodes(batchSize, existingCodes);

    const batchInsert = async (codes, pool) => {
      const batchSize = 1000; // Número de registros por lote
      for (let i = 0; i < codes.length; i += batchSize) {
        const batch = codes.slice(i, i + batchSize);
        const table = new sql.Table(tableName);
        table.create = true;
        table.columns.add('Codigo', sql.Char(6), { nullable: false });
        table.columns.add('Validado', sql.Bit, { nullable: false });
        table.columns.add('Marca', sql.VarChar(255), { nullable: true });

        batch.forEach(code => {
          table.rows.add(code, 0, marca);
        });

        await pool.request().bulk(table);
      }
    };

    await batchInsert(Array.from(uniqueCodes), pool);

    // Crear archivo Excel con los nuevos códigos
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Nuevos Códigos');

    worksheet.columns = [
      { header: 'Código', key: 'codigo', width: 20 },
      { header: 'Marca', key: 'marca', width: 20 },
    ];

    uniqueCodes.forEach(code => {
      worksheet.addRow({ codigo: code, marca });
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
