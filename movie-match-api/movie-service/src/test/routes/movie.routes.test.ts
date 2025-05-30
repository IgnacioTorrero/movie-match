import request from "supertest";
import express from "express";
import movieRouter from "../../routes/movie.routes";
import { prisma } from "../../services/movie.service";

jest.mock("../../src/middlewares/auth.middleware", () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { id: 1 };
    next();
  },
}));

jest.mock("../../src/services/movie.service", () => ({
  createMovie: jest.fn(() => ({
    id: 1,
    title: "Test Movie",
    director: "Test Director",
    year: 2025,
    genre: "Test Genre",
    synopsis: "Test Synopsis",
  })),
  getMoviesByUser: jest.fn(() => [
    {
      id: 1,
      title: "Test Movie",
      director: "Test Director",
      year: 2025,
      genre: "Test Genre",
      synopsis: "Test Synopsis",
    },
  ]),
  countMoviesByUser: jest.fn(() => 1),
  updateMovie: jest.fn(() => ({
    id: 1,
    title: "Updated Movie",
    director: "Updated Director",
    year: 2026,
    genre: "Updated Genre",
    synopsis: "Updated Synopsis",
  })),
  deleteMovie: jest.fn(() => ({
    id: 1,
    title: "Deleted Movie",
  })),
  prisma: {
    userMovies: {
      findFirst: jest.fn(() => true),
      deleteMany: jest.fn(),
    },
    rating: {
      deleteMany: jest.fn(),
    },
    movie: {
      findFirst: jest.fn(() => ({
        id: 1,
        title: "Test Movie",
        director: "Test Director",
        year: 2025,
        genre: "Test Genre",
        synopsis: "Test Synopsis",
        rating: [{ score: 4 }],
      })),
    },
  },
}));

const app = express();
app.use(express.json());
app.use(movieRouter);

describe("Movie Routes", () => {
    test("POST /movies - debería crear una película", async () => {
        const res = await request(app).post("/movies").send({
        title: "Test Movie",
        director: "Test Director",
        year: 2025,
        genre: "Test Genre",
        synopsis: "Test Synopsis",
        });

        expect(res.status).toBe(201);
        expect(res.body.title).toBe("Test Movie");
    });

    test("GET /movies - debería listar películas", async () => {
        const res = await request(app).get("/movies");
        expect(res.status).toBe(200);
        expect(res.body.movies.length).toBeGreaterThan(0);
        expect(res.body.totalMovies).toBe(1);
    });

    test("PUT /movies/:id - debería actualizar una película", async () => {
        prisma.userMovies.findFirst = jest.fn(() => true);

        const res = await request(app).put("/movies/1").send({
        title: "Updated Movie",
        director: "Updated Director",
        year: 2026,
        genre: "Updated Genre",
        synopsis: "Updated Synopsis",
        });

        expect(res.status).toBe(200);
        expect(res.body.title).toBe("Updated Movie");
    });

    test("DELETE /movies/:id - debería eliminar una película", async () => {
        prisma.userMovies.findFirst = jest.fn(() => true);

        const res = await request(app).delete("/movies/1");
        expect(res.status).toBe(200);
        expect(res.body.title).toBe("Deleted Movie");
    });

    test("GET /movies/:id - debería devolver una película con rating", async () => {
        const res = await request(app).get("/movies/1");

        expect(res.status).toBe(200);
        expect(res.body.title).toBe("Test Movie");
        expect(res.body.userRating).toBe(4);
    });

    test("GET /movies/:id - debería devolver 404 si la película no existe", async () => {
        const originalFindFirst = prisma.movie.findFirst;
        prisma.movie.findFirst = jest.fn(() => null);

        const res = await request(app).get("/movies/999");

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("Movie not found");

        prisma.movie.findFirst = originalFindFirst;
    });

    test("POST /movies - debería manejar error al crear una película", async () => {
        const mockCreateMovie = require("../../src/services/movie.service").createMovie;
        mockCreateMovie.mockImplementationOnce(() => {
            throw new Error("Fallo al crear");
        });

        const res = await request(app).post("/movies").send({
            title: "Fallida",
            director: "Error",
            year: 2025,
            genre: "Drama",
            synopsis: "Error en creación",
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Fallo al crear");
    });

    test("GET /movies - debería manejar error al obtener películas", async () => {
        const mockGetMoviesByUser = require("../../src/services/movie.service").getMoviesByUser;
        mockGetMoviesByUser.mockImplementationOnce(() => {
            throw new Error("Fallo al listar");
        });

        const res = await request(app).get("/movies");

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Fallo al listar");
    });

    test("PUT /movies/:id - debería devolver 404 si la película no pertenece al usuario", async () => {
        prisma.userMovies.findFirst = jest.fn(() => null);

        const res = await request(app).put("/movies/99").send({
            title: "No existe",
            director: "Desconocido",
            year: 2024,
            genre: "Misterio",
            synopsis: "No autorizada",
        });

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("Movie not found or unauthorized");
    });

    test("DELETE /movies/:id - debería devolver 404 si la película no pertenece al usuario", async () => {
        prisma.userMovies.findFirst = jest.fn(() => null);

        const res = await request(app).delete("/movies/99");

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("Movie not found or unauthorized");
    });

    test("GET /movies/:id - debería manejar error inesperado", async () => {
        prisma.movie.findFirst = jest.fn(() => {
            throw new Error("Error inesperado");
        });

        const res = await request(app).get("/movies/1");

        expect(res.status).toBe(500);
        expect(res.body.error).toBe("Error inesperado");
    });

    test("PUT /movies/:id - debería manejar error inesperado", async () => {
        prisma.userMovies.findFirst = jest.fn(() => ({ id: 1 }));
        const mockUpdateMovie = require("../../src/services/movie.service").updateMovie;
        mockUpdateMovie.mockImplementationOnce(() => {
            throw new Error("Fallo en update");
        });

        const res = await request(app).put("/movies/1").send({
            title: "Falla",
            director: "Prueba",
            year: 2024,
            genre: "Terror",
            synopsis: "Error",
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Fallo en update");
    });

    test("DELETE /movies/:id - debería manejar error inesperado", async () => {
        prisma.userMovies.findFirst = jest.fn(() => ({ id: 1 }));
        prisma.rating.deleteMany = jest.fn();
        prisma.userMovies.deleteMany = jest.fn();

        const mockDeleteMovie = require("../../src/services/movie.service").deleteMovie;
        mockDeleteMovie.mockImplementationOnce(() => {
            throw new Error("Fallo al borrar");
        });

        const res = await request(app).delete("/movies/1");

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Fallo al borrar");
    });
});
