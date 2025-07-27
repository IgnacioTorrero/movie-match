import { prisma } from "../prisma";
import redis from "../utils/redisClient";

/**
 * Creates or updates a rating for a given movie by a user.
 * 
 * @param userId - ID of the user rating the movie
 * @param movieId - ID of the movie to be rated
 * @param score - Rating score between 1 and 5
 * @returns The created or updated rating
 * @throws Error if the input data is invalid or there are database issues
 */
export const rateMovie = async (
  userId: number,
  movieId: number,
  score: number
): Promise<{ id: number; userId: number; movieId: number; score: number }> => {
  if (score < 1 || score > 5) {
    throw new Error("The rating must be between 1 and 5 stars.");
  }

  if (!userId || !movieId) {
    throw new Error("User ID and Movie ID are required.");
  }

  const movie = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movie) {
    throw new Error("The film does not exist.");
  }

  const existingRating = await prisma.rating.findFirst({
    where: { userId, movieId },
  });

  if (existingRating) {
    try {
      const updated = await prisma.rating.update({
        where: { id: existingRating.id },
        data: { score },
      });

      await redis.del(`recommendations:${userId}`);
      console.log("🧹 Recommendation cache invalidated (update)");

      return updated;
    } catch (error) {
      throw new Error("Error updating rating.");
    }
  }

  try {
    const created = await prisma.rating.create({
      data: { userId, movieId, score },
    });

    await redis.del(`recommendations:${userId}`);
    console.log("🧹 Recommendation cache invalidated (create)");

    return created;
  } catch (error) {
    throw new Error("Error creating rating.");
  }
};