<p align="center">
  <img src="assets/logo.png" width="300" alt="Techo para Chile" />
</p>

<h1 align="center">Techos Para Chile</h1>

<p align="center">
  Sistema de gestión operacional para coordinación de voluntarios, materiales y donaciones en terreno.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeORM-FE0803?logo=typeorm&logoColor=white" alt="TypeORM" />
  <img src="https://img.shields.io/badge/JWT-auth-000000?logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css&logoColor=white" alt="CSS3" />
</p>

---

## Descripción

Sistema de gestión operacional para **Techos Para Chile**, organización que coordina cuadrillas de voluntarios en proyectos de construcción social. Centraliza la gestión de stock de materiales, inscripción y aprobación de voluntarios, autenticación por roles, registro de donaciones y asignación de cuadrillas.

Es una app monolítica: Express sirve tanto la API (`/api/*`) como el frontend estático (`public/`) desde el mismo proceso y puerto.

---

## Funcionalidades

- **Bodega**: alta y edición de materiales, entradas de stock, asignación a proyectos, retiros en terreno y estado calculado automáticamente (Disponible / Bajo stock / Agotado), con historial completo de movimientos.
- **Proyectos**: creación y edición de obras, con vista de stock asignado por proyecto.
- **Voluntarios**: inscripción pública con ficha completa (datos médicos, contacto de emergencia, experiencia), clasificación automática de especialidad y flujo de aprobación/rechazo.
- **Cuadrillas**: creación de equipos de trabajo y asignación de voluntarios aprobados.
- **Donaciones**: registro público (anónimo o con nombre) y gestión de confirmación/rechazo.
- **Usuarios**: cuentas con roles y permisos diferenciados, activación/desactivación y filtros por rol y estado.

---

## Roles y permisos

| Rol | Puede |
|---|---|
| `admin` | Todo: usuarios, bodega, proyectos, cuadrillas, voluntarios y donaciones |
| `coordinador_logistica` (Bodega) | Gestionar stock, proyectos, cuadrillas y donaciones |
| `encargado_cuadrillas` | Gestionar cuadrillas y aprobar/rechazar voluntarios |
| `colaborador` | Ver bodega y retirar materiales en terreno |
| `visitante` | Donar desde su cuenta |

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
| Frontend | HTML/CSS/JS vanilla (`public/`), servido como estático por Express |

---

## Instalación

Requisitos: Node.js 18+, PostgreSQL 16, npm 9+.

```bash
git clone https://github.com/Matutii/Proyecto-Techos-para-Chile-.git
cd Proyecto-Techos-para-Chile-
npm install
cp .env.example .env
# Editar .env con tus credenciales de BD
npm run dev
```

La app completa (API + frontend) queda disponible en `http://localhost:3000`.

### Variables de entorno

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

### Usuarios de prueba

El seed crea automáticamente estos usuarios al iniciar la app:

| Email | Contraseña | Rol |
|---|---|---|
| admin@techos.cl | Admin1234 | admin |
| bodega@techos.cl | Admin1234 | coordinador_logistica |

Además, cualquiera puede crear una cuenta propia con rol `visitante` desde `POST /api/auth/registro` (o el tab "Crear cuenta" del frontend). Los roles `colaborador` y `encargado_cuadrillas` los crea un admin desde el panel de Usuarios.

---

## API Endpoints

### Autenticación — `/api/auth`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/login` | ❌ | Iniciar sesión |
| POST | `/registro` | ❌ | Crear cuenta pública con rol `visitante` |
| GET | `/perfil` | ✅ | Obtener perfil del usuario autenticado |

### Usuarios — `/api/usuarios` (solo admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar usuarios |
| POST | `/` | Crear cuenta con rol específico |
| PATCH | `/:id` | Cambiar rol y/o activar/desactivar cuenta |

### Stock — `/api/stock`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | ✅ | Listar materiales (cantidad, umbral, estado calculado) |
| GET | `/proyectos` | ✅ | Detalle de materiales asignados por proyecto |
| GET | `/:id` | ✅ | Obtener material + historial |
| POST | `/` | ✅ | Crear material (admin/coordinador) |
| POST | `/:id/entrada` | ✅ | Registrar entrada de stock (admin/coordinador) |
| POST | `/:id/asignar` | ✅ | Asignar material a un proyecto (admin/coordinador) |
| PATCH | `/:id/retiro` | ✅ | Retirar material (admin/coordinador/colaborador) |
| PUT | `/:id` | ✅ | Editar nombre, descripción y/o umbral de un material (admin/coordinador) |

### Proyectos — `/api/proyectos`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | ✅ | Listar proyectos |
| POST | `/` | ✅ | Crear proyecto (admin/coordinador) |
| PUT | `/:id` | ✅ | Editar nombre, descripción y/o estado (admin/coordinador) |

### Voluntarios — `/api/voluntarios`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/inscripcion` | ❌ | Inscribir voluntario (queda en estado `Pendiente`) |
| GET | `/` | ✅ | Listar voluntarios |
| GET | `/:id` | ✅ | Obtener ficha completa de un voluntario |
| PATCH | `/:id/estado` | ✅ | Aprobar o rechazar voluntario (admin/encargado_cuadrillas) |

### Cuadrillas — `/api/cuadrillas`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | ✅ | Listar cuadrillas |
| GET | `/:id` | ✅ | Obtener cuadrilla + integrantes |
| POST | `/` | ✅ | Crear cuadrilla (admin/coordinador/encargado_cuadrillas) |
| PUT | `/:id` | ✅ | Actualizar cuadrilla (admin/coordinador/encargado_cuadrillas) |
| DELETE | `/:id` | ✅ | Eliminar cuadrilla (solo admin) |
| POST | `/:id/voluntarios` | ✅ | Agregar voluntario aprobado a una cuadrilla |

### Donaciones — `/api/donaciones`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/metodos-pago` | ❌ | Métodos de pago disponibles |
| POST | `/` | opcional | Registrar una donación (si hay token, queda vinculada al usuario) |
| GET | `/` | ✅ | Listar donaciones (admin/coordinador) |
| PATCH | `/:id/estado` | ✅ | Aceptar o rechazar una donación (admin/coordinador) |

### Health

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Verificar servidor activo |

---

## Licencia

Proyecto académico — Metodología del Desarrollo.
