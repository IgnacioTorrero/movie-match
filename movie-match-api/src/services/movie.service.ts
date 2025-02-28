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
    },
  });
  return movie;
};

// Obtener películas
export const getMovies = async () => {
  return await prisma.movie.findMany();
};

// Obtener película por ID
export const getMovieById = async (id: number, userId: number) => {
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: {
      ratings: {  
        where: { userId },
        select: { score: true }
      }
    },
  });

  // Mostrar el rating del usuario
  if (!movie) return null;
  const userRating = movie.ratings.length > 0 ? movie.ratings[0].score : "No hay rate";
  const { ratings, ...movieWithoutRatings } = movie;

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
      throw new Error("Movie not found or has dependencies");
  }
};
