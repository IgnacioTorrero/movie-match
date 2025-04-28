import { Router, Request, Response } from "express";
import { validate } from "../middlewares/validate.middleware";
import { ratingSchema } from "../validations/rate.validation";
import { rateMovie } from "../services/rating.service";
import { authenticateToken } from "../middlewares/auth.middleware";
import { validateUser } from "../utils/validateUser";

const router = Router();

router.post("/rate", authenticateToken, validate(ratingSchema), async (req: Request, res: Response): Promise<void> => {
  const { movieId, score } = req.body;
  const userId = (req as any).user?.id;
  
  if (!userId) {
    res.status(401).json({ error: "Unauthorized - No user found" });
    return;
  }

  if (!movieId || typeof score !== 'number') {
    res.status(400).json({ error: "Movie ID and score are required." });
    return;
  }

  if (!userId || isNaN(userId) || !(await validateUser(userId))) {
    res.status(400).json({ error: "El usuario no existe o es inválido." });
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
