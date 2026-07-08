// Relación voluntario-cuadrilla con fechas de inicio/fin de la participación
import { EntitySchema } from "typeorm";

export const CuadrillaVoluntario = new EntitySchema({
    name: "CuadrillaVoluntario",
    tableName: "cuadrilla_voluntarios",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        cuadrillaId: {
            type: "int",
            nullable: false,
            name: "cuadrilla_id",
        },
        voluntarioId: {
            type: "int",
            nullable: false,
            name: "voluntario_id",
        },
        fechaInicio: {
            type: "timestamp",
            nullable: false,
            name: "fecha_inicio",
        },
        fechaFin: {
            type: "timestamp",
            nullable: true,
            name: "fecha_fin",
        },
        creadoEn: {
            type: "timestamp",
            createDate: true,
            name: "creado_en",
        },
    },
    relations: {
        cuadrilla: {
            type: "many-to-one",
            target: "Cuadrilla",
            joinColumn: { name: "cuadrilla_id" },
            onDelete: "CASCADE",
        },
        voluntario: {
            type: "many-to-one",
            target: "Voluntario",
            joinColumn: { name: "voluntario_id" },
            onDelete: "CASCADE",
        },
    },
    indices: [
        {
            columns: ["cuadrillaId", "voluntarioId"],
            unique: true,
        },
    ],
});
