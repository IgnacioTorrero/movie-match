import { prisma } from "../prisma";
import redis from "../utils/redisClient";

/**
 * Genera recomendaciones de películas para un usuario basado en sus calificaciones previas.
 *
 * @param userId - ID del usuario autenticado
 * @returns Lista de películas recomendadas o un mensaje informativo
 * @throws Error si falla la conexión a la base de datos
 */
export const getRecommendedMovies = async (userId: number): Promise<any> => {
  const cacheKey = `recommendations:${userId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    console.log("📦 Recomendaciones desde caché");
    return JSON.parse(cached);
  }

  let highRatedMovies: { movie: { id: number; genre: string } }[] = [];

  try {
    highRatedMovies = await prisma.rating.findMany({
      where: { userId, score: { gte: 4 } },
      include: { movie: true },
    });

    highRatedMovies = highRatedMovies.filter(
      (r) => r.movie && r.movie.genre
    );
  } catch (error) {
    console.error("Error al obtener calificaciones:", error);
    throw new Error("Error al acceder a la base de datos.");
  }

  if (highRatedMovies.length === 0) {
    return { message: "No hay suficientes datos para recomendar películas." };
  }

  // 📊 Contar géneros más frecuentes
  const genreCount: Record<string, number> = {};
  highRatedMovies.forEach(({ movie }) => {
    movie.genre.split("/").forEach((genre: string) => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
  });

  if (Object.keys(genreCount).length === 0) {
    return { message: "No se encontraron géneros para recomendar películas." };
  }

  const maxCount = Math.max(...Object.values(genreCount));
  const favoriteGenres = Object.entries(genreCount)
    .filter(([_, count]) => count === maxCount)
    .map(([genre]) => genre);

  // 🎯 Obtener IDs de películas ya vistas
  const ratedMovieIds = highRatedMovies.map(({ movie }) => movie.id);

  // 🎥 Buscar nuevas películas del mismo género no vistas
  const recommendedMovies = await prisma.movie.findMany({
    where: {
      AND: [
        {
          OR: favoriteGenres.map((genre) => ({
            genre: { contains: genre },
          })),
        },
        {
          id: { notIn: ratedMovieIds },
        },
      ],
    },
    take: 5,
  });

  const validRecommendations = recommendedMovies.filter((m: { id?: number }) => m && m.id);

  if (validRecommendations.length === 0) {
    return { message: "No se encontraron recomendaciones nuevas." };
  }

  await redis.set(cacheKey, JSON.stringify(validRecommendations), "EX", 600);
  return validRecommendations;
};
