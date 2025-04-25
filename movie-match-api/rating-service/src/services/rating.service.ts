import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const rateMovie = async (userId: number, movieId: number, score: number) => {
  if (score < 1 || score > 5) {
    throw new Error("La calificación debe estar entre 1 y 5 estrellas.");
  }

  if (!userId || !movieId) {
    throw new Error("El ID de usuario y el ID de película son requeridos.");
  }
  
  const movie = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movie) {
    throw new Error("La película no existe.");
  }

  const existingRating = await prisma.rating.findFirst({
    where: { userId, movieId },
  });

  if (existingRating) {
    try {
      return await prisma.rating.update({
        where: { id: existingRating.id },
        data: { score }
      });
    } catch (error) {
      throw new Error("Error al actualizar la calificación.");
    }
  }
  
  try {
    return await prisma.rating.create({
      data: { userId, movieId, score },
    });
  } catch (error) {
    throw new Error("Error al crear la calificación.");
  }
};
