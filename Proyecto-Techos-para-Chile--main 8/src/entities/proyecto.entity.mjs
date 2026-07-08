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
            type: "varchar",
            length: 50,
            default: "activo",
        },
        horasTotales: {
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
            name: "horas_totales",
        },
        creadoEn: {
            type: "timestamp",
            createDate: true,
            name: "creado_en",
        },
    },
    relations: {
        registrosHoras: {
            type: "one-to-many",
            target: "RegistroHoras",
            inverseSide: "proyecto",
        },
    },
});
