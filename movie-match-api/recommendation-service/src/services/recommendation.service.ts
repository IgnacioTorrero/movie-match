import { prisma } from "../prisma";
import redis from "../utils/redisClient";

// Algoritmo de recomendación basado en calificaciones del usuario
export const getRecommendedMovies = async (userId: number) => {
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

    highRatedMovies = highRatedMovies.filter(r => r.movie && r.movie.genre);
  } catch (error) {
    console.error("Error al obtener calificaciones:", error);
    throw new Error("Error al acceder a la base de datos.");
  }

  if (highRatedMovies.length === 0) {
    return { message: "No hay suficientes datos para recomendar películas." };
  }

  // 1. Contar géneros más frecuentes
  const genreCount: Record<string, number> = {};
  highRatedMovies.forEach(({ movie }) => {
    movie.genre.split("/").forEach((genre: string) => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
  });

  // 2. Determinar el máximo de frecuencia y géneros empatados
  if (Object.keys(genreCount).length === 0) {
    return { message: "No se encontraron géneros para recomendar películas." };
  }

  const maxCount = Math.max(...Object.values(genreCount));
  const favoriteGenres = Object.entries(genreCount)
    .filter(([_, count]) => count === maxCount)
    .map(([genre]) => genre);

  // 3. Obtener IDs de películas ya calificadas por el usuario
  const ratedMovieIds = highRatedMovies.map(({ movie }) => movie.id);

  // 4. Buscar películas de géneros favoritos que NO hayan sido vistas
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

  // 🔍 Filtrar películas inválidas
  const validRecommendations = recommendedMovies.filter((m: any) => m && m.id);

  // Si no hay recomendaciones válidas, no se guarda nada en caché
  if (validRecommendations.length === 0) {
    return { message: "No se encontraron recomendaciones nuevas." };
  }

  // Guardar en Redis solo si hay recomendaciones válidas
  await redis.set(cacheKey, JSON.stringify(validRecommendations), "EX", 600);
  return validRecommendations;
};
