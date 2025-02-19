import { Router, Request, Response } from "express";
import { createMovie, getMovies, getMovieById, updateMovie, deleteMovie } from "../services/movie.service";

const router = Router();

// Ruta para crear película
router.post("/movies", async (req: Request, res: Response): Promise<void> => {
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

// Ruta para obtener películas
router.get("/movies", async (req: Request, res: Response): Promise<void> => {
  try {
    const movies = await getMovies();
    res.status(200).json(movies);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para obtener película por ID
router.get("/movies/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const movie = await getMovieById(Number(id));
    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(404).json({ error: "Movie not found" });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para actualizar película
router.put("/movies/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, director, year, genre, synopsis } = req.body;
  try {
    const updatedMovie = await updateMovie(Number(id), title, director, year, genre, synopsis);
    res.status(200).json(updatedMovie);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para eliminar película
router.delete("/movies/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const deletedMovie = await deleteMovie(Number(id));
    res.status(200).json(deletedMovie);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
