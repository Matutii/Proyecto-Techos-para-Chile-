import { EntitySchema } from "typeorm";

export const Usuario = new EntitySchema({
    name: "Usuario",
    tableName: "usuarios",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        nombre: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        email: {
            type: "varchar",
            length: 150,
            nullable: false,
            unique: true,
        },
        passwordHash: {
            type: "varchar",
            length: 255,
            nullable: false,
            name: "password_hash",
        },
        rol: {
            type: "enum",
            enum: ["admin", "colaborador", "coordinador_logistica", "encargado_cuadrillas", "visitante"],
            nullable: false,
            default: "visitante",
        },
        activo: {
            type: "boolean",
            default: true,
        },
        creadoEn: {
            type: "timestamp",
            createDate: true,
            name: "creado_en",
        },
    },
});
