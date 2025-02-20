import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const rateMovie = async (userId: number, movieId: number, score: number) => {
  if (score < 1 || score > 5) {
    throw new Error("La calificación debe estar entre 1 y 5 estrellas.");
  }

  const movie = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movie) {
    throw new Error("La película no existe.");
  }

  const existingRating = await prisma.rating.findFirst({
    where: { userId, movieId },
  });

  if (existingRating) {
    return await prisma.rating.update({
      where: { id: existingRating.id },
      data: { score },
    });
  }

  return await prisma.rating.create({
    data: { userId, movieId, score },
  });
};
