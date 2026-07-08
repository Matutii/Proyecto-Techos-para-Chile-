import { EntitySchema } from "typeorm";

export const Material = new EntitySchema({
    name: "Material",
    tableName: "materiales",
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
        },
        descripcion: {
            type: "text",
            nullable: true,
        },
        cantidadDisponible: {
            type: "int",
            default: 0,
            name: "cantidad_disponible",
        },
        umbralBajoStock: {
            type: "int",
            nullable: false,
            name: "umbral_bajo_stock",
        },
        actualizadoEn: {
            type: "timestamp",
            createDate: true,
            name: "actualizado_en",
        },
    },
});
