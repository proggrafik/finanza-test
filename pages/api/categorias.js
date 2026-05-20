import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const result = await pool.query(
      'SELECT DISTINCT categoria FROM transacciones ORDER BY categoria'
    );
    res.json(result.rows.map(r => r.categoria));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorias' });
  }
}
