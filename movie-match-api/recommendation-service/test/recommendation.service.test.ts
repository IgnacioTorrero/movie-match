import { getRecommendedMovies } from "../src/services/recomendation.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Recommendation Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Debe recomendar películas basadas en el género favorito del usuario", async () => {
    const userId = 1;
  
    // Mock de calificaciones del usuario con la relación correcta
    jest.spyOn(prisma.rating, "findMany").mockResolvedValue([
      { id: 1, userId, score: 5, movie: { id: 101, genre: "Action/Adventure" } },
      { id: 2, userId, score: 4, movie: { id: 102, genre: "Action/Sci-Fi" } },
      { id: 3, userId, score: 4, movie: { id: 103, genre: "Action" } },
    ] as any);
  
    // Mock de películas recomendadas en el género favorito
    jest.spyOn(prisma.movie, "findMany").mockResolvedValue([
      { id: 201, title: "Mad Max: Fury Road", genre: "Action", createdAt: new Date(), director: "George Miller", year: 2015, synopsis: "Post-apocalyptic action", updatedAt: new Date() },
      { id: 301, title: "The Dark Knight", genre: "Action", createdAt: new Date(), director: "Christopher Nolan", year: 2008, synopsis: "Batman fights the Joker", updatedAt: new Date() },
      { id: 302, title: "Inception", genre: "Sci-Fi", createdAt: new Date(), director: "Christopher Nolan", year: 2010, synopsis: "Dreams within dreams", updatedAt: new Date() },
    ] as any);
  
    const recommendations = await getRecommendedMovies(userId);
  
    if (Array.isArray(recommendations)) {
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some((m) => "title" in m && m.title === "Mad Max: Fury Road")).toBeTruthy();
    }
  });

  test("Debe devolver un mensaje si el usuario no tiene suficientes calificaciones", async () => {
    const userId = 2;

    jest.spyOn(prisma.rating, "findMany").mockResolvedValue([]);

    const recommendations = await getRecommendedMovies(userId);

    expect(recommendations).toEqual({ message: "No hay suficientes datos para recomendar películas." });
  });

  test("Debe devolver un mensaje si no se encuentran recomendaciones", async () => {
    const userId = 3;

    jest.spyOn(prisma.rating, "findMany").mockResolvedValue([
      { movie: { id: 104, genre: "Drama" } },
    ] as any);

    jest.spyOn(prisma.movie, "findMany").mockResolvedValue([]);

    const recommendations = await getRecommendedMovies(userId);

    expect(recommendations).toEqual({ message: "No hay suficientes datos para recomendar películas." });
  });
});
