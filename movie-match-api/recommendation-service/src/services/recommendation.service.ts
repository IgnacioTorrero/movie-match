import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Algoritmo de recomendación basado en calificaciones del usuario
export const getRecommendedMovies = async (userId: number) => {
  let highRatedMovies;
  try {
    highRatedMovies = await prisma.rating.findMany({
      where: { userId, score: { gte: 4 } },
      include: { movie: true },
    });
  } catch (error) {
    console.error("Error al obtener calificaciones:", error);
    throw new Error("Error al acceder a la base de datos.");
  }

  if (highRatedMovies.length === 0) {
    return { message: "No hay suficientes datos para recomendar películas." };
  }

  const genreCount: Record<string, number> = {};
  highRatedMovies.forEach(({ movie }: any) => {
    (movie.genre as string).split("/").forEach((genre: string) => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
  });

  const favoriteGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0];

  console.log("🎭 Género favorito:", favoriteGenre);

  const topGenreMovies = await prisma.movie.findMany({
    where: {
      genre: { contains: favoriteGenre },
      rating: {
        some: { score: { gte: 4 } },
      },
    },
  });

  const otherHighRatedMovies = await prisma.movie.findMany({
    where: {
      genre: { not: { contains: favoriteGenre } },
      rating: {
        some: { score: { gte: 4 } },
      },
    },
  });

  const recommendedMovies = [...topGenreMovies, ...otherHighRatedMovies];
  const uniqueRecommendations = Array.from(
    new Map(recommendedMovies.map((movie) => [movie.id, movie])).values()
  );

  return uniqueRecommendations.length > 0 ? uniqueRecommendations.slice(0, 5) : [{ message: "No se encontraron recomendaciones." }];
};
