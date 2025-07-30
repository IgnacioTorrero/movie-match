# Movie Match API

This project is a microservices-based application built with Node.js for managing authentication, movies, ratings, and personalized recommendations. It uses JWT for authentication, Swagger UI for API documentation, and Podman for container deployment. The architecture is designed to be scalable, decoupled, and production-ready, ideal for modern environments.

🌐 This README is also available in [Spanish](README.es.md)  
---

## 📖 Theoretical Module

### 1) Technologies Used

- **Main language:** TypeScript (Node.js)
- **Framework:** Express
- **Database:** MySQL 8 (containerized)
- **ORM:** Prisma ORM
- **Authentication & Security:** JWT (HS256 signature)
- **Documentation:** Swagger UI (via OpenAPI 3.0)
- **Cache:** Redis (for search and recommendation optimization)
- **Containers:** Podman + podman-compose
- **Frontend:** React + Vite (integrated in `auth-service` and `movie-service`)
- **Build Tool:** Vite + TypeScript + npm
- **Testing:** Jest + Supertest
- **CI/CD:** GitHub Actions (workflow in `.github/workflows/ci.yml`)

### 2) Design Patterns Used

- **Controller-Service-Repository (C-S-R):** modular layered organization that separates routes, business logic, and data access (using Prisma as DAO).
- **DTO (Data Transfer Object):** logical separation between input/output data and internal models, though not structured as standalone DTO files.
- **Middleware:** reusable handling of authentication, validation, and error control in each HTTP flow layer.
- **Factory (implicit):** response objects are derived from Prisma entities via reusable functions.
- **Singleton:** both Prisma Client and Redis Client are singleton instances reused across services.
- **Builder (partial):** JWT token generation is handled through a fluent API that allows dynamic token construction.

### 3) Architecture Overview

- **Microservices-based architecture** using HTTP communication, with future scalability via event-driven architecture (Kafka, RabbitMQ).
- **Well-defined layers in each service:**
   - `routes`: defines public endpoints.
   - `services`: contains business logic.
   - `middlewares`: handles validation, authentication, and error control.
   - `prisma`: data model and access layer.
   - `swagger`: OpenAPI 3.0 documentation per service.
   - `test`: unit and integration tests.
   - `front-end`: React/Vite client (when applicable).

### 4) Endpoint Summary

#### 🛡️ Authentication (`/api/auth`)
- `POST /register`: Register a new user.
- `POST /login`: Log in. Returns a JWT token.

#### 👤 Users (`/api/users`)
- 🔒 This prefix is reserved for future user profile extensions. Currently, it does not expose active routes.

#### 🎬 Movies (`/api/movies`)
- `POST /`: Create a new movie (requires JWT).
- `GET /`: List movies of the authenticated user with filters and pagination.
- `GET /:id`: Get details of a specific movie (if it belongs to the user).
- `PUT /:id`: Update a movie (requires membership validation).
- `DELETE /:id`: Delete a movie (if it belongs to the user).

#### ⭐ Ratings (`/api/ratings`)
- `POST /rate`: Rate or update a movie's rating (requires JWT).

#### 🤖 Recomendaciones (`/api/recommendations`)
- `GET /`: Get personalized movie recommendations for the authenticated user.
- `DELETE /cache`: Manually clear the current user's recommendation cache.

💡 All endpoints except `/auth/register` and `/auth/login` require authentication using a JWT token.

---

## 🧩 Architecture diagram

![Architecture diagram](movie-match-api/docs/architecture.png)

---

## 📝 Practical Module

### 5) How to Set Up the Application from Scratch?

**Required Technologies to Install in Your Environment:**

