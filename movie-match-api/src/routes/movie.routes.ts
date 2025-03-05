import { Router, Request, Response } from "express";
import { createMovie, getMovies, getMovieById, updateMovie, deleteMovie, countMovies } from "../services/movie.service";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Ruta para crear película
router.post("/movies", authenticateToken, async (req: Request, res: Response): Promise<void> => {
    const { title, director, year, genre, synopsis } = req.body;
    
    // ✅ Validación de entrada
    if (!title || !director || !year || !genre) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
  
    try {
      const newMovie = await createMovie(title, director, year, genre, synopsis);
      res.status(201).json(newMovie);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });  

// Ruta para obtener películas con filtros y paginación
router.get("/movies", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { genre, director, year, page = 1, limit = 5 } = req.query;

    const filters: any = {};
    if (genre) filters.genre = { contains: genre as string };
    if (director) filters.director = { contains: director as string };
    if (year) filters.year = Number(year);

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNumber - 1) * pageSize;

    const movies = await getMovies(filters, pageSize, skip);
    const totalMovies = await countMovies(filters);

    res.status(200).json({
      totalMovies,
      totalPages: Math.ceil(totalMovies / pageSize),
      currentPage: pageNumber,
      movies,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para obtener película por ID
router.get("/movies/:id", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  try {
    const movie = await getMovieById(Number(id), userId);
    if (!movie) {
      res.status(404).json({ error: "Movie not found" });
      return;
    }

    res.status(200).json(movie);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para actualizar película
router.put("/movies/:id", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, director, year, genre, synopsis } = req.body;
  try {
    const updatedMovie = await updateMovie(Number(id), title, director, year, genre, synopsis);
    res.status(200).json(updatedMovie);
  } catch (error: any) {
    res.status(404).json({ error: "Movie not found" });
  }
});

// Ruta para eliminar película
router.delete("/movies/:id", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    try {
      const deletedMovie = await deleteMovie(Number(id));
      res.status(200).json(deletedMovie);
    } catch (error: any) {
      res.status(500).json({ error: "Error deleting movie" });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
