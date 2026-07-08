// Equipos de trabajo; pueden tener jefe (voluntario) y proyecto asignado
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
        codigo: {
            type: "varchar",
            length: 50,
            nullable: false,
            unique: true,
        },
        nombre: {
            type: "varchar",
            length: 200,
            nullable: false,
        },
        especialidad: {
            type: "enum",
            enum: ["fuerza_general", "tecnico", "logistica"],
            nullable: false,
        },
        estado: {
            type: "enum",
            enum: ["En_formacion", "Lista_para_asignacion", "Disuelta"],
            default: "Lista_para_asignacion",
        },
        jefeCuadrillaId: {
            type: "int",
            nullable: false,
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
        historial: {
            type: "one-to-many",
            target: "HistorialCuadrilla",
            inverseSide: "cuadrilla",
        },
    },
    indices: [
        {
            columns: ["codigo"],
            unique: true,
        },
        {
            columns: ["especialidad"],
        },
        {
            columns: ["estado"],
        },
    ],
});
