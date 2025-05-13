import { useState } from "react";
import { FaStar } from "react-icons/fa";
import ratingApi from "../api/ratingApi";

interface RatingStarsProps {
  movieId: number;
  initialScore?: number;
}

const RatingStars = ({ movieId, initialScore = 0 }: RatingStarsProps) => {
  const [rating, setRating] = useState(initialScore);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");

  const handleClick = async (score: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Debes estar logueado para calificar.");
        return;
      }

      await ratingApi.post("/rate", { movieId, score });

      setRating(score);
      setMessage("Calificación enviada exitosamente.");
    } catch (err: any) {
      setMessage("Error al enviar calificación.");
    }
  };

  return (
    <div className="mt-4">
      <p className="mb-1 font-semibold text-gray-700">Calificá esta película:</p>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            size={24}
            className={`cursor-pointer ${
              star <= (hover || rating) ? "text-yellow-500" : "text-gray-400"
            }`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          />
        ))}
      </div>
      {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}
    </div>
  );
};

export default RatingStars;
