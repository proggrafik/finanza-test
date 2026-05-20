import supabase from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { data, error } = await supabase
      .from('transacciones')
      .delete()
      .eq('id', req.query.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'No encontrada' });
      throw error;
    }
    res.json({ message: 'Eliminada', id: req.query.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar' });
  }
}
