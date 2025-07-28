// src/pages/CreateMovie.tsx
import { useState } from "react";
import movieApi from "../api/movieApi";
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
    if (!form.title || !form.director || !form.year || !form.genre) {
      setError("All fields except the synopsis are required.");
      return;
    }

    const yearNumber = parseInt(form.year);
    if (isNaN(yearNumber) || yearNumber < 1800 || yearNumber > new Date().getFullYear()) {
      setError("The year must be a valid number.");
      return;
    }

    try {
      const res = await movieApi.post("/movies", { ...form, year: yearNumber });
      console.log("Created movie:", res.data);
      navigate("/");
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Unknown error while creating the movie");
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-4">Create new movie</h1>
      <input name="title" placeholder="Title" className="w-full p-2 mb-2 border rounded" onChange={handleChange} />
      <input name="director" placeholder="Director" className="w-full p-2 mb-2 border rounded" onChange={handleChange} />
      <input name="year" placeholder="Year" className="w-full p-2 mb-2 border rounded" onChange={handleChange} />
      <input name="genre" placeholder="Genre" className="w-full p-2 mb-2 border rounded" onChange={handleChange} />
      <textarea name="synopsis" placeholder="Synopsis (optional)" className="w-full p-2 mb-2 border rounded" onChange={handleChange} />
      <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create</button>
      <button onClick={() => navigate("/")} className="ml-2 bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded">
        Cancel
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default CreateMovie;
