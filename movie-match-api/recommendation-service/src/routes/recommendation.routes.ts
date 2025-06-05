import { Router, Request, Response } from "express";
import { getRecommendedMovies } from "../services/recommendation.service";
import { authenticateToken } from "../middlewares/auth.middleware";
import redis from "../utils/redisClient";

const router = Router();

/**
 * @route   GET /recommendations
 * @desc    Obtiene recomendaciones personalizadas para el usuario autenticado
 * @access  Privado (requiere JWT)
 */
router.get(
  "/",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(400).json({ error: "User ID no proporcionado." });
        return;
      }

      const recommendations = await getRecommendedMovies(userId);
      res.status(200).json(recommendations);
    } catch (error: any) {
      console.error("[GET /recommendations] Error:", error);
      res.status(500).json({ error: error.message || "Error al obtener recomendaciones." });
    }
  }
);

/**
 * @route   DELETE /recommendations/cache
 * @desc    Elimina la caché de recomendaciones del usuario autenticado
 * @access  Privado (requiere JWT)
 */
router.delete(
  "/cache",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(400).json({ error: "User ID no proporcionado." });
        return;
      }

      await redis.del(`recommendations:${userId}`);
      res.status(200).json({ message: "Caché de recomendaciones borrada correctamente." });
    } catch (error: any) {
      console.error("[DELETE /recommendations/cache] Error:", error);
      res.status(500).json({ error: error.message || "Error al borrar la caché de recomendaciones." });
    }
  }
);

export default router;
