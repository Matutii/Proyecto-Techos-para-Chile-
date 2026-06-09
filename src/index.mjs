import './config/configEnv.mjs';
import { connectDb } from './config/configDb.mjs';
import { createInitialUsers } from './config/initDb.mjs';
import app from './app.mjs';
import { PORT } from './config/configEnv.mjs';

async function main() {
    await connectDb();
    await createInitialUsers();

    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
        console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
}

main().catch((err) => {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
});
