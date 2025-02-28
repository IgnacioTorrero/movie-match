import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Algoritmo de recomendación basado en calificaciones del usuario
export const getRecommendedMovies = async (userId: number) => {
  const recommendedMovies = await prisma.rating.findMany({
    where: {
      userId,
      score: { gte: 4 },
    },
    include: {
      movie: true,
    },
    take: 5,
  });

  if (recommendedMovies.length === 0) {
    return { message: "No hay suficientes datos para recomendar películas." };
  }
  return recommendedMovies.map((rating) => rating.movie);
};
