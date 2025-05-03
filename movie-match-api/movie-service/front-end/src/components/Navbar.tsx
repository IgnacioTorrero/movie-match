// src/components/Navbar.tsx
import { Link, useNavigate } from "react-router-dom";
import { removeToken } from "../auth";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem("userEmail");
    navigate("http://localhost:8081/"); // Redirige al login
  };

  return (
    <nav className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center shadow">
      <div className="flex items-center space-x-4">
        <Link to="/" className="hover:text-gray-300">Inicio</Link>
        <Link to="/create" className="hover:text-gray-300">Crear película</Link>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
      >
        Cerrar sesión
      </button>
    </nav>
  );
};

export default Navbar;
