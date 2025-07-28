import request from "supertest";
import express from "express";
import { prisma } from "../../prisma";

let app: express.Express;
let mockCreateMovie: jest.Mock;
let mockGetMoviesByUser: jest.Mock;
let mockCountMoviesByUser: jest.Mock;
let mockUpdateMovie: jest.Mock;
let mockDeleteMovie: jest.Mock;
let mockGetMovieById: jest.Mock;
let mockMovieBelongsToUser: jest.Mock;

beforeAll(() => {
  mockCreateMovie = jest.fn();
  mockGetMoviesByUser = jest.fn();
  mockCountMoviesByUser = jest.fn();
  mockUpdateMovie = jest.fn();
  mockDeleteMovie = jest.fn();
  mockGetMovieById = jest.fn();
  mockMovieBelongsToUser = jest.fn();

  // Mock JWT authentication
  jest.doMock("../../middlewares/auth.middleware", () => ({
    authenticateToken: (req: any, res: any, next: any) => {
      req.user = { id: 1 };
      next();
    },
  }));

  // Mock movie service methods
  jest.doMock("../../services/movie.service", () => ({
    createMovie: mockCreateMovie,
    getMoviesByUser: mockGetMoviesByUser,
    countMoviesByUser: mockCountMoviesByUser,
    updateMovie: mockUpdateMovie,
    deleteMovie: mockDeleteMovie,
    getMovieById: mockGetMovieById,
    movieBelongsToUser: mockMovieBelongsToUser,
  }));

  const movieRouter = require("../../routes/movie.routes").default;
  const express = require("express");
  app = express();
  app.use(express.json());
  app.use(movieRouter);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Movie Routes", () => {
  test("POST /movies - should create a movie", async () => {
    mockCreateMovie.mockResolvedValueOnce({
      id: 1,
      title: "Test Movie",
      director: "Test Director",
      year: 2025,
      genre: "Test Genre",
      synopsis: "Test Synopsis",
    });

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

  test("GET /movies - should list movies", async () => {
    mockGetMoviesByUser.mockResolvedValueOnce([
      {
        id: 1,
        title: "Test Movie",
        director: "Test Director",
        year: 2025,
        genre: "Test Genre",
        synopsis: "Test Synopsis",
      },
    ]);
    mockCountMoviesByUser.mockResolvedValueOnce(1);

    const res = await request(app).get("/movies");

    expect(res.status).toBe(200);
    expect(res.body.movies.length).toBeGreaterThan(0);
    expect(res.body.totalMovies).toBe(1);
  });

  test("PUT /movies/:id - should update a movie", async () => {
    mockMovieBelongsToUser.mockResolvedValueOnce(true);
    mockUpdateMovie.mockResolvedValueOnce({
      id: 1,
      title: "Updated Movie",
      director: "Updated Director",
      year: 2026,
      genre: "Updated Genre",
      synopsis: "Updated Synopsis",
    });

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

  test("DELETE /movies/:id - should delete a movie", async () => {
    mockMovieBelongsToUser.mockResolvedValueOnce(true);
    mockDeleteMovie.mockResolvedValueOnce({ id: 1, title: "Deleted Movie" });

    const res = await request(app).delete("/movies/1");

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Deleted Movie");
  });

  test("GET /movies/:id - should return a movie with rating", async () => {
    mockGetMovieById.mockResolvedValueOnce({
      id: 1,
      title: "Test Movie",
      director: "Test Director",
      year: 2025,
      genre: "Test Genre",
      synopsis: "Test Synopsis",
      userRating: 4,
    });

    const res = await request(app).get("/movies/1");

    expect(res.status).toBe(200);
    expect(res.body.userRating).toBe(4);
  });

  test("GET /movies/:id - should return 404 if not found", async () => {
    mockGetMovieById.mockImplementationOnce(() => {
      throw new Error("Película no encontrada");
    });

    const res = await request(app).get("/movies/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Movie not found");
  });

  test("POST /movies - should handle error on creation", async () => {
    mockCreateMovie.mockImplementationOnce(() => {
      throw new Error("Fallo al crear");
    });

    const res = await request(app).post("/movies").send({
      title: "Fallida",
      director: "Error",
      year: 2025,
      genre: "Drama",
      synopsis: "Error",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Fallo al crear");
  });

  test("GET /movies - should handle error on listing", async () => {
    mockGetMoviesByUser.mockImplementationOnce(() => {
      throw new Error("Fallo al listar");
    });

    const res = await request(app).get("/movies");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Fallo al listar");
  });

  test("PUT /movies/:id - 404 if movie does not belong to user", async () => {
    mockMovieBelongsToUser.mockResolvedValueOnce(false);

    const res = await request(app).put("/movies/99").send({
      title: "X",
      director: "X",
      year: 2024,
      genre: "X",
      synopsis: "X",
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Movie not found or unauthorized");
  });

  test("DELETE /movies/:id - 404 if movie does not belong to user", async () => {
    mockMovieBelongsToUser.mockResolvedValueOnce(false);

    const res = await request(app).delete("/movies/99");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Movie not found or unauthorized");
  });

  test("GET /movies/:id - unexpected error", async () => {
    mockGetMovieById.mockRejectedValueOnce(new Error("Error inesperado"));

    const res = await request(app).get("/movies/1");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Error inesperado");
  });

  test("PUT /movies/:id - unexpected update error", async () => {
    mockMovieBelongsToUser.mockResolvedValueOnce(true);
    mockUpdateMovie.mockImplementationOnce(() => {
      throw new Error("Fallo en update");
    });

    const res = await request(app).put("/movies/1").send({
      title: "Falla",
      director: "X",
      year: 2024,
      genre: "X",
      synopsis: "Error",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Fallo en update");
  });

  test("DELETE /movies/:id - unexpected delete error", async () => {
    mockMovieBelongsToUser.mockResolvedValueOnce(true);
    mockDeleteMovie.mockImplementationOnce(() => {
      throw new Error("Fallo al borrar");
    });

    const res = await request(app).delete("/movies/1");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Fallo al borrar");
  });
});