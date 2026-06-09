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
| Validación | express-validator |

---

## Avance actual

- ✅ Entidades creadas desde el MER
- ✅ Servicios, controladores y rutas implementados
- ✅ Autenticación JWT + bcrypt con permisos por rol
- ✅ Seed automático con datos de prueba
- ✅ Base de datos conectada y tablas sincronizadas

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
# Editar .env con tus credenciales de BD
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

## Usuarios de prueba

El seed crea automáticamente estos usuarios al iniciar la app:

| Email | Contraseña | Rol |
|---|---|---|
| admin@techos.cl | Admin1234 | admin |
| bodega@techos.cl | Admin1234 | coordinador_logistica |

---

## API Endpoints

### Autenticación — `/api/auth`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/login` | ❌ | Iniciar sesión |
| GET | `/perfil` | ✅ | Obtener perfil del usuario autenticado |

### Stock — `/api/stock`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | ✅ | Listar materiales |
| GET | `/proyectos` | ✅ | Vista agrupada por proyecto |
| GET | `/:id` | ✅ | Obtener material + historial |
| POST | `/` | ✅ | Crear material (admin/coordinador) |
| PATCH | `/:id/estado` | ✅ | Actualizar estado del material |

### Voluntarios — `/api/voluntarios`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/inscripcion` | ❌ | Inscribir voluntario |
| GET | `/` | ✅ | Listar voluntarios |
| GET | `/:id` | ✅ | Obtener voluntario por ID |

### Donaciones — `/api/donaciones`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/metodos-pago` | ❌ | Métodos de pago disponibles |
| POST | `/` | ❌ | Registrar una donación |
| GET | `/` | ✅ | Listar donaciones (admin/coordinador) |

### Health

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Verificar servidor activo |

---

## Licencia

Proyecto académico — Metodología del Desarrollo.
