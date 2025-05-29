import { PrismaClient } from "@prisma/client";
import redis from "../utils/redisClient";

export const prisma = new PrismaClient();

// Crear película asociada al usuario
const createMovie = async (
  userId: number,
  title: string,
  director: string,
  year: number,
  genre: string,
  synopsis?: string
) => {
  try {
    const movie = await prisma.movie.create({
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
    return movie;
  } catch (error: any) {
    throw new Error(`Error al crear la película: ${error.message}`);
  }
};

// Obtener películas del usuario con filtros y paginación
export const getMoviesByUser = async (
  userId: number,
  filters: any,
  take: number,
  skip: number
) => {
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

// Contar películas del usuario que cumplen filtros
const countMoviesByUser = async (userId: number, filters: any) => {
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

// Obtener película por ID verificando usuario
const getMovieById = async (id: number, userId: number) => {
  const movie = await prisma.movie.findFirst({
    where: {
      id,
      userMovies: { some: { userId } },
    },
    include: {
      rating: { where: { userId }, select: { score: true } },
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

// Actualizar película
const updateMovie = async (
  id: number,
  title: string,
  director: string,
  year: number,
  genre: string,
  synopsis?: string
) => {
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

// Eliminar película
const deleteMovie = async (id: number) => {
  try {
    // Buscar los userId relacionados a la película
    const userRelations = await prisma.userMovies.findMany({
      where: { movieId: id },
      select: { userId: true },
    });

    // Borrar calificaciones y relaciones
    await prisma.rating.deleteMany({
      where: { movieId: id },
    });

    await prisma.userMovies.deleteMany({
      where: { movieId: id },
    });

    // Borrar la película
    const deleted = await prisma.movie.delete({
      where: { id },
    });

    // Limpiar caché de recomendaciones por cada usuario afectado
    for (const relation of userRelations) {
      await redis.del(`recommendations:${relation.userId}`);
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
  updateMovie,
  deleteMovie
};
