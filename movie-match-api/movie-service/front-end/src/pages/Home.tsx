// src/pages/Home.tsx
import { useEffect, useState } from "react";
import api from "../api";
import MovieCard from "../components/MovieCard";

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
      const res = await api.get("/movies", {
        params: {
          genre,
          director,
          year,
          page,
          limit: 5,
        },
      });

      setMovies(res.data.movies);
      setTotalPages(res.data.totalPages);
      setError("");
    } catch (err: any) {
      setError("Error al obtener películas");
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromURL = urlParams.get("token");
  
    if (tokenFromURL) {
      localStorage.setItem("token", tokenFromURL);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [page]);

  const handleSearch = () => {
    setPage(1); // Reinicia a la página 1 con nuevos filtros
    fetchMovies();
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🎬 Películas</h1>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "http://localhost:8081/login";
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Cerrar sesión
          </button>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Género"
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
            placeholder="Año"
            className="border p-2 rounded shadow-sm"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
            onClick={handleSearch}
          >
            Buscar
          </button>
        </div>
  
        {error && <p className="text-red-600 mb-4">{error}</p>}
  
        <div className="grid gap-4 mb-6">
          {movies.map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
  
        <div className="flex justify-center items-center space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            ◀ Anterior
          </button>
          <span className="text-gray-700">
            Página {page} de {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Siguiente ▶
          </button>
        </div>
      </div>
    </div>
  );  
};

export default Home;
