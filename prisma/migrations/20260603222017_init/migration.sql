-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('admin', 'colaborador', 'coordinador_logistica');

-- CreateEnum
CREATE TYPE "EstadoMaterial" AS ENUM ('Disponible', 'Agotado', 'En camino');

-- CreateEnum
CREATE TYPE "EstadoVoluntario" AS ENUM ('Pendiente', 'Activo', 'Rechazado');

-- CreateEnum
CREATE TYPE "Especialidad" AS ENUM ('fuerza_general', 'tecnico', 'jefe_cuadrilla');

-- CreateEnum
CREATE TYPE "EstadoDonacion" AS ENUM ('pendiente', 'confirmada', 'rechazada');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('transferencia', 'tarjeta', 'efectivo');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proyectos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'activo',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiales" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoMaterial" NOT NULL DEFAULT 'Disponible',
    "proyecto_id" INTEGER,
    "actualizado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materiales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_stock" (
    "id" SERIAL NOT NULL,
    "material_id" INTEGER NOT NULL,
    "estado_anterior" VARCHAR(50),
    "estado_nuevo" VARCHAR(50) NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "observacion" TEXT,
    "registrado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voluntarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20),
    "datos_medicos" TEXT NOT NULL,
    "contacto_emergencia_nombre" VARCHAR(100) NOT NULL,
    "contacto_emergencia_telefono" VARCHAR(20) NOT NULL,
    "terminos_aceptados" BOOLEAN NOT NULL DEFAULT false,
    "terminos_aceptados_en" TIMESTAMP(3),
    "estado" "EstadoVoluntario" NOT NULL DEFAULT 'Pendiente',
    "especialidad" "Especialidad",
    "experiencia_anos" INTEGER NOT NULL DEFAULT 0,
    "habilidades" TEXT,
    "inscrito_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voluntarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donaciones" (
    "id" SERIAL NOT NULL,
    "donante_nombre" VARCHAR(150),
    "donante_email" VARCHAR(150),
    "monto" DECIMAL(12,2) NOT NULL,
    "metodo_pago" "MetodoPago",
    "estado" "EstadoDonacion" NOT NULL DEFAULT 'pendiente',
    "usuario_id" INTEGER,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "historial_stock_material_id_registrado_en_idx" ON "historial_stock"("material_id", "registrado_en");

-- CreateIndex
CREATE UNIQUE INDEX "voluntarios_email_key" ON "voluntarios"("email");

-- CreateIndex
CREATE INDEX "voluntarios_especialidad_idx" ON "voluntarios"("especialidad");

-- CreateIndex
CREATE INDEX "donaciones_creado_en_idx" ON "donaciones"("creado_en");

-- AddForeignKey
ALTER TABLE "materiales" ADD CONSTRAINT "materiales_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_stock" ADD CONSTRAINT "historial_stock_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_stock" ADD CONSTRAINT "historial_stock_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
