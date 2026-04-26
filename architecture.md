## 1. Descripción del producto
 
Framework Portfolio Builder es una aplicación web que permite a desarrolladores gestionar y mostrar su portfolio profesional de forma centralizada. A través de un panel de administración privado, el usuario puede crear, editar y eliminar sus proyectos, asociarles las tecnologías utilizadas y subir capturas de pantalla. La aplicación expone también un perfil público que sirve como carta de presentación ante empleadores y clientes.
 
---
 
## 2. Stack tecnológico
 
### Frontend
- **Angular 17+** con Standalone Components
- **Angular Material** para los componentes de interfaz
- **Angular Signals** para el estado reactivo
- **RxJS** para flujos de datos asíncronos
- **Angular Router** para la navegación entre vistas
### Backend
- **Node.js 20** + **Express 4** como framework de servidor
- **multer** para la subida de capturas de pantalla
- **JWT** + **bcrypt** para autenticación y cifrado de contraseñas
- **mysql2** como driver de base de datos
- **cors** + **helmet** para seguridad HTTP
### Base de datos
- **MySQL 8**
### Herramientas
- **Git** + **GitHub** para control de versiones
- **Postman** para probar la API
- **VS Code** como editor
---
 
## 3. Funcionalidades principales del MVP
 
1. **Gestión CRUD de proyectos** — crear, listar, editar y eliminar proyectos con nombre, descripción, enlaces a repositorio y demo, estado y fechas.
2. **Asociación de tecnologías a cada proyecto** — añadir las tecnologías usadas con su rol (frontend, backend, base de datos o devops).
3. **Subida y gestión de capturas de pantalla** — adjuntar imágenes a cada proyecto con una descripción y un orden de aparición.
4. **Perfil profesional editable** — bio, enlaces a GitHub, LinkedIn y web personal, y listado de skills.
5. **Filtrado y búsqueda** — filtrar proyectos por tecnología, estado (en desarrollo / publicado / archivado) o tags.
---
 
## 4. Esquema de la base de datos
 
### Tabla `projects`
Almacena los proyectos del portfolio.
 
| Campo       | Tipo            | Descripción                                  |
|-------------|-----------------|----------------------------------------------|
| id          | INT PK AI       | Identificador único                          |
| userId      | INT FK          | Usuario propietario                          |
| name        | VARCHAR(120)    | Nombre del proyecto                          |
| description | TEXT            | Descripción detallada                        |
| repoUrl     | VARCHAR(255)    | URL del repositorio                          |
| liveUrl     | VARCHAR(255)    | URL de la demo en producción                 |
| status      | ENUM            | `in_progress` / `published` / `archived`     |
| startDate   | DATE            | Fecha de inicio                              |
| endDate     | DATE            | Fecha de finalización (puede ser NULL)       |
 
### Tabla `project_technologies`
Tecnologías usadas en cada proyecto. Relación 1:N con `projects`.
 
| Campo      | Tipo         | Descripción                                            |
|------------|--------------|--------------------------------------------------------|
| id         | INT PK AI    | Identificador único                                    |
| projectId  | INT FK       | Referencia a `projects.id`                             |
| technology | VARCHAR(60)  | Nombre de la tecnología (Angular, Node.js, etc.)       |
| role       | ENUM         | `frontend` / `backend` / `db` / `devops`               |
 
### Tabla `screenshots`
Capturas de pantalla de cada proyecto. Relación 1:N con `projects`.
 
| Campo     | Tipo         | Descripción                                  |
|-----------|--------------|----------------------------------------------|
| id        | INT PK AI    | Identificador único                          |
| projectId | INT FK       | Referencia a `projects.id`                   |
| imageUrl  | VARCHAR(255) | Ruta del archivo subido                      |
| caption   | VARCHAR(180) | Descripción breve de la imagen               |
| order     | INT          | Orden de visualización                       |
 
### Tabla `profile`
Perfil profesional del usuario.
 
| Campo     | Tipo         | Descripción                                  |
|-----------|--------------|----------------------------------------------|
| id        | INT PK AI    | Identificador único                          |
| userId    | INT FK       | Usuario propietario                          |
| bio       | TEXT         | Biografía profesional                        |
| github    | VARCHAR(255) | URL del perfil de GitHub                     |
| linkedin  | VARCHAR(255) | URL del perfil de LinkedIn                   |
| website   | VARCHAR(255) | Web personal                                 |
| skills    | TEXT         | Listado de skills (JSON o separados por coma)|
| updatedAt | DATETIME     | Fecha de última actualización                |
 
### Relaciones
 
```
profile (1) ─── (1) user
projects (N) ─── (1) user
projects (1) ─── (N) project_technologies
projects (1) ─── (N) screenshots
```