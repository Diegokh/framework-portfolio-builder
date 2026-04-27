# Framework Portfolio Builder

Aplicación web para gestionar y mostrar proyectos de desarrollo de software. Incluye panel de administración privado con CRUD completo y perfil profesional público.

## Stack tecnológico

**Frontend:** Angular 21 · Angular Material · Angular Signals · RxJS  
**Backend:** Node.js 20 · Express 4 · JWT · bcrypt · multer  
**Base de datos:** MySQL 8 (MariaDB compatible)

## Funcionalidades

- Registro y login con autenticación JWT
- Dashboard con métricas en tiempo real
- CRUD completo de proyectos
- Filtrado por nombre y estado
- Asociación de tecnologías por proyecto
- Subida de capturas de pantalla
- Perfil profesional editable

## Requisitos previos

- Node.js 20+
- Angular CLI 21+
- MySQL 8 / MariaDB (o XAMPP)

## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Diegokh/framework-portfolio-builder.git
cd framework-portfolio-builder
```

### 2. Configurar el backend

```bash
cd backend
npm install
cp .env.example .env   # Edita con tus credenciales de base de datos
npm run dev
```

El servidor arranca en `http://localhost:3001`

### 3. Configurar el frontend

```bash
cd frontend
npm install
ng serve
```

La app estará disponible en `http://localhost:4200`

### Variables de entorno (`backend/.env`)

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=framework_portfolio_builder_db
JWT_SECRET=cambia_esto_por_una_cadena_larga_y_aleatoria
FRONTEND_URL=http://localhost:4200
```

## Estructura del proyecto

```
framework-portfolio-builder/
├── backend/
│   └── src/
│       ├── routes/       → endpoints de la API
│       ├── middleware/   → autenticación JWT
│       └── db/           → conexión MySQL
├── frontend/
│   └── src/app/
│       ├── core/         → auth, servicios, modelos
│       ├── features/     → dashboard, proyectos, auth
│       └── shared/       → componentes reutilizables
└── README.md
```

## API endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Crear cuenta |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/projects` | Listar proyectos |
| POST | `/api/projects` | Crear proyecto |
| PUT | `/api/projects/:id` | Editar proyecto |
| DELETE | `/api/projects/:id` | Eliminar proyecto |
| GET | `/api/stats` | Métricas del dashboard |

## Autor

Desarrollado por **Diego** como proyecto final del Sprint 5 — AccioSoft Dev Academy
