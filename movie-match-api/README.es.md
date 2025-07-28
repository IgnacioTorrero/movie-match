# MovieMatch API

Este proyecto es una aplicación compuesta por microservicios en Node.js para la gestión de autenticación, películas, calificaciones y recomendaciones personalizadas, utilizando JWT para la autenticación, Swagger UI para la documentación, y Podman para el despliegue de los contenedores. La arquitectura está diseñada para ser escalable, desacoplada y profesional, ideal para entornos de producción modernos.

🌐 Este README también está disponible en [English](README.md)  
---

## 📖 Módulo teórico

### 1) Tecnologías utilizadas

- **Lenguaje principal:** TypeScript (Node.js)
- **Framework:** Express
- **Base de datos:** MySQL 8 (contenedorizado)
- **ORM:** Prisma ORM
- **Autenticación y Seguridad:** JWT (firma HS256)
- **Documentación:** Swagger UI (vía OpenAPI 3.0)
- **Cache:** Redis (para optimización de búsquedas y recomendaciones)
- **Contenedores:** Podman + podman-compose
- **Frontend:** React + Vite (integrado en `auth-service` y `movie-service`)
- **Build Tool:** Vite + TypeScript + npm
- **Testing:** Jest + Supertest
- **CI/CD:** GitHub Actions (workflow en `.github/workflows/ci.yml`)

### 2) Patrones de diseño utilizados

- **Controller-Service-Repository (C-S-R):** organización modular en capas que separa las rutas, lógica de negocio y acceso a datos (usando Prisma como DAO).
- **DTO (Data Transfer Object):** separación lógica entre los datos de entrada/salida y el modelo interno, aunque no están estructurados como archivos DTO.
- **Middleware:** manejo de autenticación, validación y errores reutilizable en cada capa del flujo HTTP.
- **Factory (implícito):** se crean objetos de respuesta derivados de entidades Prisma en funciones reutilizables.
- **Singleton:** tanto Prisma Client como Redis Client son instancias únicas reutilizadas en cada servicio.
- **Builder (parcial):** la generación de tokens JWT se realiza con una API fluida que permite construir el token dinámicamente.

### 3) Arquitectura utilizada

- Arquitectura **basada en microservicios** comunicados vía HTTP, con posibilidad futura de escalar con eventos (Kafka, RabbitMQ).
- **Capas bien definidas en cada servicio:**
   - `routes`: define los endpoints públicos.
   - `services`: contiene la lógica de negocio.
   - `middlewares`: validaciones, autenticación y control de errores.
   - `prisma`: modelo y acceso a datos.
   - `swagger`: documentación OpenAPI 3.0 por servicio.
   - `test`: pruebas unitarias y de integración.
   - `front-end`: cliente React/Vite (cuando aplica).

### 4) Resumen de endpoints

#### 🛡️ Autenticación (`/api/auth`)
- `POST /register`: Registrar un nuevo usuario.
- `POST /login`: Iniciar sesión. Devuelve un token JWT.

#### 👤 Usuarios (`/api/users`)
- 🔒 Este prefijo está reservado para futuras extensiones relacionadas a perfil de usuario. Actualmente, no expone rutas activas.

#### 🎬 Películas (`/api/movies`)
- `POST /`: Crear una nueva película (requiere JWT).
- `GET /`: Listar películas del usuario autenticado con filtros y paginación.
- `GET /:id`: Obtener detalles de una película específica (si pertenece al usuario).
- `PUT /:id`: Actualizar una película (requiere validación de pertenencia).
- `DELETE /:id`: Eliminar una película (si pertenece al usuario).

#### ⭐ Calificaciones (`/api/ratings`)
- `POST /rate`: Calificar o actualizar la calificación de una película (requiere JWT).

#### 🤖 Recomendaciones (`/api/recommendations`)
- `GET /`: Obtener recomendaciones personalizadas de películas para el usuario autenticado.
- `DELETE /cache`: Limpiar manualmente la caché de recomendaciones del usuario actual.

💡 Todos los endpoints salvo `/auth/register` y `/auth/login` requieren autenticación mediante un token JWT.

---

## 📝 Módulo práctico

