import bcrypt from 'bcrypt';
import { AppDataSource } from './configDb.mjs';

// Seed inicial: crea las cuentas base (admin y bodega) solo si la tabla está vacía
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

// Seed de datos de prueba: proyectos, materiales, asignaciones, voluntarios y
// donaciones de ejemplo. Solo corre si no hay proyectos en la BD.
export async function createInitialData() {
    const proyectoRepo = AppDataSource.getRepository('Proyecto');
    const materialRepo = AppDataSource.getRepository('Material');
    const asignacionRepo = AppDataSource.getRepository('AsignacionMaterial');
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

    const materiales = await materialRepo.save([
        {
            nombre: 'Ladrillos',
            descripcion: 'Ladrillo fiscal cerámico 10x20x5cm',
            cantidadDisponible: 350,
            umbralBajoStock: 100,
        },
        {
            nombre: 'Cemento',
            descripcion: 'Saco de cemento Portland 42.5 kg',
            cantidadDisponible: 15,
            umbralBajoStock: 20,
        },
        {
            nombre: 'Tejas',
            descripcion: 'Teja cerámica curvas para techumbre',
            cantidadDisponible: 120,
            umbralBajoStock: 50,
        },
        {
            nombre: 'Madera 2x4',
            descripcion: 'Pino cepillado 2x4 pulgadas x 3.2m',
            cantidadDisponible: 0,
            umbralBajoStock: 30,
        },
        {
            nombre: 'Pintura blanca',
            descripcion: 'Galón de pintura blanca lavable 5L',
            cantidadDisponible: 40,
            umbralBajoStock: 10,
        },
    ]);

    await asignacionRepo.save([
        {
            materialId: materiales[0].id,
            proyectoId: proyectos[0].id,
            cantidadAsignada: 150,
        },
        {
            materialId: materiales[1].id,
            proyectoId: proyectos[0].id,
            cantidadAsignada: 65,
        },
        {
            materialId: materiales[2].id,
            proyectoId: proyectos[1].id,
            cantidadAsignada: 80,
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
