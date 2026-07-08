// Punto de entrada: conecta la BD, siembra datos iniciales y levanta el servidor Express
import './config/configEnv.mjs';
import { connectDb } from './config/configDb.mjs';
import { createInitialUsers, createInitialData } from './config/initDb.mjs';
import app from './app.mjs';
import { PORT } from './config/configEnv.mjs';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    await connectDb();
    await createInitialUsers();
    await createInitialData();

    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
        console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
}

main().catch((err) => {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
});
