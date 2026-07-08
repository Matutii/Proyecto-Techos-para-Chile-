// Cuántas unidades de un material están asignadas a cada proyecto (par único material-proyecto)
import { EntitySchema } from "typeorm";

export const AsignacionMaterial = new EntitySchema({
    name: "AsignacionMaterial",
    tableName: "asignaciones_material",
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
        proyectoId: {
            type: "int",
            nullable: false,
            name: "proyecto_id",
        },
        cantidadAsignada: {
            type: "int",
            nullable: false,
            name: "cantidad_asignada",
        },
    },
    relations: {
        material: {
            type: "many-to-one",
            target: "Material",
            joinColumn: { name: "material_id" },
            onDelete: "CASCADE",
        },
        proyecto: {
            type: "many-to-one",
            target: "Proyecto",
            joinColumn: { name: "proyecto_id" },
            onDelete: "CASCADE",
        },
    },
    indices: [
        {
            columns: ["materialId", "proyectoId"],
            unique: true,
        },
    ],
});
