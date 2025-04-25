import { z } from "zod";

export const ratingSchema = z.object({
    score: z.number().min(1, "Score must be at least 1").max(5, "Score must be at most 5"),
});
  