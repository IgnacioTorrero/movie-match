// src/components/MovieCard.tsx
import { Link } from "react-router-dom";

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    director: string;
    year: number;
    genre: string;
  };
}

const MovieCard = ({ movie }: MovieCardProps) => {
  if (!movie.id) return null;
  
  return (
    <div className="p-4 border rounded shadow hover:bg-gray-50">
      <h2 className="text-lg font-bold">{movie.title}</h2>
      <p>🎬 Director: {movie.director}</p>
      <p>📅 Año: {movie.year}</p>
      <p>🎭 Género: {movie.genre}</p>
      <Link to={`/${movie.id}`} className="text-blue-500 mt-2 inline-block">Ver detalles</Link>
    </div>
  );
};

export default MovieCard;
