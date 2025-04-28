// 🔥 Mockeamos PrismaClient completo ANTES de cualquier import
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
      __MOCS__: { ratingFindManyMock, movieFindManyMock }, // <--- exportamos los mocks reales
    })),
  };
});

// 🔥 Luego importamos lo demás
import { getRecommendedMovies } from "../src/services/recommendation.service";
import { jest } from "@jest/globals";

// Obtenemos el PrismaClient mockeado y accedemos a los mocks reales
const { PrismaClient } = jest.requireMock("@prisma/client") as any;
const prismaInstance = new PrismaClient();
const { ratingFindManyMock, movieFindManyMock } = prismaInstance.__MOCS__;

describe("Recommendation Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    expect(recommendations).toEqual([{ message: "No se encontraron recomendaciones." }]);
  });
});
