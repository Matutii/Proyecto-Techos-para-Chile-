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
// synchronize: true crea/actualiza las tablas según las entidades (solo apto para desarrollo).
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: HOST,
    port: DB_PORT,
    username: DB_USERNAME,
    password: PASSWORD,
    database: DATABASE,
    synchronize: true,
    logging: false,
    entities: [Usuario, Proyecto, Material, AsignacionMaterial, HistorialStock, Voluntario, Donacion, Cuadrilla, CuadrillaVoluntario, HistorialCuadrilla],
});

export async function connectDb() {
    try {
        await AppDataSource.initialize();
        console.log('Base de datos conectada correctamente');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        process.exit(1);
    }
}
