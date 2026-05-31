const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// --- MIDDLEWARES ---
app.use(cors());
app.use(bodyParser.json());

// Sirve los archivos estáticos de la carpeta "public"
app.use(express.static('../public')); 

// --- 1. CONFIGURACIÓN DE LA CONEXIÓN A MYSQL ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ies6039',
    database: 'hospital_guemes'
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('¡Conectado exitosamente a la base de datos hospital_guemes!');
});

// --- 2. RUTA POST: RECIBIR Y GUARDAR DONACIÓN ---
app.post('/api/donaciones', (req, res) => {
    const { tipoDonante, nombreCompleto, nombreEmpresa, dni, fechaNacimiento, correo, categoria } = req.body;

    const nombreFinal = (tipoDonante === 'empresa') ? nombreEmpresa : nombreCompleto;
    const dniFinal = (tipoDonante === 'persona') ? dni : null;
    const fechaNacFinal = (tipoDonante === 'persona') ? fechaNacimiento : null;

    const sql = `INSERT INTO donaciones (tipo_donante, nombre, dni, fecha_nacimiento, correo, categoria, estado) 
                 VALUES (?, ?, ?, ?, ?, ?, 'Pendiente')`;
    
    const valores = [tipoDonante, nombreFinal, dniFinal, fechaNacFinal, correo, categoria];

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error('Error al insertar donación:', err);
            return res.status(500).json({ error: 'Error al guardar la donación.' });
        }
        res.status(201).json({ mensaje: 'Donación registrada como Pendiente.', id: result.insertId });
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
        res.json(results);
    });
});
// --- RUTA GET PÚBLICA: OBTENER SOLO LAS DONACIONES APROBADAS ---
app.get('/api/donaciones/aprobadas', (req, res) => {
    // Filtramos en la consulta SQL para traer solo las aprobadas y ordenadas por las más recientes
    const sql = "SELECT nombre, categoria, fecha FROM donaciones WHERE estado = 'Aprobado y Destinado' ORDER BY id DESC";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener el historial público:', err);
            return res.status(500).json({ error: 'Error al obtener el historial.' });
        }
        res.json(results);
    });
});
// --- 4. RUTA PUT: ACTUALIZAR EL ESTADO DE LA DONACIÓN ---
app.put('/api/donaciones/:id/estado', (req, res) => {
    const { id } = req.params;
    const { nuevoEstado } = req.body;

    const estadosPermitidos = ['Pendiente', 'Recibido', 'Aprobado y Destinado'];
    
    if (!estadosPermitidos.includes(nuevoEstado)) {
        return res.status(400).json({ error: 'Estado no válido.' });
    }

    const sql = `UPDATE donaciones SET estado = ? WHERE id = ?`;
    
    db.query(sql, [nuevoEstado, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar estado:', err);
            return res.status(500).json({ error: 'Error al actualizar estado.' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Donación no encontrada.' });
        }

        res.json({ mensaje: 'Estado actualizado con éxito.', nuevoEstado });
    });
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor de la Práctica 3 corriendo en http://localhost:${PORT}`);
});