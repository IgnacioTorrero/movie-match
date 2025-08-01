import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RatingStars from "../components/RatingStars";
import movieApi from "../api/movieApi";

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    movieApi.get(`/movies/${id}`)
      .then(res => setMovie(res.data))
      .catch(err => {
        setError(err.response?.data?.error || "Error loading movie");
      });
  }, [id]);

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete this movie?");
    if (!confirmed) return;

    try {
      await movieApi.delete(`/movies/${id}`);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Error deleting movie");
    }
  };

  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!movie) return <div className="p-4">Loading...</div>;

  return (
    <>
      <div className="max-w-xl mx-auto mt-8 p-6 border rounded shadow">
        <h1 className="text-2xl font-bold mb-4">{movie.title}</h1>
        <p><strong>Director:</strong> {movie.director}</p>
        <p><strong>Year:</strong> {movie.year}</p>
        <p><strong>Genre:</strong> {movie.genre}</p>
        <p><strong>Synopsis:</strong> {movie.synopsis}</p>
        <p><strong>My rating:</strong> {movie.userRating}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 ml-1">
      <button
        onClick={() => navigate(`/edit/${id}`)}
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
      >
        Edit movie
      </button>  
      <button
        onClick={handleDelete}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        Delete movie
      </button>
      <button
        onClick={() => navigate("/")}
        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
      >
        Back
      </button>
    </div>

    <RatingStars movieId={parseInt(id!)} initialScore={movie.userRating || 0} />
    </>
  );  
};

export default MovieDetails;
