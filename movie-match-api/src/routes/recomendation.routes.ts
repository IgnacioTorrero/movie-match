import { Router, Request, Response } from "express";
import { getRecommendedMovies } from "../services/recomendation.service";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Ruta para obtener algoritmo de recomendaciones
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any)?.user?.id;
    const recommendations = await getRecommendedMovies(userId);
    res.status(200).json(recommendations);
  } catch (error: any) {
    console.error("Error en /recommendations:", error);
    res.status(500).json({ error: "Error al obtener recomendaciones" });
  }
});

export default router;
