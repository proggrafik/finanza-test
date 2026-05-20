import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
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
}
