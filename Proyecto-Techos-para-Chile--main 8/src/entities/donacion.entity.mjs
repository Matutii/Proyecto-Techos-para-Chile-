import { EntitySchema } from "typeorm";

export const Donacion = new EntitySchema({
    name: "Donacion",
    tableName: "donaciones",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        donanteNombre: {
            type: "varchar",
            length: 150,
            nullable: true,
            name: "donante_nombre",
        },
        donanteEmail: {
            type: "varchar",
            length: 150,
            nullable: true,
            name: "donante_email",
        },
        monto: {
            type: "decimal",
            precision: 12,
            scale: 2,
            nullable: false,
        },
        metodoPago: {
            type: "enum",
            enum: ["transferencia", "tarjeta", "efectivo"],
            nullable: true,
            name: "metodo_pago",
        },
        estado: {
            type: "enum",
            enum: ["pendiente", "confirmada", "rechazada"],
            default: "pendiente",
        },
        comprobante: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        usuarioId: {
            type: "int",
            nullable: true,
            name: "usuario_id",
        },
        creadoEn: {
            type: "timestamp",
            createDate: true,
            name: "creado_en",
        },
    },
    relations: {
        usuario: {
            type: "many-to-one",
            target: "Usuario",
            joinColumn: { name: "usuario_id" },
        },
    },
    indices: [
        {
            columns: ["creadoEn"],
        },
    ],
});
