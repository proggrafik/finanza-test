CREATE DATABASE control_financiero;

\c control_financiero;

CREATE TABLE transacciones (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
  categoria VARCHAR(50) NOT NULL,
  monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
  descripcion VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transacciones_fecha ON transacciones(fecha DESC);
