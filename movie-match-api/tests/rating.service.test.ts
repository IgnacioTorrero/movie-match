import { rateMovie, prisma } from "../src/services/rating.service";
import { jest } from "@jest/globals";

describe("Rating Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Debe permitir calificar una película correctamente", async () => {
    const userId = 1;
    const movieId = 1;
    const score = 4;

    jest.spyOn(prisma.movie, "findUnique").mockResolvedValue({ id: movieId } as any);
    jest.spyOn(prisma.rating, "findFirst").mockResolvedValue(null);

    // 🔹 Mockeamos `prisma.rating.create` sin `$transaction`
    jest.spyOn(prisma.rating, "create").mockResolvedValue({
      id: 1,
      userId,
      movieId,
      score,
    } as any);

    const rating = await rateMovie(userId, movieId, score);

    expect(rating).toHaveProperty("id");
    expect(rating.userId).toBe(userId);
    expect(rating.movieId).toBe(movieId);
    expect(rating.score).toBe(score);
  });

  test("Debe actualizar la calificación si ya existe", async () => {
    const userId = 1;
    const movieId = 1;
    const newScore = 5;

    jest.spyOn(prisma.movie, "findUnique").mockResolvedValue({ id: movieId } as any);
    jest.spyOn(prisma.rating, "findFirst").mockResolvedValue({ id: 10, userId, movieId, score: 3 } as any);
    jest.spyOn(prisma.rating, "update").mockResolvedValue({
      id: 10,
      userId,
      movieId,
      score: newScore,
    } as any);

    const updatedRating = await rateMovie(userId, movieId, newScore);

    expect(updatedRating.id).toBe(10);
    expect(updatedRating.score).toBe(newScore);
  });

  test("Debe fallar si la película no existe", async () => {
    jest.spyOn(prisma.movie, "findUnique").mockResolvedValue(null);
    await expect(rateMovie(1, 99, 3)).rejects.toThrow("La película no existe.");
  });

  test("Debe fallar si la calificación es menor a 1 o mayor a 5", async () => {
    await expect(rateMovie(1, 1, 0)).rejects.toThrow("La calificación debe estar entre 1 y 5 estrellas.");
    await expect(rateMovie(1, 1, 6)).rejects.toThrow("La calificación debe estar entre 1 y 5 estrellas.");
  });
});
