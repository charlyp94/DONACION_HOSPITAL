const express = require('express');
const { Pool } = require('pg'); // 🔄 Cambiado a la librería de PostgreSQL
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos usando rutas absolutas seguras.
app.use(express.static(path.join(__dirname, '../public'))); 

// 🔐 CONFIGURACIÓN DESGLOSADA EN EL PUERTO CORRECTO (5433)
const db = new Pool({
    user: 'postgres',              // Tu usuario administrador
    host: '127.0.0.1',             // IP local clásica (IPv4)
    password: 'ies6039',           // Tu contraseña
    database: 'hospitalguemes',    // Nombre de la base de datos
    port: 5433,                    // 🛠️ ¡CORREGIDO! Puerto real de tu Postgres 18
});

// Verificar conexión en la terminal
db.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Error al conectar a PostgreSQL:', err.stack);
    }
    console.log('✨ ¡Conectado exitosamente a la base de datos PostgreSQL hospitalguemes!');
    release();
});

// Cache temporal para evitar que registros idénticos entren duplicados en ráfaga (Anti-Bounce)
let ultimaDonacionCache = null;

// --- 2. RUTA POST: RECIBIR Y GUARDAR DONACIÓN ---
app.post('/api/donaciones', (req, res) => {
    const { tipoDonante, nombreCompleto, nombreEmpresa, dni, fechaNacimiento, correo, categoria } = req.body;

    const nombreFinal = (tipoDonante === 'empresa') ? nombreEmpresa : nombreCompleto;
    const dniFinal = (tipoDonante === 'persona') ? dni : null;
    const fechaNacFinal = (tipoDonante === 'persona') ? fechaNacimiento : null;

    // 🛑 BLINDAJE ANTI-DUPLICACIÓN
    const claveEnvioActual = `${correo}-${categoria}-${nombreFinal}`;
    if (ultimaDonacionCache === claveEnvioActual) {
        console.log('⚠️ Petición duplicada bloqueada en el servidor para evitar clonación.');
        return res.status(200).json({ mensaje: 'Donación ya procesada anteriormente.', duplicado: true });
    }

    ultimaDonacionCache = claveEnvioActual;
    setTimeout(() => { ultimaDonacionCache = null; }, 2000);

    // 🔄 Sintaxis de Postgres usando $1, $2, $3 en lugar de los ? de MySQL
    const sql = `INSERT INTO donaciones (tipo_donante, nombre, dni, fecha_nacimiento, correo, categoria, estado) 
                 VALUES ($1, $2, $3, $4, $5, $6, 'Pendiente') RETURNING id`;
    
    const valores = [tipoDonante, nombreFinal, dniFinal, fechaNacFinal, correo, categoria];

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error('Error al insertar donación:', err);
            return res.status(500).json({ error: 'Error al guardar la donación.' });
        }
        // 🔄 En Postgres el ID nuevo se obtiene con result.rows[0].id gracias al RETURNING
        return res.status(201).json({ mensaje: 'Donación registrada como Pendiente.', id: result.rows[0].id });
    });
});

// --- 3. RUTA GET: OBTENER TODAS LAS DONACIONES (Para el Admin) ---
app.get('/api/donaciones', (req, res) => {
    const sql = "SELECT * FROM donaciones ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener donaciones:', err);
            return res.status(500).json({ error: 'Error al obtener datos.' });
        }
        return res.json(results.rows); // 🔄 En Postgres los datos vienen en results.rows
    });
});

// --- RUTA GET PÚBLICA: OBTENER SOLO LAS DONACIONES VISIBLES EN LA WEB ---
app.get('/api/donaciones/aprobadas', (req, res) => {
    // 🛠️ ACTUALIZADO: Ahora busca las que tengan el estado unificado 'Aprobado y Destinado'
    const sql = "SELECT nombre, categoria, fecha FROM donaciones WHERE estado = 'Aprobado y Destinado' ORDER BY id DESC";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener el historial público:', err);
            return res.status(500).json({ error: 'Error al obtener el historial.' });
        }
        return res.json(results.rows); // 🔄 En Postgres los datos vienen en results.rows
    });
});

// --- 4. RUTA PUT: ACTUALIZAR EL ESTADO DE LA DONACIÓN ---
app.put('/api/donaciones/:id/estado', (req, res) => {
    const { id } = req.params;
    const { nuevoEstado } = req.body;

    const estadosPermitidos = ['Pendiente', 'Recibido', 'Aprobado y Destinado'];
    
    if (!estadosPermitidos.includes(nuevoEstado)) {
        console.log(`🚫 Bloqueado en servidor: '${nuevoEstado}' no está en la lista permitida.`);
        return res.status(400).json({ error: 'Estado no válido.' });
    }

    const sql = `UPDATE donaciones SET estado = $1 WHERE id = $2`;
    
    db.query(sql, [nuevoEstado, id], (err, result) => {
        if (err) {
            // 🔍 ESTO NOS VA A DECIR EL ERROR REAL EN LA CONSOLA NEGRA
            console.log("================== ERROR EN POSTGRES ==================");
            console.error(err);
            console.log("=======================================================");
            return res.status(500).json({ error: 'Error al actualizar estado.' });
        }
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Donación no encontrada.' });
        }

        return res.json({ mensaje: 'Estado actualizado con éxito.', nuevoEstado });
    });
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});