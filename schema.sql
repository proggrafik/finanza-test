-- Pega esto en Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql/new

CREATE TABLE IF NOT EXISTS transacciones (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
  categoria VARCHAR(50) NOT NULL,
  monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
  descripcion VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones(fecha DESC);
