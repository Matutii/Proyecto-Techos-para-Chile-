import { EntitySchema } from "typeorm";

export const Cuadrilla = new EntitySchema({
    name: "Cuadrilla",
    tableName: "cuadrillas",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        nombre: {
            type: "varchar",
            length: 200,
            nullable: false,
            unique: true,
        },
        especialidad: {
            type: "enum",
            enum: ["fuerza_general", "tecnico", "logistica"],
            nullable: false,
        },
        estado: {
            type: "enum",
            enum: ["En_formacion", "Lista_para_asignacion", "Disuelta"],
            default: "En_formacion",
        },
        jefeCuadrillaId: {
            type: "int",
            nullable: true,
            name: "jefe_cuadrilla_id",
        },
        proyectoId: {
            type: "int",
            nullable: true,
            name: "proyecto_id",
        },
        creadoEn: {
            type: "timestamp",
            createDate: true,
            name: "creado_en",
        },
        actualizadoEn: {
            type: "timestamp",
            updateDate: true,
            name: "actualizado_en",
        },
    },
    relations: {
        jefeCuadrilla: {
            type: "many-to-one",
            target: "Voluntario",
            joinColumn: { name: "jefe_cuadrilla_id" },
            onDelete: "SET NULL",
        },
        proyecto: {
            type: "many-to-one",
            target: "Proyecto",
            joinColumn: { name: "proyecto_id" },
            onDelete: "SET NULL",
        },
        voluntarios: {
            type: "one-to-many",
            target: "CuadrillaVoluntario",
            inverseSide: "cuadrilla",
        },
    },
    indices: [
        {
            columns: ["especialidad"],
        },
        {
            columns: ["estado"],
        },
    ],
});
