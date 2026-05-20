import supabase from '../../../lib/db';

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
    let query = supabase.from('transacciones').select('*');

    if (tipo && tipo !== 'todas') query = query.eq('tipo', tipo);
    if (categoria && categoria !== 'todas') query = query.eq('categoria', categoria);
    if (busqueda) query = query.ilike('descripcion', `%${busqueda}%`);

    query = query.order('fecha', { ascending: false }).order('id', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
}

async function crear(req, res) {
  try {
    const { tipo, categoria, monto, descripcion, fecha } = req.body;
    const { data, error } = await supabase
      .from('transacciones')
      .insert({ tipo, categoria, monto, descripcion, fecha })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear transaccion' });
  }
}

async function eliminarTodo(req, res) {
  try {
    const { error } = await supabase
      .from('transacciones')
      .delete()
      .neq('id', 0);

    if (error) throw error;
    res.json({ message: 'Todas las transacciones fueron eliminadas' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar todo' });
  }
}
