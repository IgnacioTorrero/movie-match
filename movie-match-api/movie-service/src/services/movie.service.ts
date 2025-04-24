import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Crear película
export const createMovie = async (title: string, director: string, year: number, genre: string, synopsis?: string) => {
  const movie = await prisma.movie.create({
    data: {
      title,
      director,
      year,
      genre,
      synopsis,
      updatedAt: new Date(),
    },
  });
  return movie;
};

// Obtener películas con filtros y paginación
export const getMovies = async (filters: any, take: number, skip: number) => {
  try {
    return await prisma.movie.findMany({
      where: {
        ...filters,
        genre: filters.genre
          ? {
            contains: filters.genre.toLowerCase(),
            mode: "insensitive"
            }
          : undefined,
      },
      take,
      skip,
      orderBy: { createdAt: "desc" },
    });
  } catch (error: any) {
    throw new Error(`Error fetching movies: ${error.message}`);
  }
  
};

// Contar el total de películas que cumplen los filtros
export const countMovies = async (filters: any) => {
  return await prisma.movie.count({ where: filters });
};

// Obtener película por ID
export const getMovieById = async (id: number, userId: number) => {
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: {
      rating: {  
        where: { userId },
        select: { score: true }
      }
    },
  });

  // Mostrar el rating del usuario
  if (!movie) return null;
  const userRating = movie.rating.length > 0 ? movie.rating[0].score : "No hay rate";
  const { rating, ...movieWithoutRatings } = movie;

  return {
    ...movieWithoutRatings,
    userRating,
  };
};


// Actualizar película
export const updateMovie = async (id: number, title: string, director: string, year: number, genre: string, synopsis?: string) => {
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
export const deleteMovie = async (id: number) => {
  try {
      await prisma.rating.deleteMany({
          where: { movieId: id }
      });

      return await prisma.movie.delete({
          where: { id },
      });
  } catch (error: any) {
      console.error("Error en deleteMovie:", error);
      throw new Error("Movie not found");
  }
};
