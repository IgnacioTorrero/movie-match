// src/pages/CreateMovie.tsx
import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const CreateMovie = () => {
  const [form, setForm] = useState({
    title: "",
    director: "",
    year: "",
    genre: "",
    synopsis: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const yearNumber = parseInt(form.year);
      const res = await api.post("/movies", { ...form, year: yearNumber });
      console.log("Película creada:", res.data);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al crear película");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-4">Crear nueva película</h1>
      <input name="title" placeholder="Título" className="w-full p-2 mb-2 border rounded" onChange={handleChange} />
      <input name="director" placeholder="Director" className="w-full p-2 mb-2 border rounded" onChange={handleChange} />
      <input name="year" placeholder="Año" className="w-full p-2 mb-2 border rounded" onChange={handleChange} />
      <input name="genre" placeholder="Género" className="w-full p-2 mb-2 border rounded" onChange={handleChange} />
      <textarea name="synopsis" placeholder="Sinopsis (opcional)" className="w-full p-2 mb-2 border rounded" onChange={handleChange} />
      <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Crear</button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default CreateMovie;
