import { Router, Request, Response } from "express";
import { getRecommendedMovies } from "../services/recommendation.service";
import { authenticateToken } from "../middlewares/auth.middleware";
import redis from "../utils/redisClient";

const router = Router();

// Ruta para obtener algoritmo de recomendaciones
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any)?.user?.id;
    if (!userId) {
      res.status(400).json({ error: "User ID no proporcionado." });
      return;
    }
    const recommendations = await getRecommendedMovies(userId);
    res.status(200).json(recommendations);
  } catch (error: any) {
    console.error("Error en /recommendations:", error);
    res.status(500).json({ error: error.message || "Error al obtener recomendaciones" });
  }  
});

// 🔄 Borrar la caché del usuario
router.delete("/cache", authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any)?.user?.id;
  await redis.del(`recommendations:${userId}`);
  res.json({ message: "Caché de recomendaciones borrada" });
});

export default router;
