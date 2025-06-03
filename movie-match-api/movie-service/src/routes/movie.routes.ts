import { Router, Request, Response } from "express";
import { validate } from "../middlewares/validate.middleware";
import { movieSchema } from "../validations/movie.validation";
import {
  createMovie,
  getMoviesByUser,
  countMoviesByUser,
  updateMovie,
  deleteMovie,
} from "../services/movie.service";
import { authenticateToken } from "../middlewares/auth.middleware";
import { prisma } from "../services/movie.service";

const router = Router();

// Ruta para crear película
router.post(
  "/movies",
  authenticateToken,
  validate(movieSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const newMovie = await createMovie(
        userId,
        req.body.title,
        req.body.director,
        req.body.year,
        req.body.genre,
        req.body.synopsis
      );
      res.status(201).json(newMovie);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Ruta para obtener películas del usuario con filtros y paginación
router.get(
  "/movies",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { genre, director, year, page = 1, limit = 5 } = req.query as {
        genre?: string;
        director?: string;
        year?: string;
        page?: number;
        limit?: number;
      };
      const userId = (req as any).user.id;

      const filters: any = {};
      if (genre) filters.genre = { contains: genre as string };
      if (director) filters.director = { contains: director as string };
      if (year) filters.year = Number(year);

      const pageNumber = Math.max(1, Number(page));
      const pageSize = Math.max(1, Number(limit));
      const skip = (pageNumber - 1) * pageSize;

      const movies = await getMoviesByUser(userId, filters, pageSize, skip);
      const totalMovies = await countMoviesByUser(userId, filters);

      res.status(200).json({
        totalMovies,
        totalPages: Math.ceil(totalMovies / pageSize),
        currentPage: pageNumber,
        movies,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Ruta para obtener película por ID (solo si pertenece al usuario)
router.get(
  "/movies/:id",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as any).user.id;

    try {
      const movie = await prisma.movie.findFirst({
        where: { id: Number(id), userMovies: { some: { userId } } },
        include: { rating: { where: { userId }, select: { score: true } } },
      });

      if (!movie) {
        res.status(404).json({ error: "Movie not found" });
        return;
      }

      const userRating = movie.rating.length ? movie.rating[0].score : "No hay rate";
      const { rating, ...movieWithoutRatings } = movie;

      res.status(200).json({ ...movieWithoutRatings, userRating });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Ruta para actualizar película (solo si pertenece al usuario)
router.put(
  "/movies/:id",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as any).user.id;

    try {
      const exists = await prisma.userMovies.findFirst({
        where: { movieId: Number(id), userId },
      });

      if (!exists) {
        res.status(404).json({ error: "Movie not found or unauthorized" });
        return;
      }

      const { title, director, year, genre, synopsis } = req.body;

      if (!title || !director || !year || !genre) {
        res.status(400).json({ error: "Todos los campos son obligatorios excepto sinopsis." });
        return;
      }

      const updatedMovie = await updateMovie(
        Number(id),
        title,
        director,
        year,
        genre,
        synopsis
      );

      res.status(200).json(updatedMovie);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Ruta para eliminar película (solo si pertenece al usuario)
router.delete(
  "/movies/:id",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as any).user.id;

    try {
      const exists = await prisma.userMovies.findFirst({
        where: { movieId: Number(id), userId },
      });

      if (!exists) {
        res.status(404).json({ error: "Movie not found or unauthorized" });
        return;
      }

      await prisma.rating.deleteMany({ where: { movieId: Number(id) } });
      await prisma.userMovies.deleteMany({ where: { movieId: Number(id) } });
      const deletedMovie = await deleteMovie(Number(id));

      res.status(200).json(deletedMovie);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
