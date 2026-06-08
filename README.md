AQUI SE ENCUENTRA TODOS LOS COMANDOS PARA LA BASE DE DATOS PARA POSTGRES
-- 1. Primero creamos el tipo ENUM para el tipo de donante
CREATE TYPE tipo_donante_enum AS ENUM ('persona', 'empresa');

-- 2. Creamos el tipo ENUM para los estados que usará el personal del hospital
CREATE TYPE estado_donacion_enum AS ENUM ('Pendiente', 'Recibido', 'Aprobado', 'Destinado');

-- 3. Creamos la tabla unificada con sintaxis nativa de PostgreSQL
CREATE TABLE IF NOT EXISTS donaciones (
    id SERIAL PRIMARY KEY,                          -- SERIAL reemplaza al AUTO_INCREMENT de MySQL
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_donante tipo_donante_enum NOT NULL,
    
    -- Bloque de Identidad (Campos de persona agrupados)
    nombre VARCHAR(100) NOT NULL,                   -- Nombre o Razón Social
    dni VARCHAR(20) DEFAULT NULL,                   -- Solo para persona
    fecha_nacimiento DATE DEFAULT NULL,             -- Solo para persona
    
    -- Bloque de Contacto y Donación
    correo VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    
    -- Estado controlado por nuestro ENUM con valor por defecto
    estado estado_donacion_enum DEFAULT 'Pendiente'
);


MODIFICACION EN UN QUERY TOOL
ALTER TYPE estado_donacion_enum ADD VALUE 'Aprobado y Destinado';


PARA CONSULTAR LA TABLA
SELECT * FROM public.donaciones
);
