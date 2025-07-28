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
      .catch(() => setError("Error loading movie data"));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Basic validations
    if (!form.title || !form.director || !form.year || !form.genre) {
      setError("All fields except synopsis are required.");
      return;
    }

    const yearNumber = parseInt(form.year.toString());
    const currentYear = new Date().getFullYear();

    if (isNaN(yearNumber) || yearNumber < 1800 || yearNumber > currentYear) {
      setError("The year must be a valid number between 1800 and " + currentYear);
      return;
    }

    try {
      await movieApi.put(`/movies/${id}`, { ...form, year: yearNumber });
      navigate(`/${id}`);
    } catch (err: any) {
      setError("Error updating movie. Please check your entered data.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-4">Edit movie</h1>
      <input name="title" placeholder="Title" className="w-full p-2 mb-2 border rounded" value={form.title} onChange={handleChange} />
      <input name="director" placeholder="Director" className="w-full p-2 mb-2 border rounded" value={form.director} onChange={handleChange} />
      <input name="year" placeholder="Year" className="w-full p-2 mb-2 border rounded" value={form.year} onChange={handleChange} />
      <input name="genre" placeholder="Genre" className="w-full p-2 mb-2 border rounded" value={form.genre} onChange={handleChange} />
      <textarea name="synopsis" placeholder="Synopsis" className="w-full p-2 mb-2 border rounded" value={form.synopsis} onChange={handleChange} />
      <button onClick={handleSubmit} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Update</button>
      <button onClick={() => navigate("/")} className="ml-2 bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow" role="alert">
          <strong className="font-bold">Update error:</strong>
          <span className="block sm:inline ml-1">{error}</span>
        </div>
      )}
      {/* ⭐ Separate rating */}
      <div className="mt-6 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">Update my rating</h2>
        <RatingStars movieId={parseInt(id!)} />
      </div>
    </div>
  );
};

export default EditMovie;
