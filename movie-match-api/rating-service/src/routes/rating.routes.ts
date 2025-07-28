import { Router, Request, Response } from "express";
import { validate } from "../middlewares/validate.middleware";
import { ratingSchema } from "../validations/rate.validation";
import { rateMovie } from "../services/rating.service";
import { authenticateToken } from "../middlewares/auth.middleware";
import { validateUser } from "../utils/validateUser";

const router = Router();

/**
 * @route   POST /rate
 * @desc    Registers or updates a rating for a movie
 * @access  Private (requires JWT)
 */
router.post(
  "/rate",
  authenticateToken,
  validate(ratingSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { movieId, score } = req.body;
    const userId = (req as any).user?.id;

    try {
      if (!userId || isNaN(userId) || !(await validateUser(userId))) {
        res.status(401).json({ error: "Unauthorized or invalid user." });
        return;
      }

      const rating = await rateMovie(userId, movieId, score);
      res.status(200).json(rating);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;