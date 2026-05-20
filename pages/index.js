'use client';

import { useState, useEffect } from 'react';

const CATEGORIAS = {
  ingreso: ['Salario', 'Freelance', 'Inversiones', 'Ventas', 'Otro ingreso'],
  gasto: ['Alimentaci\u00f3n', 'Transporte', 'Servicios', 'Alquiler', 'Salud', 'Ocio', 'Educaci\u00f3n', 'Ropa', 'Otro gasto']
};

const ICONOS = {
  'Salario': '\u{1F4B0}', 'Freelance': '\u{1F4BB}', 'Inversiones': '\u{1F4C8}', 'Ventas': '\u{1F4E6}', 'Otro ingreso': '\u{1F4B5}',
  'Alimentaci\u00f3n': '\u{1F354}', 'Transporte': '\u{1F698}', 'Servicios': '\u{1F4A1}', 'Alquiler': '\u{1F3E0}',
  'Salud': '\u2764\uFE0F', 'Ocio': '\u{1F3B5}', 'Educaci\u00f3n': '\u{1F4DA}', 'Ropa': '\u{1F455}', 'Otro gasto': '\u{1F4B8}'
};

const API = '/api';

async function api(path, opts = {}) {
  const r = await fetch(API + path, opts);
  if (!r.ok) throw new Error();
  return r.json();
}

