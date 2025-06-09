import { Router, Request, Response } from "express";
import { validate } from "../middlewares/validate.middleware";
import { movieSchema } from "../validations/movie.validation";
import {
  createMovie,
  getMoviesByUser,
  countMoviesByUser,
  updateMovie,
  deleteMovie,
  getMovieById,
  movieBelongsToUser
} from "../services/movie.service";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @route   POST /movies
 * @desc    Crea una nueva película asociada al usuario autenticado
 * @access  Privado (requiere JWT)
 */
router.post(
  "/movies",
  authenticateToken,
  validate(movieSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { title, director, year, genre, synopsis } = req.body;

      const newMovie = await createMovie(userId, title, director, year, genre, synopsis);
      res.status(201).json(newMovie);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @route   GET /movies
 * @desc    Lista películas del usuario autenticado con filtros y paginación
 * @access  Privado (requiere JWT)
 */
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

      const filters: Record<string, any> = {};
      if (genre) filters.genre = { contains: genre };
      if (director) filters.director = { contains: director };
      if (year) filters.year = Number(year);

      const pageNumber = Math.max(1, Number(page));
      const pageSize = Math.max(1, Number(limit));
      const skip = (pageNumber - 1) * pageSize;

      const [movies, totalMovies] = await Promise.all([
        getMoviesByUser(userId, filters, pageSize, skip),
        countMoviesByUser(userId, filters),
      ]);

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

/**
 * @route   GET /movies/:id
 * @desc    Obtiene los datos de una película específica del usuario
 * @access  Privado (requiere JWT)
 */
router.get(
  "/movies/:id",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as any).user.id;

    try {
      const movie = await getMovieById(Number(id), userId);
      res.status(200).json(movie);
    } catch (error: any) {
      if (error.message === "Película no encontrada") {
        res.status(404).json({ error: "Movie not found" });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
);

/**
 * @route   PUT /movies/:id
 * @desc    Actualiza una película si pertenece al usuario autenticado
 * @access  Privado (requiere JWT)
 */
router.put(
  "/movies/:id",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as any).user.id;

    try {
      const exists = await movieBelongsToUser(Number(id), userId);
      if (!exists) {
        res.status(404).json({ error: "Movie not found or unauthorized" });
        return;
      }

      const { title, director, year, genre, synopsis } = req.body;

      if (!title || !director || !year || !genre) {
        res.status(400).json({
          error: "Todos los campos son obligatorios excepto sinopsis.",
        });
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

/**
 * @route   DELETE /movies/:id
 * @desc    Elimina una película si pertenece al usuario autenticado
 * @access  Privado (requiere JWT)
 */
router.delete(
  "/movies/:id",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as any).user.id;

    try {
      const exists = await movieBelongsToUser(Number(id), userId);
      if (!exists) {
        res.status(404).json({ error: "Movie not found or unauthorized" });
        return;
      }

      const deletedMovie = await deleteMovie(Number(id));
      res.status(200).json(deletedMovie);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
