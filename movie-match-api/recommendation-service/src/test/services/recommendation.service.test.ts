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

import { getRecommendedMovies } from "../../services/recommendation.service";
import { jest } from "@jest/globals";

const { PrismaClient } = jest.requireMock("@prisma/client") as any;
const prismaInstance = new PrismaClient();
const { ratingFindManyMock, movieFindManyMock } = prismaInstance.__MOCS__;

jest.mock("../../utils/redisClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn<() => Promise<string | null>>().mockResolvedValue(null),
    set: jest.fn(),
  },
}));

const redis = require("../../utils/redisClient").default;

describe("Recommendation Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    redis.get.mockResolvedValue(null);
  });

  test("Devuelve recomendaciones desde caché si están disponibles", async () => {
    const userId = 4;
    const cachedMovies = [{ id: 401, title: "Película en caché", genre: "Action" }];
    redis.get.mockResolvedValueOnce(JSON.stringify(cachedMovies));

    const result = await getRecommendedMovies(userId);

    expect(redis.get).toHaveBeenCalledWith(`recommendations:${userId}`);
    expect(result).toEqual(cachedMovies);
  });

  test("Recomienda películas basadas en género favorito", async () => {
    const userId = 1;

    ratingFindManyMock.mockResolvedValue([
      { id: 1, userId, score: 5, movie: { id: 101, genre: "Action/Adventure" } },
      { id: 2, userId, score: 4, movie: { id: 102, genre: "Action/Sci-Fi" } },
      { id: 3, userId, score: 4, movie: { id: 103, genre: "Action" } },
    ]);

    movieFindManyMock.mockResolvedValue([
      {
        id: 201,
        title: "Mad Max: Fury Road",
        genre: "Action",
        createdAt: new Date(),
        director: "George Miller",
        year: 2015,
        synopsis: "Post-apocalyptic action",
        updatedAt: new Date(),
      },
    ]);

    const result = await getRecommendedMovies(userId);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Mad Max: Fury Road" }),
      ])
    );
    expect(redis.set).toHaveBeenCalled();
  });

  test("Devuelve mensaje si el usuario no tiene suficientes calificaciones", async () => {
    ratingFindManyMock.mockResolvedValue([]);

    const result = await getRecommendedMovies(2);

    expect(result).toEqual({ message: "No hay suficientes datos para recomendar películas." });
  });

  test("Devuelve mensaje si ninguna película tiene género válido", async () => {
    ratingFindManyMock.mockResolvedValue([{ movie: { id: 999, genre: "" } }]);

    const result = await getRecommendedMovies(5);

    expect(result).toEqual({ message: "No hay suficientes datos para recomendar películas." });
  });

  test("Devuelve mensaje si no se encuentran recomendaciones nuevas", async () => {
    ratingFindManyMock.mockResolvedValue([{ movie: { id: 104, genre: "Drama" } }]);
    movieFindManyMock.mockResolvedValue([]);

    const result = await getRecommendedMovies(3);

    expect(result).toEqual({ message: "No se encontraron recomendaciones nuevas." });
  });

  test("Devuelve mensaje si no se encuentran géneros para recomendar", async () => {
    ratingFindManyMock.mockResolvedValue([{ movie: { id: 888, genre: "" } }]);

    const result = await getRecommendedMovies(6);

    expect(result).toEqual({ message: "No hay suficientes datos para recomendar películas." });
  });

  test("Maneja error de Prisma y lanza error genérico", async () => {
    ratingFindManyMock.mockRejectedValue(new Error("Fallo Prisma"));
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(getRecommendedMovies(7)).rejects.toThrow("Error al acceder a la base de datos.");
    spy.mockRestore();
  });
});
