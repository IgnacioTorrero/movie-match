import { Router, Request, Response } from "express";
import { validate } from "../middlewares/validate.middleware";
import { ratingSchema } from "../validations/rate.validation";
import { rateMovie } from "../services/rating.service";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/rate", authenticateToken, validate(ratingSchema), async (req: Request, res: Response): Promise<void> => {
  const { movieId, score } = req.body;
  const userId = (req as any).user.id;

  if (!movieId || typeof score !== 'number') {
    res.status(400).json({ error: "Movie ID and score are required." });
    return;
  }

  try {
    const rating = await rateMovie(userId, movieId, score);
    res.status(200).json(rating);
    return;
  } catch (error: any) {
    res.status(400).json({ error: error.message });
    return;
  }
});

export default router;
