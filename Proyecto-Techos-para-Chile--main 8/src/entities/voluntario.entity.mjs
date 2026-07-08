import { EntitySchema } from "typeorm";

export const Voluntario = new EntitySchema({
    name: "Voluntario",
    tableName: "voluntarios",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        nombre: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        apellido: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        email: {
            type: "varchar",
            length: 150,
            nullable: false,
            unique: true,
        },
        telefono: {
            type: "varchar",
            length: 20,
            nullable: true,
        },
        datosMedicos: {
            type: "text",
            nullable: false,
            name: "datos_medicos",
        },
        contactoEmergenciaNombre: {
            type: "varchar",
            length: 100,
            nullable: false,
            name: "contacto_emergencia_nombre",
        },
        contactoEmergenciaTelefono: {
            type: "varchar",
            length: 20,
            nullable: false,
            name: "contacto_emergencia_telefono",
        },
        terminosAceptados: {
            type: "boolean",
            default: false,
            name: "terminos_aceptados",
        },
        terminosAceptadosEn: {
            type: "timestamp",
            nullable: true,
            name: "terminos_aceptados_en",
        },
        estado: {
            type: "enum",
            enum: ["Pendiente", "Activo", "Rechazado"],
            default: "Pendiente",
        },
        especialidad: {
            type: "enum",
            enum: ["fuerza_general", "tecnico", "jefe_cuadrilla"],
            nullable: true,
        },
        experienciaAnos: {
            type: "int",
            default: 0,
            name: "experiencia_anos",
        },
        habilidades: {
            type: "text",
            nullable: true,
        },
        inscritoEn: {
            type: "timestamp",
            createDate: true,
            name: "inscrito_en",
        },
    },
    indices: [
        {
            columns: ["especialidad"],
        },
    ],
});
