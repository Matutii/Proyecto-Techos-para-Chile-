// Configuración de la app Express: middlewares globales, rutas de la API,
// frontend estático y manejo centralizado de errores.
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import authRoutes from './routes/authRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import voluntarioRoutes from './routes/voluntarioRoutes.js';
import donacionRoutes from './routes/donacionRoutes.js';
import cuadrillaRoutes from './routes/cuadrillaRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend estático (login, registro y dashboards por rol)
app.use(express.static(publicDir));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/voluntarios', voluntarioRoutes);
app.use('/api/donaciones', donacionRoutes);
app.use('/api/cuadrillas', cuadrillaRoutes);
app.use('/api/proyectos', proyectoRoutes);

app.get('/api/health', (req, res) => {
    res.json({ estado: 'ok', timestamp: new Date().toISOString() });
});

// Cualquier ruta que no sea /api/* devuelve el index del frontend (SPA)
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

// 404 para rutas /api/* que no matchearon ningún router
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador central de errores: los servicios lanzan Error con err.status
// y aquí se traduce a respuesta JSON (500 si no se especificó status)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
    });
});

export default app;
