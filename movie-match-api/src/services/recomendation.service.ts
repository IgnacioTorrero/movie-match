import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Algoritmo de recomendación basado en calificaciones del usuario
export const getRecommendedMovies = async (userId: number) => {
  const highRatedMovies = await prisma.rating.findMany({
    where: { userId, score: { gte: 4 } },
    include: { movie: true },
  });

  if (highRatedMovies.length === 0) {
    return { message: "No hay suficientes datos para recomendar películas." };
  }

  const genreCount: Record<string, number> = {};
  highRatedMovies.forEach(({ movie }) => {
    movie.genre.split("/").forEach((genre) => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
  });

  const favoriteGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0];

  console.log("🎭 Género favorito:", favoriteGenre);

  const topGenreMovies = await prisma.movie.findMany({
    where: {
      genre: { contains: favoriteGenre },
      ratings: {
        some: { score: { gte: 4 } },
      },
    },
  });

  const otherHighRatedMovies = await prisma.movie.findMany({
    where: {
      genre: { not: { contains: favoriteGenre } },
      ratings: {
        some: { score: { gte: 4 } },
      },
    },
  });

  const recommendedMovies = [...topGenreMovies, ...otherHighRatedMovies];
  const uniqueRecommendations = Array.from(
    new Map(recommendedMovies.map((movie) => [movie.id, movie])).values()
  );

  return uniqueRecommendations.slice(0, 5);
};