- [Node.js 18+](https://nodejs.org/) (recommended: LTS version for dependency compatibility)
- [npm 9+](https://www.npmjs.com/) (included with Node.js, used for managing packages and scripts)
- [Podman](https://podman.io/) (modern alternative to Docker for containerization)
- [podman-compose](https://github.com/containers/podman-compose) (to orchestrate multiple services declaratively)
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) (optional, for inspecting and modifying the database graphically)
- [Visual Studio Code](https://code.visualstudio.com/) or a similar IDE.
- [Prisma CLI](https://www.prisma.io/docs/reference/api-reference/command-reference) *(optional)* if you want to run migrations manually.
- Internet connection to install dependencies via `npm install` and build the frontend with Vite.

---

**Steps to Set Up and Run the Project:**

1. Clone the repository and open the `movie-match-api` folder in your IDE.
2. Install the dependencies for each microservice and frontend by running `npm install` inside their respective directories.
3. Make sure environment variables are correctly defined in the `.env` and `.env.prod` files.
4. Compile the frontend if you're in a production environment:
   ```bash
   ./build-front.ps1
5. Run the following commands from the terminal at the root directory of the project:
```bash
podman machine init #To start the podman
podman machine start #To activate the podman
podman-compose up #To lift the project
podman-compose down #To stop the project
podman-compose build #To build the project after a change
```
The order to start from scratch would be:
1) podman machine init
2) podman machine start
2) podman-compose build
3) podman-compose up

### 6) How to visualize and test Swagger UI?

When running the project, use the following endpoints:
- auth: http://localhost:3001/api-docs/
- movie: http://localhost:3002/api-docs/
- rating: http://localhost:3003/api-docs/ 
- recommendation: http://localhost:3004/api-docs/

### 7) How to test each endpoint in Postman?

**Step to step:**

1. Submit a request `POST` to `/api/auth/login` with the registered email and password:

```json
{
   "email": "usuario@mail.com",
   "password": "1234"
}
```
2. Copy the returned value into the token property.

3. In Postman, go to the Authorization tab, select Bearer Token, and paste the copied token:
```json
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```
4. From there, you can test any protected endpoint using that token in the authorization header.

List of endpoints with examples for testing:

🛡️ Authentication
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
🎬 Movies
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
⭐ Rating
```json
POST /api/ratings/rate
Body:
{
  "movieId": 1,
  "score": 4
}
```
🤖 Recommendations
```json
GET /api/recommendations
```
```json
DELETE /api/recommendations/cache
```
💡 All endpoints except /auth/register and /auth/login require the JWT token in the Authorization header.

**Access from the front-end**:
```json
http://localhost:3005/auth/
```
### 8) 🧪 Tests

This project includes unit and integration tests using **Jest** and **Supertest**, organized per microservice. Each test follows best practices: separation of concerns, dependency mocking, and validation of business logic.

#### 🔍 Test Coverage

- Route handlers are tested:
  - `auth.routes.ts`
  - `user.routes.ts`
  - `movie.routes.ts`
  - `rating.routes.ts`
  - `recommendation.routes.ts`

- Services are tested:
  - `auth.service.ts`
  - `movie.service.ts`
  - `rating.service.ts`
  - `recommendation.service.ts`

- Dependencies like Prisma, Redis, and JWT are mocked to isolate logic.
- Validations, expected responses, error handling, JWT flows, and unauthorized user scenarios are tested.
- Coverage metrics are collected per file using the `--coverage` flag.
---
#### ▶️ Commands to run the tests (from each microservice)

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
💡 It is recommended to run tests within each microservice folder (auth-service, movie-service, etc.) to avoid path or dependency errors.
---
### 9) 🔄 CI/CD

This project integrates **GitHub Actions** as a Continuous Integration (CI) tool, aimed at ensuring code quality, automatically detecting errors, and keeping services running smoothly with every change pushed to the repository.

---

### ✅ CI Workflow Description

- **Trigger:** On every `push` or `pull request` targeting the `main` branch.
- **Main workflow steps:**
  - Install Node.js (version 18 or higher).
  - Run `npm ci` to install dependencies cleanly.
  - Run tests with **Jest** for each microservice.
  - Generate code coverage reports (`--coverage`).
  - Ensure the pipeline completes successfully before allowing merges.

> 📁 The full workflow definition is located at `.github/workflows/ci.yml`.

---

## Extras and Technical Details

- JWT tokens have a duration of **10 hours**.
- All errors are handled through custom error middlewares in each microservice.
- Swagger UI is configured to persist JWT authorization during the testing session.
- CORS is allowed from any origin (`*`) to ease testing from local frontend or Postman.
- Redis caches filtered searches and recommendations, optimizing performance.

If something isn't working, you should first check:

- ⚡ That the MySQL container is running correctly and accessible from the services.
- 🔐 That the JWT token is present and hasn't expired.
- ✉ That all required fields (such as `email`, `password`, `title`, `score`, etc.) are properly formatted in the requests.
- 🧱 That the frontend services have been properly built (`npm run build`) if you're using the production environment.

For any additional doubts, the codebase is fully modularized, documented, and follows professional conventions in each microservice.

---

## 🧑‍💻 Contribution and License

This project was developed as a **technical challenge** and serves as a professional example of a microservices-based architecture using Node.js, Express, Prisma, React, and containerization.

If you'd like to suggest improvements, open an issue, or submit a pull request — you're more than welcome!

---

## 📄 License

This project is distributed under the **MIT License**. You are free to use, modify, and share it for personal or professional purposes.

---

## 🔐 Environment Variables and Configuration

The variables required for MySQL and JWT configuration are defined in the `.env` file:

```properties
DATABASE_URL="mysql://root:root@mysql:3306/movie-match"
JWT_SECRET="a3rU8/*po0--1$"
REDIS_URL="redis://redis:6379"
```
---
## ☁️ Production Deployment (EC2)

> ⚠️ **Important Note:**  
> This documentation is primarily focused on **local** usage of the application to facilitate testing, code analysis, and running automated tests.

However, the project has been **successfully deployed to a real production environment** using:

- **AWS EC2 instance** (Amazon Web Services)
- **Podman containers** via `podman-compose-prod.yml` and `.env.prod` (running in the cloud)
- **Optimized builds** for both frontend and backend
- **Sensitive configuration via `.env.production`**
- **Controlled port exposure** for frontend, microservices, and API Gateway
- **Functional Swagger UI** for each microservice accessible via public IP

This deployment aims to **demonstrate the technical capability to run a complete and professional cloud-based architecture**, including:

- Orchestration of multiple microservices on a remote server
- Persistent volume management for databases (MySQL)
- Serving static assets (React) from the API Gateway
- Secure endpoint exposure with JWT in production
- Swagger integration for remote API testing

> 🎯 If you are evaluating this project, feel free to request access to a deployed test instance, or review the remote deployment script and production file structure.
