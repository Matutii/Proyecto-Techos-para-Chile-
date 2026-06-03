<p align="center">
  <img src="assets/logo.png" width="180" alt="Techo para Chile" />
</p>

<h1 align="center">Techos Para Chile — Backend</h1>

<p align="center">
  Sistema de gestión operacional para coordinación de voluntarios, materiales y donaciones en terreno.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white" />
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
| ORM | Prisma |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT + bcryptjs |
| Validación | express-validator |

---

## Requisitos

- Node.js 18 o superior
- PostgreSQL 16
- npm 9+

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Matutii/Proyecto-Techos-para-Chile-.git
cd Proyecto-Techos-para-Chile-

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Ejecutar migraciones
npx prisma migrate dev

# 5. Poblar datos iniciales
npx prisma db seed

# 6. Iniciar servidor
npm run dev
```

---

## Variables de entorno

```env
PORT=3000
DATABASE_URL="postgresql://usuario:password@localhost:5432/techos_para_chile"
JWT_SECRET=tu_clave_secreta_minimo_32_caracteres
NODE_ENV=development
```

---

## Estructura del proyecto

```
src/
├── config/          # Configuración de base de datos y variables
├── controllers/     # Lógica de respuesta HTTP
├── middlewares/     # Auth, roles, manejo de errores
├── routes/          # Definición de endpoints
├── services/        # Lógica de negocio
├── validations/     # Esquemas de validación de entrada
└── index.js         # Punto de entrada
prisma/
├── schema.prisma    # Modelos y relaciones
├── migrations/      # Historial de migraciones
└── seed.js          # Datos iniciales
assets/
└── logo.png         # Logo del proyecto
```

---

## Módulos

### Autenticación
Identificación de usuarios por rol con filtrado de acceso por módulo.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | Pública | Login, retorna JWT |
| GET | `/api/auth/me` | Autenticado | Perfil del usuario activo |

### Stock de Materiales
Gestión manual del estado de materiales por parte del coordinador de logística, con historial de auditoría y reflejo en vista de proyectos.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/stock` | Autenticado | Listar materiales |
| GET | `/api/stock/:id` | Autenticado | Material + historial |
| POST | `/api/stock` | Bodega | Crear material |
| PATCH | `/api/stock/:id/estado` | Bodega | Actualizar estado |
| GET | `/api/stock/proyectos` | Autenticado | Vista general por proyecto |

### Voluntarios
Inscripción, clasificación automática y habilitación de perfiles para asignación inmediata a proyectos.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/voluntarios/inscripcion` | Pública | Inscripción + habilitación automática |
| GET | `/api/voluntarios` | Autenticado | Panel de logística |
| GET | `/api/voluntarios/:id` | Autenticado | Perfil completo |

### Donaciones
Registro y seguimiento de donaciones con panel administrativo.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/donaciones/info` | Pública | Métodos de pago disponibles |
| POST | `/api/donaciones` | Pública | Registrar donación |
| GET | `/api/donaciones` | Admin | Listar donaciones |

---

## Roles y permisos

| Rol | Acceso |
|---|---|
| `admin` | Acceso total |
| `coordinador_logistica` | Stock, voluntarios, proyectos |
| `colaborador` | Solo lectura general |

---

## Usuarios de prueba

| Email | Password | Rol |
|---|---|---|
| admin@techos.cl | Admin1234 | admin |
| bodega@techos.cl | Admin1234 | coordinador_logistica |

---

## Licencia

Proyecto académico — Metodología del Desarrollo.
