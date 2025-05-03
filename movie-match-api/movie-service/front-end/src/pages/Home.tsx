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
    fetchMovies();
  }, [page]);

  const handleSearch = () => {
    setPage(1); // Reinicia a la página 1 con nuevos filtros
    fetchMovies();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Películas</h1>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="Buscar por género"
          className="border p-2 rounded"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Buscar por director"
          className="border p-2 rounded"
          value={director}
          onChange={(e) => setDirector(e.target.value)}
        />
        <input
          type="number"
          placeholder="Buscar por año"
          className="border p-2 rounded"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white rounded px-4 py-2 mt-2 md:mt-0"
          onClick={handleSearch}
        >
          Buscar
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <div className="grid gap-4 mb-6">
        {movies.map((movie: any) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {/* PAGINACIÓN */}
      <div className="flex justify-center items-center space-x-4">
        <button
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          ◀ Anterior
        </button>
        <span>
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
  );
};

export default Home;
