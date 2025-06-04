import { prisma } from "../prisma";
import redis from "../utils/redisClient";

const createMovie = async (
  userId: number,
  title: string,
  director: string,
  year: number,
  genre: string,
  synopsis?: string
): Promise<any> => {
  try {
    return await prisma.movie.create({
      data: {
        title,
        director,
        year,
        genre,
        synopsis,
        updatedAt: new Date(),
        userMovies: {
          create: { userId },
        },
      },
    });
  } catch (error: any) {
    throw new Error(`Error al crear la película: ${error.message}`);
  }
};

export const getMoviesByUser = async (
  userId: number,
  filters: Record<string, any>,
  take: number,
  skip: number
): Promise<any[]> => {
  return await prisma.movie.findMany({
    where: {
      AND: [
        filters,
        {
          userMovies: {
            some: { userId },
          },
        },
      ],
    },
    take,
    skip,
    orderBy: { createdAt: "desc" },
  });
};

const countMoviesByUser = async (
  userId: number,
  filters: Record<string, any>
): Promise<number> => {
  return await prisma.movie.count({
    where: {
      AND: [
        filters,
        {
          userMovies: {
            some: { userId },
          },
        },
      ],
    },
  });
};

const getMovieById = async (
  id: number,
  userId: number
): Promise<any> => {
  const movie = await prisma.movie.findFirst({
    where: {
      id,
      userMovies: {
        some: { userId },
      },
    },
    include: {
      rating: {
        where: { userId },
        select: { score: true },
      },
    },
  });

  if (!movie) throw new Error("Película no encontrada");

  const userRating = movie.rating.length > 0 ? movie.rating[0].score : "No hay rate";
  const { rating, ...movieWithoutRatings } = movie;

  return {
    ...movieWithoutRatings,
    userRating,
  };
};

const movieBelongsToUser = async (
  movieId: number,
  userId: number
): Promise<boolean> => {
  const result = await prisma.userMovies.findFirst({
    where: { movieId, userId },
  });
  return !!result;
};

const updateMovie = async (
  id: number,
  title: string,
  director: string,
  year: number,
  genre: string,
  synopsis?: string
): Promise<any> => {
  return await prisma.movie.update({
    where: { id },
    data: {
      title,
      director,
      year,
      genre,
      synopsis,
      updatedAt: new Date(),
    },
  });
};

const deleteMovie = async (id: number): Promise<any> => {
  try {
    const userRelations = await prisma.userMovies.findMany({
      where: { movieId: id },
      select: { userId: true },
    });

    await prisma.rating.deleteMany({ where: { movieId: id } });
    await prisma.userMovies.deleteMany({ where: { movieId: id } });

    const deleted = await prisma.movie.delete({ where: { id } });

    for (const { userId } of userRelations) {
      await redis.del(`recommendations:${userId}`);
    }

    return deleted;
  } catch (error: any) {
    console.error("Error en deleteMovie:", error);
    throw new Error("Movie not found");
  }
};

export {
  createMovie,
  getMoviesByUser as getMovies,
  countMoviesByUser,
  getMovieById,
  movieBelongsToUser,
  updateMovie,
  deleteMovie
};
