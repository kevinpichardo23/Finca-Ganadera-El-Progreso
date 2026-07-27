-- Base de datos: finca_el_progreso
-- Ejecutar después de crear la base de datos.

CREATE TABLE IF NOT EXISTS razas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS ganado (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(15) NOT NULL UNIQUE,
    nombre VARCHAR(60) NOT NULL,
    raza_id INTEGER NOT NULL REFERENCES razas(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    sexo VARCHAR(10) NOT NULL CHECK (sexo IN ('Hembra', 'Macho')),
    fecha_nacimiento DATE NOT NULL CHECK (fecha_nacimiento <= CURRENT_DATE),
    peso_kg NUMERIC(8,2) NOT NULL CHECK (peso_kg BETWEEN 1 AND 2000),
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'En observación', 'Vendido')),
    observaciones VARCHAR(250),
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO razas (nombre, descripcion) VALUES
('Holstein', 'Raza especializada en producción de leche.'),
('Jersey', 'Raza lechera reconocida por su alto contenido de grasa.'),
('Brahman', 'Raza resistente y adaptada a climas tropicales.'),
('Angus', 'Raza especializada en producción de carne.')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO ganado (codigo, nombre, raza_id, sexo, fecha_nacimiento, peso_kg, estado, observaciones)
SELECT 'GAN-001', 'Estrella', id, 'Hembra', '2022-03-12', 485.50, 'Activo', 'Alta producción de leche.' FROM razas WHERE nombre='Holstein'
ON CONFLICT (codigo) DO NOTHING;
INSERT INTO ganado (codigo, nombre, raza_id, sexo, fecha_nacimiento, peso_kg, estado, observaciones)
SELECT 'GAN-002', 'Tormenta', id, 'Macho', '2021-08-20', 710.00, 'Activo', 'Reproductor.' FROM razas WHERE nombre='Brahman'
ON CONFLICT (codigo) DO NOTHING;
INSERT INTO ganado (codigo, nombre, raza_id, sexo, fecha_nacimiento, peso_kg, estado, observaciones)
SELECT 'GAN-003', 'Canela', id, 'Hembra', '2023-01-05', 365.75, 'En observación', 'Seguimiento veterinario preventivo.' FROM razas WHERE nombre='Jersey'
ON CONFLICT (codigo) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_ganado_raza ON ganado(raza_id);
CREATE INDEX IF NOT EXISTS idx_ganado_estado ON ganado(estado);
