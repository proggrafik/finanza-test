import supabase from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { data, error } = await supabase
      .from('transacciones')
      .select('categoria')
      .order('categoria');

    if (error) throw error;

    const cats = [...new Set(data.map(r => r.categoria))];
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorias' });
  }
}
