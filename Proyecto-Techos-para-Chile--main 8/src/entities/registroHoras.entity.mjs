import { EntitySchema } from "typeorm";

export const RegistroHoras = new EntitySchema({
    name: "RegistroHoras",
    tableName: "registro_horas",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        proyectoId: {
            type: "int",
            nullable: false,
            name: "proyecto_id",
        },
        usuarioId: {
            type: "int",
            nullable: false,
            name: "usuario_id",
        },
        horas: {
            type: "decimal",
            precision: 5,
            scale: 2,
            nullable: false,
        },
        descripcion: {
            type: "text",
            nullable: true,
        },
        registradoEn: {
            type: "timestamp",
            createDate: true,
            name: "registrado_en",
        },
    },
    relations: {
        proyecto: {
            type: "many-to-one",
            target: "Proyecto",
            joinColumn: { name: "proyecto_id" },
            inverseSide: "registrosHoras",
        },
        usuario: {
            type: "many-to-one",
            target: "Usuario",
            joinColumn: { name: "usuario_id" },
        },
    },
    indices: [
        {
            columns: ["proyectoId"],
        },
    ],
});
