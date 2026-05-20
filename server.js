const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'control_financiero',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/transacciones', async (req, res) => {
  try {
    const { tipo, categoria, busqueda } = req.query;
    let sql = 'SELECT * FROM transacciones WHERE 1=1';
    const params = [];
    let idx = 1;

    if (tipo && tipo !== 'todas') {
      sql += ` AND tipo = $${idx++}`;
      params.push(tipo);
    }
    if (categoria && categoria !== 'todas') {
      sql += ` AND categoria = $${idx++}`;
      params.push(categoria);
    }
    if (busqueda) {
      sql += ` AND LOWER(descripcion) LIKE $${idx++}`;
      params.push(`%${busqueda.toLowerCase()}%`);
    }

    sql += ' ORDER BY fecha DESC, id DESC';
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

app.post('/api/transacciones', async (req, res) => {
  try {
    const { tipo, categoria, monto, descripcion, fecha } = req.body;
    const result = await pool.query(
      `INSERT INTO transacciones (tipo, categoria, monto, descripcion, fecha)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tipo, categoria, monto, descripcion, fecha]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear transaccion' });
  }
});

app.delete('/api/transacciones/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM transacciones WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrada' });
    res.json({ message: 'Eliminada', id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

app.delete('/api/transacciones', async (req, res) => {
  try {
    await pool.query('DELETE FROM transacciones');
    res.json({ message: 'Todas las transacciones fueron eliminadas' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar todo' });
  }
});

app.get('/api/resumen', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) AS ingresos,
        COALESCE(SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END), 0) AS gastos,
        COUNT(*) AS total
      FROM transacciones
    `);
    const row = result.rows[0];
    res.json({
      ingresos: parseFloat(row.ingresos),
      gastos: parseFloat(row.gastos),
      balance: parseFloat(row.ingresos) - parseFloat(row.gastos),
      total: parseInt(row.total),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

app.get('/api/categorias', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT categoria FROM transacciones ORDER BY categoria'
    );
    res.json(result.rows.map(r => r.categoria));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorias' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
