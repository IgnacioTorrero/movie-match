// Mock Prisma Client
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      movie: {
        findUnique: jest.fn(),
      },
      rating: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    })),
  };
});

// Mock Redis
jest.mock("../../src/utils/redisClient", () => ({
  del: jest.fn(),
}));

import { rateMovie, prisma } from "../../src/services/rating.service";
import redis from "../../src/utils/redisClient";
import { jest } from "@jest/globals";

describe("Rating Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Debe permitir calificar una película correctamente", async () => {
    const userId = 1;
    const movieId = 1;
    const score = 4;

    (prisma.movie.findUnique as jest.MockedFunction<typeof prisma.movie.findUnique>)
      .mockResolvedValue({ id: movieId });

    (prisma.rating.findFirst as jest.MockedFunction<typeof prisma.rating.findFirst>)
      .mockResolvedValue(null);

    (prisma.rating.create as jest.MockedFunction<typeof prisma.rating.create>)
      .mockResolvedValue({
        id: 1,
        userId,
        movieId,
        score,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const rating = await rateMovie(userId, movieId, score);

    expect(redis.del).toHaveBeenCalledWith(`recommendations:${userId}`);
    expect(rating).toHaveProperty("id");
  });

  test("Debe actualizar la calificación si ya existe", async () => {
    const userId = 1;
    const movieId = 1;
    const newScore = 5;

    (prisma.movie.findUnique as jest.MockedFunction<typeof prisma.movie.findUnique>)
      .mockResolvedValue({ id: movieId });

    (prisma.rating.findFirst as jest.MockedFunction<typeof prisma.rating.findFirst>)
      .mockResolvedValue({ id: 10 });

    (prisma.rating.update as jest.MockedFunction<typeof prisma.rating.update>)
      .mockResolvedValue({
        id: 10,
        userId,
        movieId,
        score: newScore,
      });

    const updatedRating = await rateMovie(userId, movieId, newScore);

    expect(redis.del).toHaveBeenCalledWith(`recommendations:${userId}`);
    expect(updatedRating.id).toBe(10);
    expect(updatedRating.score).toBe(newScore);
  });

  test("Debe fallar si la película no existe", async () => {
    (prisma.movie.findUnique as jest.MockedFunction<typeof prisma.movie.findUnique>)
      .mockResolvedValue(null);

    await expect(rateMovie(1, 99, 3)).rejects.toThrow("La película no existe.");
  });

  test("Debe fallar si la calificación es menor a 1 o mayor a 5", async () => {
    await expect(rateMovie(1, 1, 0)).rejects.toThrow("La calificación debe estar entre 1 y 5 estrellas.");
    await expect(rateMovie(1, 1, 6)).rejects.toThrow("La calificación debe estar entre 1 y 5 estrellas.");
  });

  test("Debe fallar si falta el userId o movieId", async () => {
    await expect(rateMovie(0, 1, 3)).rejects.toThrow("El ID de usuario y el ID de película son requeridos.");
    await expect(rateMovie(1, 0, 3)).rejects.toThrow("El ID de usuario y el ID de película son requeridos.");
  });

  test("Debe lanzar error al fallar update de calificación", async () => {
    const userId = 1;
    const movieId = 1;
    const score = 4;

    (prisma.movie.findUnique as jest.MockedFunction<typeof prisma.movie.findUnique>)
      .mockResolvedValue({ id: movieId });

    (prisma.rating.findFirst as jest.MockedFunction<typeof prisma.rating.findFirst>)
      .mockResolvedValue({ id: 1 });

    (prisma.rating.update as jest.MockedFunction<typeof prisma.rating.update>)
      .mockRejectedValue(new Error("DB error"));

    await expect(rateMovie(userId, movieId, score)).rejects.toThrow("Error al actualizar la calificación.");
  });

  test("Debe lanzar error al fallar create de calificación", async () => {
    const userId = 1;
    const movieId = 1;
    const score = 4;

    (prisma.movie.findUnique as jest.MockedFunction<typeof prisma.movie.findUnique>)
      .mockResolvedValue({ id: movieId });

    (prisma.rating.findFirst as jest.MockedFunction<typeof prisma.rating.findFirst>)
      .mockResolvedValue(null);

    (prisma.rating.create as jest.MockedFunction<typeof prisma.rating.create>)
      .mockRejectedValue(new Error("DB error"));

    await expect(rateMovie(userId, movieId, score)).rejects.toThrow("Error al crear la calificación.");
  });
});
