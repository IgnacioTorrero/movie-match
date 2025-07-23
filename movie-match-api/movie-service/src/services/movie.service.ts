import { prisma } from "../prisma";
import redis from "../utils/redisClient";
import { Movie, MovieWithUserRating } from "../movie";

/**
 * Crea una nueva película y la asocia al usuario que la crea.
 * 
 * @param userId - ID del usuario que crea la película
 * @param title - Título de la película
 * @param director - Director de la película
 * @param year - Año de estreno
 * @param genre - Género
 * @param synopsis - Sinopsis (opcional)
 * @returns Objeto de la película creada
 */
const createMovie = async (
  userId: number,
  title: string,
  director: string,
  year: number,
  genre: string,
  synopsis?: string
): Promise<Movie> => {
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

/**
 * Devuelve una lista paginada de películas asociadas a un usuario,
 * permitiendo aplicar filtros por campo.
 * 
 * @param userId - ID del usuario
 * @param filters - Filtros aplicables (género, director, año, etc.)
 * @param take - Cantidad de resultados por página
 * @param skip - Cantidad de resultados a omitir (para paginación)
 * @returns Lista de películas
 */
export const getMoviesByUser = async (
  userId: number,
  filters: Record<string, any>,
  take: number,
  skip: number
): Promise<Movie[]> => {
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

/**
 * Cuenta la cantidad total de películas que coinciden con los filtros
 * y pertenecen al usuario.
 * 
 * @param userId - ID del usuario
 * @param filters - Filtros aplicables
 * @returns Número total de películas encontradas
 */
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

/**
 * Obtiene una película por su ID, validando que pertenezca al usuario.
 * También devuelve el puntaje que le dio ese usuario si existe.
 * 
 * @param id - ID de la película
 * @param userId - ID del usuario autenticado
 * @returns Objeto de la película con posible score del usuario
 */
const getMovieById = async (
  id: number,
  userId: number
): Promise<MovieWithUserRating> => {
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

/**
 * Verifica si una película pertenece al usuario autenticado.
 * 
 * @param movieId - ID de la película
 * @param userId - ID del usuario
 * @returns true si pertenece, false si no
 */
const movieBelongsToUser = async (
  movieId: number,
  userId: number
): Promise<boolean> => {
  const result = await prisma.userMovies.findFirst({
    where: { movieId, userId },
  });
  return !!result;
};

/**
 * Actualiza una película existente. Solo se ejecuta si pertenece al usuario.
 * 
 * @param id - ID de la película
 * @param title - Nuevo título
 * @param director - Nuevo director
 * @param year - Nuevo año
 * @param genre - Nuevo género
 * @param synopsis - Nueva sinopsis (opcional)
 * @returns Película actualizada
 */
const updateMovie = async (
  id: number,
  title: string,
  director: string,
  year: number,
  genre: string,
  synopsis?: string
): Promise<Movie> => {
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

/**
 * Elimina una película, sus relaciones con usuarios y sus calificaciones.
 * Limpia la caché de recomendaciones en Redis para todos los usuarios vinculados.
 * 
 * @param id - ID de la película
 * @returns Película eliminada
 */
const deleteMovie = async (id: number): Promise<Movie> => {
  try {
    // Obtener todos los userId que tienen relación con la película (por rating o por userMovies)
    const [ratingUsers, movieUsers] = await Promise.all([
      prisma.rating.findMany({
        where: { movieId: id },
        select: { userId: true },
      }),
      prisma.userMovies.findMany({
        where: { movieId: id },
        select: { userId: true },
      }),
    ]);

    const allUserIds = Array.from(
      new Set([...ratingUsers, ...movieUsers].map((u) => u.userId))
    );

    // Eliminar relaciones antes de borrar la película
    await prisma.rating.deleteMany({ where: { movieId: id } });
    await prisma.userMovies.deleteMany({ where: { movieId: id } });

    const deleted = await prisma.movie.delete({ where: { id } });

    // Limpiar caché de recomendaciones de todos los usuarios involucrados
    for (const userId of allUserIds) {
      await redis.del(`recommendations:${userId}`);
    }

    return deleted;
  } catch (error: any) {
    console.error("Error en deleteMovie:", error);
    throw new Error("Movie not found");
  }
};

// Exportación explícita para mayor control
export {
  createMovie,
  getMoviesByUser as getMovies,
  countMoviesByUser,
  getMovieById,
  movieBelongsToUser,
  updateMovie,
  deleteMovie
};
