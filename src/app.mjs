import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import voluntarioRoutes from './routes/voluntarioRoutes.js';
import donacionRoutes from './routes/donacionRoutes.js';
import cuadrillaRoutes from './routes/cuadrillaRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';

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

app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/voluntarios', voluntarioRoutes);
app.use('/api/donaciones', donacionRoutes);
app.use('/api/cuadrillas', cuadrillaRoutes);
app.use('/api/proyectos', proyectoRoutes);

app.get('/api/health', (req, res) => {
    res.json({ estado: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
    });
});

export default app;
