import { EntitySchema } from "typeorm";

export const HistorialStock = new EntitySchema({
    name: "HistorialStock",
    tableName: "historial_stock",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        materialId: {
            type: "int",
            nullable: false,
            name: "material_id",
        },
        estadoAnterior: {
            type: "varchar",
            length: 50,
            nullable: true,
            name: "estado_anterior",
        },
        estadoNuevo: {
            type: "varchar",
            length: 50,
            nullable: false,
            name: "estado_nuevo",
        },
        usuarioId: {
            type: "int",
            nullable: false,
            name: "usuario_id",
        },
        observacion: {
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
        material: {
            type: "many-to-one",
            target: "Material",
            joinColumn: { name: "material_id" },
            onDelete: "CASCADE",
        },
        usuario: {
            type: "many-to-one",
            target: "Usuario",
            joinColumn: { name: "usuario_id" },
        },
    },
    indices: [
        {
            columns: ["materialId", "registradoEn"],
        },
    ],
});