### 5) ¿Cómo montar la aplicación desde cero?

**Tecnologías necesarias a instalar en el entorno:**

- [Node.js 18+](https://nodejs.org/) (recomendado: versión LTS para compatibilidad con dependencias)
- [npm 9+](https://www.npmjs.com/) (incluido con Node.js, para gestionar paquetes y scripts)
- [Podman](https://podman.io/) (alternativa moderna a Docker para contenerización)
- [podman-compose](https://github.com/containers/podman-compose) (para orquestar múltiples servicios de forma declarativa)
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) (opcional, para inspeccionar y modificar la base de datos gráficamente)
- [Visual Studio Code](https://code.visualstudio.com/) o equivalente como entorno de desarrollo.
- [Prisma CLI](https://www.prisma.io/docs/reference/api-reference/command-reference) *(opcional)* si deseas correr migraciones manuales.
- Conexión a internet para instalar las dependencias con `npm install` y construir el frontend con Vite.

---

**Pasos para montar y ejecutar el proyecto:**

1. Clonar el repositorio y abrir la carpeta `movie-match-api` en tu IDE.
2. Instalar dependencias de cada microservicio y frontend ejecutando `npm install` dentro de sus respectivas carpetas.
3. Asegurarte de tener las variables de entorno correctamente definidas en los archivos `.env` y `.env.prod`.
4. Compilar los frontends si estás en entorno de producción:
   ```bash
   ./build-front.ps1
   ```
5. Ejecutar los siguientes comandos desde la terminal en el directorio raíz del proyecto:

```bash
podman machine init #Para iniciar el podman
podman machine start #Para activar el podman
podman-compose up #Para levantar el proyecto
podman-compose down #Para frenar el proyecto
podman-compose build #Para buildear el proyecto después de un cambio
```
El orden para levantar de cero sería:
1) podman machine init
2) podman machine start
2) podman-compose build
3) podman-compose up

### 6) ¿Cómo visualizar y testear Swagger UI?

Cuando este corriendo el proyecto, utilizar los siguientes endpoints:
- auth: http://localhost:3001/api-docs/
- movie: http://localhost:3002/api-docs/
- rating: http://localhost:3003/api-docs/ 
- recommendation: http://localhost:3004/api-docs/

### 7) ¿Cómo testear cada endpoint en Postman?

**Paso a paso:**

1. Enviar una solicitud `POST` a `/api/auth/login` con el correo y contraseña registrados:

```json
{
   "email": "usuario@mail.com",
   "password": "1234"
}
```
2. Copiar el valor devuelto en la propiedad token.

3. En Postman, ir a la pestaña Authorization, seleccionar Bearer Token y pegar el token copiado:
```json
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```
4. A partir de ahí, podrás probar cualquier endpoint protegido usando ese token en la cabecera de autorización.

Listado de endpoints con ejemplos para testear:

🛡️ Autenticación
```json
POST /api/auth/register
Body:
{
  "name": "Juan",
  "email": "juan@mail.com",
  "password": "1234"
}
```
```json
POST /api/auth/login
Body:
{
  "email": "juan@mail.com",
  "password": "1234"
}
```
🎬 Películas
```json
GET /api/movies
```
```json
POST /api/movies
Body:
{
  "title": "Matrix",
  "director": "Wachowski",
  "year": 1999,
  "genre": "Sci-Fi",
  "synopsis": "Neo descubre la verdad..."
}
```
```json
GET /api/movies/1
```
```json
PUT /api/movies/1
Body:
{
  "title": "Matrix Reloaded",
  "director": "Wachowski",
  "year": 2003,
  "genre": "Sci-Fi",
  "synopsis": "Segunda entrega de Matrix..."
}
```
```json
DELETE /api/movies/1
```
⭐ Calificaciones
```json
POST /api/ratings/rate
Body:
{
  "movieId": 1,
  "score": 4
}
```
🤖 Recomendaciones
```json
GET /api/recommendations
```
```json
DELETE /api/recommendations/cache
```
💡 Todos los endpoints, salvo /auth/register y /auth/login, requieren el token JWT en la cabecera Authorization.

### 8) 🧪 Tests

Este proyecto incluye pruebas unitarias y de integración utilizando **Jest** y **Supertest**, organizadas por microservicio. Cada test sigue buenas prácticas: separación de responsabilidades, mocks de dependencias, y validación de lógica de negocio.

#### 🔍 Alcance de las pruebas

- Se testean las rutas:
  - `auth.routes.ts`
  - `user.routes.ts`
  - `movie.routes.ts`
  - `rating.routes.ts`
  - `recommendation.routes.ts`

- Se testean los servicios:
  - `auth.service.ts`
  - `movie.service.ts`
  - `rating.service.ts`
  - `recommendation.service.ts`

- Se mockean dependencias como Prisma, Redis y JWT para aislar la lógica.
- Se testean validaciones, respuestas esperadas, control de errores, flujos JWT y manejo de usuarios no autorizados.
- Se miden métricas de cobertura por archivo con `--coverage`.

---

#### ▶️ Comandos para ejecutar los tests (desde cada microservicio)

```bash
# Auth Service
npx jest src/test/routes/auth.routes.test.ts --coverage
npx jest src/test/routes/user.route.test.ts --coverage
npx jest src/test/services/auth.service.test.ts --coverage

# Movie Service
npx jest src/test/routes/movie.routes.test.ts --coverage
npx jest src/test/services/movie.service.test.ts --coverage

# Rating Service
npx jest src/test/routes/rating.routes.test.ts --coverage
npx jest src/test/services/rating.service.test.ts --coverage

# Recommendation Service
npx jest src/test/routes/recommendation.routes.test.ts --coverage
npx jest src/test/services/recommendation.service.test.ts --coverage
```
💡 Es recomendable correr los tests dentro de cada carpeta de microservicio (auth-service, movie-service, etc) para evitar errores de path o dependencias.

### 9) 🔄 CI/CD

Este proyecto integra **GitHub Actions** como herramienta de Integración Continua (CI), con el objetivo de garantizar la calidad del código, detectar errores automáticamente y mantener los servicios funcionando correctamente en cada cambio enviado al repositorio.

---

### ✅ Descripción del flujo CI

- **Disparador:** Ante cada `push` o `pull request` dirigido a la rama `main`.
- **Pasos principales del workflow:**
  - Instalar Node.js (versión 18 o superior).
  - Ejecutar `npm ci` para instalar dependencias de forma limpia.
  - Ejecutar los tests con **Jest** para cada microservicio.
  - Generar reportes de cobertura de código (`--coverage`).
  - Verificar que el pipeline se complete exitosamente antes de permitir merges.

> 📁 La definición completa del workflow se encuentra en `.github/workflows/ci.yml`.

---
## Extras y detalles técnicos

- El token JWT tiene una duración de **10 horas**.
- Todos los errores están manejados mediante middlewares de error personalizados en cada microservicio.
- Swagger UI está configurado para mantener la autorización con JWT activa durante la sesión de testing.
- Se permite CORS desde cualquier origen (`*`) para facilitar pruebas desde frontend local o Postman.
- Redis cachea búsquedas filtradas y recomendaciones, optimizando el rendimiento.



Si algo no funciona, lo primero que deberías revisar es:
- ⚡ Que el contenedor de MySQL esté corriendo correctamente y accesible desde los servicios.
- 🔐 Que el token JWT esté presente y no haya expirado.
- ✉ Que los datos requeridos (como `email`, `password`, `title`, `score`, etc.) estén correctamente formateados en las requests.
- 🧱 Que los servicios frontales hayan sido correctamente construidos (`npm run build`) si estás usando el entorno productivo.

Cualquier duda extra, el código está completamente modularizado, documentado y sigue convenciones profesionales en cada microservicio.

---

## 🧑‍💻 Contribución y Licencia

Este proyecto fue desarrollado como un **challenge técnico** y representa un ejemplo profesional de arquitectura basada en microservicios con Node.js, Express, Prisma, React y contenedores.

Si deseás sugerir mejoras, abrir un issue o enviar un pull request, ¡bienvenido!

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Podés utilizarlo, modificarlo y compartirlo libremente para fines personales o profesionales.

---