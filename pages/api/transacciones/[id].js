import pool from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const result = await pool.query(
      'DELETE FROM transacciones WHERE id = $1 RETURNING *',
      [req.query.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrada' });
    res.json({ message: 'Eliminada', id: req.query.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar' });
  }
}
