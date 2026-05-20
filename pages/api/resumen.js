import supabase from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { data: ingresos, error: err1 } = await supabase
      .from('transacciones')
      .select('monto')
      .eq('tipo', 'ingreso');

    const { data: gastos, error: err2 } = await supabase
      .from('transacciones')
      .select('monto')
      .eq('tipo', 'gasto');

    const { count, error: err3 } = await supabase
      .from('transacciones')
      .select('*', { count: 'exact', head: true });

    if (err1 || err2 || err3) throw err1 || err2 || err3;

    const totalIngresos = ingresos.reduce((s, r) => s + parseFloat(r.monto), 0);
    const totalGastos = gastos.reduce((s, r) => s + parseFloat(r.monto), 0);

    res.json({
      ingresos: totalIngresos,
      gastos: totalGastos,
      balance: totalIngresos - totalGastos,
      total: count || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
}
