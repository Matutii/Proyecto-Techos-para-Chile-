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

export async function createInitialData() {
    const proyectoRepo = AppDataSource.getRepository('Proyecto');
    const materialRepo = AppDataSource.getRepository('Material');
    const voluntarioRepo = AppDataSource.getRepository('Voluntario');
    const donacionRepo = AppDataSource.getRepository('Donacion');

    if (await proyectoRepo.count() > 0) {
        console.log('Datos de prueba ya existen, se omite seed');
        return;
    }

    const proyectos = await proyectoRepo.save([
        {
            nombre: 'Construcción Villa Esperanza',
            descripcion: 'Vivienda completa para familia de 5 integrantes en sector Los Álamos',
            estado: 'en_curso',
        },
        {
            nombre: 'Reparación Santa María',
            descripcion: 'Reparación de techo y filtraciones en hogar de adulto mayor',
            estado: 'pendiente',
        },
        {
            nombre: 'Habitaciones Solidarias',
            descripcion: 'Construcción de 2 dormitorios adicionales para familia numerosa',
            estado: 'activo',
        },
    ]);

    await materialRepo.save([
        {
            nombre: 'Ladrillos',
            descripcion: 'Ladrillo fiscal cerámico 10x20x5cm',
            estado: 'Disponible',
            proyectoId: proyectos[0].id,
        },
        {
            nombre: 'Cemento',
            descripcion: 'Saco de cemento Portland 42.5 kg',
            estado: 'Disponible',
            proyectoId: proyectos[0].id,
        },
        {
            nombre: 'Tejas',
            descripcion: 'Teja cerámica curvas para techumbre',
            estado: 'Disponible',
            proyectoId: proyectos[1].id,
        },
        {
            nombre: 'Madera 2x4',
            descripcion: 'Pino cepillado 2x4 pulgadas x 3.2m',
            estado: 'Disponible',
            proyectoId: proyectos[2].id,
        },
        {
            nombre: 'Pintura blanca',
            descripcion: 'Galón de pintura blanca lavable 5L',
            estado: 'Disponible',
            proyectoId: proyectos[1].id,
        },
    ]);

    await voluntarioRepo.save([
        {
            nombre: 'Carlos',
            apellido: 'Muñoz',
            email: 'carlos.munoz@mail.com',
            telefono: '912345678',
            datosMedicos: 'Ninguna condición médica',
            contactoEmergenciaNombre: 'Ana Muñoz',
            contactoEmergenciaTelefono: '987654321',
            terminosAceptados: true,
            terminosAceptadosEn: new Date(),
            estado: 'Activo',
            especialidad: 'jefe_cuadrilla',
            experienciaAnos: 6,
            habilidades: 'Liderazgo de equipos, lectura de planos',
        },
        {
            nombre: 'María',
            apellido: 'González',
            email: 'maria.gonzalez@mail.com',
            telefono: '955667788',
            datosMedicos: 'Asma controlada',
            contactoEmergenciaNombre: 'Pedro González',
            contactoEmergenciaTelefono: '944556677',
            terminosAceptados: true,
            terminosAceptadosEn: new Date(),
            estado: 'Activo',
            especialidad: 'tecnico',
            experienciaAnos: 3,
            habilidades: 'Carpintería, soldadura básica',
        },
        {
            nombre: 'José',
            apellido: 'Pérez',
            email: 'jose.perez@mail.com',
            telefono: '933221144',
            datosMedicos: 'Ninguna condición médica',
            contactoEmergenciaNombre: 'Rosa Pérez',
            contactoEmergenciaTelefono: '922113344',
            terminosAceptados: true,
            terminosAceptadosEn: new Date(),
            estado: 'Activo',
            especialidad: 'fuerza_general',
            experienciaAnos: 1,
            habilidades: 'Trabajo en equipo, carga y descarga',
        },
        {
            nombre: 'Ana',
            apellido: 'Soto',
            email: 'ana.soto@mail.com',
            telefono: '966778899',
            datosMedicos: 'Alergia al polvo',
            contactoEmergenciaNombre: 'Luis Soto',
            contactoEmergenciaTelefono: '955889900',
            terminosAceptados: true,
            terminosAceptadosEn: new Date(),
            estado: 'Activo',
            especialidad: 'tecnico',
            experienciaAnos: 4,
            habilidades: 'Electricidad domiciliaria, instalaciones sanitarias',
        },
    ]);

    await donacionRepo.save([
        {
            donanteNombre: 'Empresa Constructora del Sur SA',
            donanteEmail: 'contacto@constructorasur.cl',
            monto: 500000,
            metodoPago: 'transferencia',
            estado: 'pendiente',
        },
        {
            donanteNombre: 'Juan López',
            donanteEmail: 'juan.lopez@mail.com',
            monto: 25000,
            metodoPago: 'efectivo',
            estado: 'confirmada',
        },
        {
            donanteNombre: 'Fundación Ayuda Solidaria',
            donanteEmail: 'info@ayudasolidaria.org',
            monto: 1200000,
            metodoPago: 'transferencia',
            estado: 'pendiente',
        },
    ]);

    console.log('Datos de prueba creados correctamente');
}