function formatearFecha(f) {
  const d = new Date(f + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Home() {
  const [tipo, setTipo] = useState('gasto');
  const [categoria, setCategoria] = useState(CATEGORIAS.gasto[0]);
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, balance: 0, total: 0 });
  const [transacciones, setTransacciones] = useState([]);
  const [categoriasFiltro, setCategoriasFiltro] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [filtroCat, setFiltroCat] = useState('todas');
  const [filtroBusq, setFiltroBusq] = useState('');

  function cargarTodo() {
    const params = new URLSearchParams();
    if (filtroTipo !== 'todas') params.set('tipo', filtroTipo);
    if (filtroCat !== 'todas') params.set('categoria', filtroCat);
    if (filtroBusq) params.set('busqueda', filtroBusq);

    Promise.all([
      api('/transacciones?' + params.toString()).then(setTransacciones),
      api('/resumen').then(setResumen),
      api('/categorias').then(setCategoriasFiltro),
    ]);
  }

  useEffect(() => { setFecha(new Date().toISOString().split('T')[0]); }, []);
  useEffect(() => { cargarTodo(); }, [filtroTipo, filtroCat, filtroBusq]);

  function handleTipoChange(e) {
    const t = e.target.value;
    setTipo(t);
    setCategoria(CATEGORIAS[t][0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const m = parseFloat(monto);
    if (!m || m <= 0) return;
    const d = descripcion.trim() || categoria;
    await api('/transacciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, categoria, monto: m.toFixed(2), descripcion: d, fecha }),
    });
    setMonto('');
    setDescripcion('');
    cargarTodo();
  }

  async function eliminar(id) {
    if (!confirm('Eliminar esta transacci\u00f3n?')) return;
    await api('/transacciones/' + id, { method: 'DELETE' });
    cargarTodo();
  }

  async function eliminarTodo() {
    if (!confirm('Eliminar todas las transacciones?')) return;
    await api('/transacciones', { method: 'DELETE' });
    cargarTodo();
  }

  const pctI = (resumen.ingresos + resumen.gastos) ? (resumen.ingresos / (resumen.ingresos + resumen.gastos) * 100) : 0;
  const pctG = (resumen.ingresos + resumen.gastos) ? (resumen.gastos / (resumen.ingresos + resumen.gastos) * 100) : 0;

  return (
    <div className="container">
      <style jsx>{`
        .container { max-width: 900px; width: 100%; margin: 0 auto; padding: 20px; }
        h1 { font-size: 1.5rem; display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
        h1 span { color: var(--accent); }
        .resumen { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 24px; }
        .card { background: var(--surface); border-radius: var(--radius); padding: 18px 20px; transition: transform .2s; }
        .card:hover { transform: translateY(-2px); }
        .card .label { font-size: .8rem; color: var(--text2); text-transform: uppercase; letter-spacing: .5px; }
        .card .valor { font-size: 1.6rem; font-weight: 700; margin-top: 6px; }
        .card .valor.positivo { color: var(--green); }
        .card .valor.negativo { color: var(--red); }
        .card .valor.neutral { color: var(--blue); }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        @media (max-width: 700px) { .grid { grid-template-columns: 1fr; } }
        .form-card { background: var(--surface); border-radius: var(--radius); padding: 20px; }
        .form-card h2 { font-size: 1rem; margin-bottom: 16px; color: var(--text2); }
        .form-row { margin-bottom: 12px; }
        .form-row label { display: block; font-size: .8rem; color: var(--text2); margin-bottom: 4px; }
        .form-row input, .form-row select {
          width: 100%; padding: 10px 12px; background: var(--surface2); border: 1px solid transparent;
          border-radius: 8px; color: var(--text); font-size: .9rem; outline: none; transition: border .2s;
        }
        .form-row input:focus, .form-row select:focus { border-color: var(--accent); }
        .form-row-inline { display: flex; gap: 12px; }
        .form-row-inline > * { flex: 1; }
        .btn { width: 100%; padding: 11px; border: none; border-radius: 8px; font-size: .9rem; font-weight: 600; cursor: pointer; transition: opacity .2s; }
        .btn:hover { opacity: .85; }
        .btn-primary { background: var(--accent); color: #fff; }
        .filtros { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
        .filtros select, .filtros input { padding: 8px 12px; background: var(--surface2); border: 1px solid transparent; border-radius: 8px; color: var(--text); font-size: .85rem; outline: none; flex: 1; min-width: 120px; }
        .filtros select:focus, .filtros input:focus { border-color: var(--accent); }
        .transacciones { background: var(--surface); border-radius: var(--radius); padding: 20px; }
        .transacciones h2 { font-size: 1rem; margin-bottom: 16px; color: var(--text2); }
        .lista { display: flex; flex-direction: column; gap: 8px; }
        .item { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--surface2); border-radius: 8px; transition: background .2s; gap: 10px; }
        .item:hover { background: #2e2e52; }
        .item-izq { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
        .item-categoria { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .cat-ingreso { background: rgba(0,230,118,.15); }
        .cat-gasto { background: rgba(255,82,82,.15); }
        .item-info { min-width: 0; }
        .item-desc { font-size: .9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .item-fecha { font-size: .75rem; color: var(--text2); }
        .item-monto { font-weight: 600; white-space: nowrap; }
        .item-monto.ingreso { color: var(--green); }
        .item-monto.gasto { color: var(--red); }
        .item-accion { background: none; border: none; color: var(--text2); cursor: pointer; font-size: 1.1rem; padding: 4px; transition: color .2s; flex-shrink: 0; }
        .item-accion:hover { color: var(--red); }
        .vacio { text-align: center; padding: 30px; color: var(--text2); }
        .eliminar-todo { text-align: right; margin-top: 12px; }
        .eliminar-todo button { background: none; border: none; color: var(--red); font-size: .8rem; cursor: pointer; opacity: .6; }
        .eliminar-todo button:hover { opacity: 1; }
        .barra { height: 8px; background: var(--surface2); border-radius: 4px; overflow: hidden; }
        .barra-fill { height: 100%; border-radius: 4px; transition: width .4s; }
      `}</style>

      <h1><span>&#9670;</span> Control Financiero</h1>

      <div className="resumen">
        <div className="card">
          <div className="label">Balance Total</div>
          <div className={`valor ${resumen.balance > 0 ? 'positivo' : resumen.balance < 0 ? 'negativo' : 'neutral'}`}>
            {resumen.balance < 0 ? '-' : ''}${Math.abs(resumen.balance).toFixed(2)}
          </div>
        </div>
        <div className="card">
          <div className="label">Ingresos</div>
          <div className="valor positivo">${resumen.ingresos.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="label">Gastos</div>
          <div className="valor negativo">${resumen.gastos.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid">
        <div className="form-card">
          <h2>Nueva Transacci&oacute;n</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Tipo</label>
              <select value={tipo} onChange={handleTipoChange}>
                <option value="ingreso">Ingreso</option>
                <option value="gasto">Gasto</option>
              </select>
            </div>
            <div className="form-row-inline">
              <div className="form-row" style={{flex:1}}>
                <label>Categor&iacute;a</label>
                <select value={categoria} onChange={e => setCategoria(e.target.value)}>
                  {CATEGORIAS[tipo].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-row" style={{flex:1}}>
                <label>Monto</label>
                <input type="number" step="0.01" min="0.01" required placeholder="0.00" value={monto} onChange={e => setMonto(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <label>Descripci&oacute;n</label>
              <input type="text" placeholder="Ej: Sueldo, supermercado..." maxLength="100" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Fecha</label>
              <input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">Agregar</button>
          </form>
        </div>

        <div className="form-card">
          <h2>Estad&iacute;sticas</h2>
          <div style={{marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'.85rem',color:'var(--text2)',marginBottom:4}}>
              <span>Ingresos</span><span>{pctI.toFixed(0)}%</span>
            </div>
            <div className="barra">
              <div className="barra-fill" style={{width:`${pctI}%`,background:'var(--green)'}}></div>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'.85rem',color:'var(--text2)',marginBottom:4}}>
              <span>Gastos</span><span>{pctG.toFixed(0)}%</span>
            </div>
            <div className="barra">
              <div className="barra-fill" style={{width:`${pctG}%`,background:'var(--red)'}}></div>
            </div>
          </div>
          <div style={{fontSize:'.85rem',color:'var(--text2)',marginTop:16}}>
            {resumen.total} transacci&oacute;n{resumen.total !== 1 ? 'es' : ''} registradas
          </div>
        </div>
      </div>

      <div className="transacciones">
        <h2>Historial</h2>
        <div className="filtros">
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="todas">Todas</option>
            <option value="ingreso">Ingresos</option>
            <option value="gasto">Gastos</option>
          </select>
          <select value={filtroCat} onChange={e => setFiltroCat(e.target.value)}>
            <option value="todas">Todas las categor&iacute;as</option>
            {categoriasFiltro.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="text" placeholder="Buscar..." value={filtroBusq} onChange={e => setFiltroBusq(e.target.value)} />
        </div>
        <div className="lista">
          {transacciones.length === 0 ? (
            <div className="vacio">No se encontraron transacciones</div>
          ) : transacciones.map(t => {
            const esIngreso = t.tipo === 'ingreso';
            const icon = ICONOS[t.categoria] || '\u{1F4B5}';
            return (
              <div key={t.id} className="item">
                <div className="item-izq">
                  <div className={`item-categoria ${esIngreso ? 'cat-ingreso' : 'cat-gasto'}`}>{icon}</div>
                  <div className="item-info">
                    <div className="item-desc">{t.descripcion || t.categoria}</div>
                    <div className="item-fecha">{t.categoria} &middot; {formatearFecha(t.fecha)}</div>
                  </div>
                </div>
                <div className={`item-monto ${t.tipo}`}>{esIngreso ? '+' : '-'}${Number(t.monto).toFixed(2)}</div>
                <button className="item-accion" onClick={() => eliminar(t.id)} title="Eliminar">&times;</button>
              </div>
            );
          })}
        </div>
        <div className="eliminar-todo">
          <button onClick={eliminarTodo}>Eliminar todo</button>
        </div>
      </div>
    </div>
  );
}
