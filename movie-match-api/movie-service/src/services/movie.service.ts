import { prisma } from "../prisma";
import redis from "../utils/redisClient";
import { Movie, MovieWithUserRating } from "../movie";

/**
 * Creates a new movie and associates it with the user who created it.
 * 
 * @param userId - ID of the user creating the movie
 * @param title - Title of the movie
 * @param director - Director of the movie
 * @param year - Release year
 * @param genre - Genre
 * @param synopsis - Synopsis (optional)
 * @returns Created movie object
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
 * Returns a paginated list of movies associated with a user,
 * allowing filtering by field.
 * 
 * @param userId - User ID
 * @param filters - Applicable filters (genre, director, year, etc.)
 * @param take - Number of results per page
 * @param skip - Number of results to skip (for pagination)
 * @returns List of movies
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
 * Counts the total number of movies that match the filters
 * and belong to the user.
 * 
 * @param userId - User ID
 * @param filters - Applicable filters
 * @returns Total number of movies found
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
 * Retrieves a movie by its ID, validating that it belongs to the user.
 * Also returns the score the user gave it, if any.
 * 
 * @param id - Movie ID
 * @param userId - Authenticated user ID
 * @returns Movie object with optional user score
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
 * Checks whether a movie belongs to the authenticated user.
 * 
 * @param movieId - Movie ID
 * @param userId - User ID
 * @returns true if it belongs, false otherwise
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
 * Updates an existing movie. Only runs if it belongs to the user.
 * 
 * @param id - Movie ID
 * @param title - New title
 * @param director - New director
 * @param year - New year
 * @param genre - New genre
 * @param synopsis - New synopsis (optional)
 * @returns Updated movie
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
 * Deletes a movie, its relationships with users, and its ratings.
 * Clears Redis cache for recommendations of all related users.
 * 
 * @param id - Movie ID
 * @returns Deleted movie
 */
const deleteMovie = async (id: number): Promise<Movie> => {
  try {
    // Get all userIds that have a relationship with the movie (via rating or userMovies)
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

    // Delete relationships before deleting the movie
    await prisma.rating.deleteMany({ where: { movieId: id } });
    await prisma.userMovies.deleteMany({ where: { movieId: id } });

    const deleted = await prisma.movie.delete({ where: { id } });

    // Clear recommendations cache for all involved users
    for (const userId of allUserIds) {
      await redis.del(`recommendations:${userId}`);
    }

    return deleted;
  } catch (error: any) {
    console.error("Error en deleteMovie:", error);
    throw new Error("Movie not found");
  }
};

// Explicit export for greater control
export {
  createMovie,
  getMoviesByUser as getMovies,
  countMoviesByUser,
  getMovieById,
  movieBelongsToUser,
  updateMovie,
  deleteMovie
};