import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import movieApi from "../api/movieApi";
import MovieCard from "../components/MovieCard";
import RecommendedMovies from "../components/RecommendedMovies";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [genre, setGenre] = useState("");
  const [director, setDirector] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  const fetchMovies = async () => {
    try {
      const queryParams: any = {
        genre,
        director,
        page,
        limit: 5,
      };

      if (/^\d{4}$/.test(year)) {
        queryParams.year = year;
      }

      const res = await movieApi.get("/movies", { params: queryParams });

      setMovies(res.data.movies);
      setTotalPages(res.data.totalPages);
      setError("");
    } catch (err: any) {
      setError("Error getting movies");
    }
  };

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      setGenre("");
      setDirector("");
      setYear("");
      setPage(1);
    }
  }, [location]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromURL = urlParams.get("token");

    if (tokenFromURL) {
      localStorage.setItem("token", tokenFromURL);
      window.history.replaceState(null, "", window.location.pathname);
    }

    fetchMovies();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [page, genre, director, year]);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center px-4 overflow-x-hidden">
      <div className="w-full max-w-5xl bg-white p-6 rounded-lg shadow-md mt-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          🎬 Movies
        </h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Genre"
            className="border p-2 rounded shadow-sm"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
          <input
            type="text"
            placeholder="Director"
            className="border p-2 rounded shadow-sm"
            value={director}
            onChange={(e) => setDirector(e.target.value)}
          />
          <input
            type="number"
            placeholder="Year"
            className="border p-2 rounded shadow-sm"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Movie list or empty message */}
        <div className="grid gap-4 mb-6">
          {movies.length > 0 ? (
            movies.map((movie: any) => (
              <MovieCard key={movie.id} movie={movie} />
            ))
          ) : (
            <div className="text-center text-gray-500 text-lg flex flex-col items-center mt-8">
              <span className="text-5xl mb-2">🎞️</span>
              <p>No results were found for the entered filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            ◀ Previous
          </button>
          <span className="text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next ▶
          </button>
        </div>

        {/* 🔽 Recommendations */}
        {!genre && !director && !year && <RecommendedMovies />}
      </div>
    </div>
  );
};

export default Home;
