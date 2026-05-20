import pool from '../../../lib/db';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return obtener(req, res);
    case 'POST':
      return crear(req, res);
    case 'DELETE':
      return eliminarTodo(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function obtener(req, res) {
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
}

async function crear(req, res) {
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
}

async function eliminarTodo(req, res) {
  try {
    await pool.query('DELETE FROM transacciones');
    res.json({ message: 'Todas las transacciones fueron eliminadas' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar todo' });
  }
}
