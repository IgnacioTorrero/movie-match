import { z } from "zod";

export const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  director: z.string().min(2, "Director is required"),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  genre: z.string().min(4, "Genre is required"),
  synopsis: z.string().max(500, "Synopsis cannot exceed 500 characters").optional(),
});
