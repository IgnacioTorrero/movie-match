import { useEffect, useState } from "react";
import recommendationApi from "../api/recommendationApi";
import MovieCard from "./MovieCard";

const RecommendedMovies = () => {
  const [recommended, setRecommended] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await recommendationApi.get("/");
        if (res.data?.message) {
          setError(res.data.message);
        } else {
          setRecommended(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        setError("No se pudieron cargar las recomendaciones.");
      }
    };

    fetchRecommendations();
  }, []);

  if (error) {
    return (
      <div className="bg-yellow-100 text-yellow-700 p-4 rounded mt-8">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎯 Recomendadas para vos</h2>
      <div className="grid gap-4">
        {recommended.map((movie: any) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedMovies;
