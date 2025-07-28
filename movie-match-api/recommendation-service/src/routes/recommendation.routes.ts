import { Router, Request, Response } from "express";
import { getRecommendedMovies } from "../services/recommendation.service";
import { authenticateToken } from "../middlewares/auth.middleware";
import redis from "../utils/redisClient";

const router = Router();

/**
 * @route   GET /recommendations
 * @desc    Retrieves personalized recommendations for the authenticated user
 * @access  Private (requires JWT)
 */
router.get(
  "/",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(400).json({ error: "User ID not provided." });
        return;
      }

      const recommendations = await getRecommendedMovies(userId);
      res.status(200).json(recommendations);
    } catch (error: any) {
      console.error("[GET /recommendations] Error:", error);
      res.status(500).json({ error: error.message || "Error getting recommendations." });
    }
  }
);

/**
 * @route   DELETE /recommendations/cache
 * @desc    Deletes the recommendation cache for the authenticated user
 * @access  Private (requires JWT)
 */
router.delete(
  "/cache",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(400).json({ error: "User ID not provided." });
        return;
      }

      await redis.del(`recommendations:${userId}`);
      res.status(200).json({ message: "Recommendation cache successfully cleared." });
    } catch (error: any) {
      console.error("[DELETE /recommendations/cache] Error:", error);
      res.status(500).json({ error: error.message || "Error clearing recommendation cache." });
    }
  }
);

export default router;