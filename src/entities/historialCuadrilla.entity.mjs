import { EntitySchema } from "typeorm";

export const HistorialCuadrilla = new EntitySchema({
    name: "HistorialCuadrilla",
    tableName: "historial_cuadrilla",
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
        accion: {
            type: "enum",
            enum: ["creacion", "modificacion", "disolucion"],
            nullable: false,
        },
        descripcion: {
            type: "text",
            nullable: false,
        },
        usuarioId: {
            type: "int",
            nullable: false,
            name: "usuario_id",
        },
        registradoEn: {
            type: "timestamp",
            createDate: true,
            name: "registrado_en",
        },
    },
    relations: {
        cuadrilla: {
            type: "many-to-one",
            target: "Cuadrilla",
            joinColumn: { name: "cuadrilla_id" },
            onDelete: "CASCADE",
        },
        usuario: {
            type: "many-to-one",
            target: "Usuario",
            joinColumn: { name: "usuario_id" },
        },
    },
});
