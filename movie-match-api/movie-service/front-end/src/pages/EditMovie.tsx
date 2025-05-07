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
    try {
      const yearNumber = parseInt(form.year.toString());
      await movieApi.put(`/movies/${id}`, { ...form, year: yearNumber });
      navigate(`/movies/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al actualizar la película");
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
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {/* ⭐ Calificación separada */}
      <div className="mt-6 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">Actualizar mi calificación</h2>
        <RatingStars movieId={parseInt(id!)} />
      </div>
    </div>
  );
};

export default EditMovie;
