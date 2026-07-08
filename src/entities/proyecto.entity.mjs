import { EntitySchema } from "typeorm";

export const Proyecto = new EntitySchema({
    name: "Proyecto",
    tableName: "proyectos",
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
            enum: ["activo", "pausado", "finalizado"],
            default: "activo",
        },
        creadoEn: {
            type: "timestamp",
            createDate: true,
            name: "creado_en",
        },
    },
});
