<p align="center">
  <img src="assets/logo.png" width="300" alt="Techo para Chile" />
</p>

<h1 align="center">Techos Para Chile — Backend</h1>

<p align="center">
  Sistema de gestión operacional para coordinación de voluntarios, materiales y donaciones en terreno.
</p>

---

## Descripción

Backend REST API para **Techos Para Chile**, organización que coordina cuadrillas de voluntarios en proyectos de construcción social. El sistema centraliza la gestión de stock de materiales, inscripción y clasificación de voluntarios, autenticación por roles y registro de donaciones.

---

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4.x |
| ORM | TypeORM |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT + bcrypt |
| Validación | Joi |

---

## Avance actual

- ✅ Entidades creadas desde el MER
- ✅ Configuración de entorno y base de datos
- ✅ Setup inicial para levantar tablas y datos base
- ✅ Configuración de servicios, controladores y rutas

---

## Requisitos

- Node.js 18 o superior
- PostgreSQL 16
- npm 9+

---

## Instalación

```bash
git clone https://github.com/Matutii/Proyecto-Techos-para-Chile-.git
cd Proyecto-Techos-para-Chile-
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

---

## Variables de entorno

```env
PORT=3000
HOST=localhost
NODE_ENV=development

DB_PORT=5432
DB_USERNAME=postgres
PASSWORD=tu_password
DATABASE=techos_para_chile

JWT_SECRET=tu_clave_secreta_minimo_32_caracteres
JWT_EXPIRES_IN=8h
```

---

## Licencia

Proyecto académico — Metodología del Desarrollo.
