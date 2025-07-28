import { useEffect, useState } from "react";
import recommendationApi from "../api/recommendationApi";
import MovieCard from "./MovieCard";

const RecommendedMovies = () => {
  const [recommended, setRecommended] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const fetchRecommendations = async () => {
    try {
      const res = await recommendationApi.get("/");

      if (Array.isArray(res.data)) {
        const filtered = res.data.filter(movie => movie?.id);
        if (filtered.length > 0) {
          setRecommended(filtered);
          setMessage("");
        } else {
          setRecommended([]);
          setMessage("No new recommendations were found.");
        }
      } else if (res.data?.message) {
        setRecommended([]);
        setMessage(res.data.message);
      }
    } catch {
      setRecommended([]);
      setMessage("The recommendations could not be loaded.");
    }
  };

  const handleRefresh = async () => {
    await recommendationApi.delete("/cache");
    await fetchRecommendations();
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (message && recommended.length === 0) {
    return (
      <div className="bg-yellow-100 text-yellow-700 p-4 rounded mt-8">
        {message}
      </div>
    );
  }

  if (recommended.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          🎯 Recomendadas para vos
        </h2>
        <button
          onClick={handleRefresh}
          className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center gap-1 focus:outline-none"
          title="Update recommendations"
        >
          <span className="text-lg">↻</span> Update
        </button>
      </div>
      <div className="grid gap-4">
        {recommended.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedMovies;
