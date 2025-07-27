import { prisma } from "../prisma";
import redis from "../utils/redisClient";

/**
 * Generates movie recommendations for a user based on their previous ratings.
 *
 * @param userId - Authenticated user's ID
 * @returns List of recommended movies or an informative message
 * @throws Error if database access fails
 */
export const getRecommendedMovies = async (userId: number): Promise<any> => {
  const cacheKey = `recommendations:${userId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    console.log("📦 Recommendations from cache");
    return JSON.parse(cached);
  }

  let allRated: { score: number; movie: { id: number; genre: string } }[] = [];

  try {
    allRated = await prisma.rating.findMany({
      where: { userId },
      include: { movie: true },
    });
  } catch (error) {
    console.error("Error getting ratings:", error);
    throw new Error("Error accessing the database.");
  }

  const ratedMovieIds = allRated
    .filter((r) => r.movie && r.movie.id)
    .map(({ movie }) => movie.id);

  const highRatedMovies = allRated.filter(
    (r) => r.score >= 4 && r.movie && r.movie.genre
  );

  if (highRatedMovies.length === 0) {
    return { message: "There is not enough data to recommend movies." };
  }

  // 📊 Count the most frequent genres
  const genreCount: Record<string, number> = {};
  highRatedMovies.forEach(({ movie }) => {
    movie.genre.split("/").forEach((genre: string) => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
  });

  if (Object.keys(genreCount).length === 0) {
    return { message: "No genres were found to recommend movies." };
  }

  const maxCount = Math.max(...Object.values(genreCount));
  const favoriteGenres = Object.entries(genreCount)
    .filter(([_, count]) => count === maxCount)
    .map(([genre]) => genre);

  // 🎥 Search for new unseen movies of the same genre
  const recommendedMovies = await prisma.movie.findMany({
    where: {
      AND: [
        {
          OR: favoriteGenres.map((genre) => ({
            genre: { contains: genre },
          })),
        },
        {
          id: { notIn: ratedMovieIds },
        },
      ],
    },
    take: 5,
  });

  const validRecommendations = recommendedMovies.filter((m: { id?: number }) => m && m.id);

  if (validRecommendations.length === 0) {
    return { message: "No new recommendations were found." };
  }

  await redis.set(cacheKey, JSON.stringify(validRecommendations), "EX", 600);
  return validRecommendations;
};