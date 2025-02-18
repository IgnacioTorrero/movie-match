export function rateMovie(userId: number, movieId: number, score: number) {
    if (score < 1 || score > 5) {
      throw new Error("La calificación debe estar entre 1 y 5 estrellas.");
    }
  
    return { message: "Calificación guardada con éxito" };
  }  