import { DataSource } from 'typeorm';
import { HOST, DB_PORT, DB_USERNAME, PASSWORD, DATABASE } from './configEnv.mjs';
import { Usuario } from '../entities/usuario.entity.mjs';
import { Proyecto } from '../entities/proyecto.entity.mjs';
import { Material } from '../entities/material.entity.mjs';
import { AsignacionMaterial } from '../entities/asignacionMaterial.entity.mjs';
import { HistorialStock } from '../entities/historialStock.entity.mjs';
import { Voluntario } from '../entities/voluntario.entity.mjs';
import { Donacion } from '../entities/donacion.entity.mjs';
import { Cuadrilla } from '../entities/cuadrilla.entity.mjs';
import { CuadrillaVoluntario } from '../entities/cuadrillaVoluntario.entity.mjs';
import { HistorialCuadrilla } from '../entities/historialCuadrilla.entity.mjs';

// DataSource de TypeORM con todas las entidades registradas.
// synchronize se corre a mano en connectDb() (ver parchearCuadrillasViejas) para
// poder rellenar datos existentes antes de que se apliquen columnas NOT NULL nuevas.
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: HOST,
    port: DB_PORT,
    username: DB_USERNAME,
    password: PASSWORD,
    database: DATABASE,
    synchronize: false,
    logging: false,
    entities: [Usuario, Proyecto, Material, AsignacionMaterial, HistorialStock, Voluntario, Donacion, Cuadrilla, CuadrillaVoluntario, HistorialCuadrilla],
});

// Corrige cuadrillas creadas antes de que 'codigo' y 'jefeCuadrillaId' fueran
// obligatorios, para que el synchronize de TypeORM no falle con "contiene valores null"
// al agregar esas restricciones sobre filas ya existentes.
async function parchearCuadrillasViejas() {
    const runner = AppDataSource.createQueryRunner();

    try {
        const tabla = await runner.getTable('cuadrillas');
        if (!tabla) return;

        const tieneCodigo = tabla.columns.some((c) => c.name === 'codigo');
        if (!tieneCodigo) {
            await runner.query('ALTER TABLE cuadrillas ADD COLUMN IF NOT EXISTS codigo varchar(50)');
        }
        await runner.query(
            "UPDATE cuadrillas SET codigo = 'CUA-' || LPAD(id::text, 3, '0') WHERE codigo IS NULL",
        );

        const sinJefe = await runner.query(
            'SELECT count(*)::int AS cantidad FROM cuadrillas WHERE jefe_cuadrilla_id IS NULL',
        );
        if (sinJefe[0].cantidad > 0) {
            const voluntario = await runner.query(
                "SELECT id FROM voluntarios WHERE estado = 'Activo' ORDER BY id LIMIT 1",
            );
            if (voluntario.length > 0) {
                await runner.query('UPDATE cuadrillas SET jefe_cuadrilla_id = $1 WHERE jefe_cuadrilla_id IS NULL', [
                    voluntario[0].id,
                ]);
            } else {
                console.warn(
                    'No hay voluntarios activos para asignar como jefe de cuadrillas antiguas; el synchronize podría fallar.',
                );
            }
        }
    } finally {
        await runner.release();
    }
}

export async function connectDb() {
    try {
        await AppDataSource.initialize();
        await parchearCuadrillasViejas();
        await AppDataSource.synchronize();
        console.log('Base de datos conectada correctamente');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        process.exit(1);
    }
}
