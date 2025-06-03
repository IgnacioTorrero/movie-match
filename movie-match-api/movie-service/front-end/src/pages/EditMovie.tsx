// src/pages/EditMovie.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RatingStars from "../components/RatingStars";
import movieApi from "../api/movieApi";

const EditMovie = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    director: "",
    year: "",
    genre: "",
    synopsis: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    movieApi.get(`/movies/${id}`)
      .then(res => {
        const { title, director, year, genre, synopsis } = res.data;
        setForm({ title, director, year, genre, synopsis: synopsis || "" });
      })
      .catch(() => setError("Error al cargar los datos de la película"));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!form.title || !form.director || !form.year || !form.genre) {
      setError("Todos los campos excepto sinopsis son obligatorios.");
      return;
    }

    const yearNumber = parseInt(form.year.toString());
    const currentYear = new Date().getFullYear();

    if (isNaN(yearNumber) || yearNumber < 1800 || yearNumber > currentYear) {
      setError("El año debe ser un número válido entre 1800 y " + currentYear);
      return;
    }

    try {
      await movieApi.put(`/movies/${id}`, { ...form, year: yearNumber });
      navigate(`/${id}`);
    } catch (err: any) {
      setError("Error al actualizar la película. Verificá los datos ingresados.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-4">Editar película</h1>
      <input name="title" placeholder="Título" className="w-full p-2 mb-2 border rounded" value={form.title} onChange={handleChange} />
      <input name="director" placeholder="Director" className="w-full p-2 mb-2 border rounded" value={form.director} onChange={handleChange} />
      <input name="year" placeholder="Año" className="w-full p-2 mb-2 border rounded" value={form.year} onChange={handleChange} />
      <input name="genre" placeholder="Género" className="w-full p-2 mb-2 border rounded" value={form.genre} onChange={handleChange} />
      <textarea name="synopsis" placeholder="Sinopsis" className="w-full p-2 mb-2 border rounded" value={form.synopsis} onChange={handleChange} />
      <button onClick={handleSubmit} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Actualizar</button>
      <button onClick={() => navigate("/")} className="ml-2 bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded">Cancelar</button>
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow" role="alert">
          <strong className="font-bold">Error de actualización:</strong>
          <span className="block sm:inline ml-1">{error}</span>
        </div>
      )}
      {/* ⭐ Calificación separada */}
      <div className="mt-6 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">Actualizar mi calificación</h2>
        <RatingStars movieId={parseInt(id!)} />
      </div>
    </div>
  );
};

export default EditMovie;
