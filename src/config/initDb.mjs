import bcrypt from 'bcrypt';
import { AppDataSource } from './configDb.mjs';

export async function createInitialUsers() {
    const repo = AppDataSource.getRepository('Usuario');
    const count = await repo.count();

    if (count > 0) {
        console.log('Usuarios iniciales ya existen, se omite seed');
        return;
    }

    const hash = await bcrypt.hash('Admin1234', 10);

    await repo.save([
        {
            nombre: 'Administrador',
            email: 'admin@techos.cl',
            passwordHash: hash,
            rol: 'admin',
        },
        {
            nombre: 'Coordinador Bodega',
            email: 'bodega@techos.cl',
            passwordHash: hash,
            rol: 'coordinador_logistica',
        },
    ]);

    console.log('Usuarios iniciales creados correctamente');
}
