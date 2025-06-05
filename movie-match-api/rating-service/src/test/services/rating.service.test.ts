import { rateMovie } from "../../services/rating.service";
import { jest } from "@jest/globals";

// Mock PrismaClient
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      movie: {
        findUnique: jest.fn(({ where }) =>
          where.id === 99 ? null : { id: where.id }
        ),
      },
      rating: {
        findFirst: jest.fn(({ where }) => {
          if (where.userId === 999) return { id: 99 };
          return null;
        }),
        create: jest.fn(({ data }) => ({
          id: 1,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        update: jest.fn(({ data }) => ({
          id: 99,
          ...data,
          updatedAt: new Date(),
        })),
      },
    })),
  };
});

// Mock Redis
jest.mock("../../utils/redisClient", () => ({
  del: jest.fn(),
}));

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
});

describe("Rating Service", () => {
  test("Debe crear una calificación si no existe", async () => {
    const rating = await rateMovie(1, 1, 4);
    expect(rating).toHaveProperty("id");
  });

  test("Debe actualizar la calificación si ya existe", async () => {
    const updated = await rateMovie(999, 1, 5);
    expect(updated).toHaveProperty("id", 99);
    expect(updated.score).toBe(5);
  });

  test("Debe lanzar error si la película no existe", async () => {
    await expect(rateMovie(1, 99, 3)).rejects.toThrow("La película no existe.");
  });

  test("Debe lanzar error si la calificación es inválida", async () => {
    await expect(rateMovie(1, 1, 0)).rejects.toThrow("La calificación debe estar entre 1 y 5 estrellas.");
    await expect(rateMovie(1, 1, 6)).rejects.toThrow("La calificación debe estar entre 1 y 5 estrellas.");
  });

  test("Debe lanzar error si falta userId o movieId", async () => {
    await expect(rateMovie(0, 1, 3)).rejects.toThrow("El ID de usuario y el ID de película son requeridos.");
    await expect(rateMovie(1, 0, 3)).rejects.toThrow("El ID de usuario y el ID de película son requeridos.");
  });

  test("Debe lanzar error al fallar update de calificación", async () => {
    const { PrismaClient } = require("@prisma/client");
    const mockInstance = PrismaClient.mock.results[0].value;

    mockInstance.rating.findFirst.mockResolvedValueOnce({ id: 99 });
    mockInstance.rating.update.mockRejectedValueOnce(new Error("DB error"));

    await expect(rateMovie(1, 1, 4)).rejects.toThrow("Error al actualizar la calificación.");
  });

  test("Debe lanzar error al fallar create de calificación", async () => {
    const { PrismaClient } = require("@prisma/client");
    const mockInstance = PrismaClient.mock.results[0].value;

    mockInstance.rating.findFirst.mockResolvedValueOnce(null);
    mockInstance.rating.create.mockRejectedValueOnce(new Error("DB error"));

    await expect(rateMovie(1, 1, 4)).rejects.toThrow("Error al crear la calificación.");
  });
});
