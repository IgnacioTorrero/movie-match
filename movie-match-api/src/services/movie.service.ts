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
export const getMovieById = async (id: number) => {
  return await prisma.movie.findUnique({
    where: {
      id,
    },
  });
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
      return await prisma.movie.delete({
        where: { id },
      });
    } catch (error: any) {
        throw new Error("Movie not found");
      throw error;
    }
  };
