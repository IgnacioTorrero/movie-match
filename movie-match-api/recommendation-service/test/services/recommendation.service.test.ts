// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const ratingFindManyMock = jest.fn();
  const movieFindManyMock = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      rating: { findMany: ratingFindManyMock },
      movie: { findMany: movieFindManyMock },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $on: jest.fn(),
      $transaction: jest.fn(),
      $use: jest.fn(),
      $executeRaw: jest.fn(),
      $queryRaw: jest.fn(),
      __MOCS__: { ratingFindManyMock, movieFindManyMock },
    })),
  };
});

import { getRecommendedMovies } from "../../src/services/recommendation.service";
import { jest } from "@jest/globals";

const { PrismaClient } = jest.requireMock("@prisma/client") as any;
const prismaInstance = new PrismaClient();
const { ratingFindManyMock, movieFindManyMock } = prismaInstance.__MOCS__;

jest.mock("../../src/utils/redisClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn<() => Promise<string | null>>().mockResolvedValue(null),
    set: jest.fn(),
  },
}));

describe("Recommendation Service", () => {
  const redis = require("../../src/utils/redisClient").default;

  beforeEach(() => {
    jest.clearAllMocks();
    redis.get.mockResolvedValue(null); // Limpiar caché en cada test
  });

  test("Debe recomendar películas basadas en el género favorito del usuario", async () => {
    const userId = 1;

    ratingFindManyMock.mockResolvedValue([
      { id: 1, userId, score: 5, movie: { id: 101, genre: "Action/Adventure" } },
      { id: 2, userId, score: 4, movie: { id: 102, genre: "Action/Sci-Fi" } },
      { id: 3, userId, score: 4, movie: { id: 103, genre: "Action" } },
    ]);

    movieFindManyMock.mockResolvedValue([
      { id: 201, title: "Mad Max: Fury Road", genre: "Action", createdAt: new Date(), director: "George Miller", year: 2015, synopsis: "Post-apocalyptic action", updatedAt: new Date() },
      { id: 301, title: "The Dark Knight", genre: "Action", createdAt: new Date(), director: "Christopher Nolan", year: 2008, synopsis: "Batman fights the Joker", updatedAt: new Date() },
    ]);

    const recommendations = await getRecommendedMovies(userId);

    if (Array.isArray(recommendations)) {
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some((m: any) => m.title === "Mad Max: Fury Road")).toBeTruthy();
    } else {
      throw new Error("Expected array, but received message object.");
    }
  });

  test("Debe devolver un mensaje si el usuario no tiene suficientes calificaciones", async () => {
    const userId = 2;

    ratingFindManyMock.mockResolvedValue([]);

    const recommendations = await getRecommendedMovies(userId);

    expect(recommendations).toEqual({ message: "No hay suficientes datos para recomendar películas." });
  });

  test("Debe devolver un mensaje si no se encuentran recomendaciones", async () => {
    const userId = 3;

    ratingFindManyMock.mockResolvedValue([
      { movie: { id: 104, genre: "Drama" } },
    ]);

    movieFindManyMock.mockResolvedValue([]);

    const recommendations = await getRecommendedMovies(userId);

    expect(recommendations).toEqual({ message: "No se encontraron recomendaciones nuevas." }); // Alineado con tu implementación real
  });

  test("Debe devolver recomendaciones desde caché si están disponibles", async () => {
    const userId = 4;
    const cachedMovies = [{ id: 401, title: "Película en caché", genre: "Action" }];
    redis.get.mockResolvedValueOnce(JSON.stringify(cachedMovies));

    const result = await getRecommendedMovies(userId);

    expect(redis.get).toHaveBeenCalledWith(`recommendations:${userId}`);
    expect(result).toEqual(cachedMovies);
  });

  test("Debe devolver mensaje si las películas no tienen género válido", async () => {
    const userId = 5;
    ratingFindManyMock.mockResolvedValue([
      { movie: { id: 999, genre: "" } }
    ]);

    const recommendations = await getRecommendedMovies(userId);

    expect(recommendations).toEqual({ message: "No hay suficientes datos para recomendar películas." });
  });

  test("Debe manejar errores inesperados y lanzar error genérico", async () => {
    const userId = 6;
    ratingFindManyMock.mockRejectedValue(new Error("Fallo Prisma"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(getRecommendedMovies(userId)).rejects.toThrow("Error al acceder a la base de datos.");
    consoleErrorSpy.mockRestore();
  });
});
