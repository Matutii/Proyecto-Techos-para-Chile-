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
        estado: {
            type: "enum",
            enum: ["Disponible", "Agotado", "En_camino"],
            default: "Disponible",
        },
        proyectoId: {
            type: "int",
            nullable: true,
            name: "proyecto_id",
        },
        actualizadoEn: {
            type: "timestamp",
            createDate: true,
            name: "actualizado_en",
        },
    },
    relations: {
        proyecto: {
            type: "many-to-one",
            target: "Proyecto",
            joinColumn: { name: "proyecto_id" },
            onDelete: "SET NULL",
        },
    },
});
