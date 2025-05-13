// src/components/Navbar.tsx
import { Link } from "react-router-dom";
import { removeToken } from "../auth";

const Navbar = () => {
  const handleLogout = () => {
    removeToken();
    localStorage.removeItem("userEmail");
    window.location.href = "http://localhost:8081/";
  };  

  return (
    <nav className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center shadow">
      <div className="flex items-center space-x-2">
        <Link
          to="/"
          className="text-white hover:text-purple-400 transition-colors mr-3"
        >
          Inicio
        </Link>
        <Link
          to="/create"
          className="text-white hover:text-purple-400 transition-colors"
        >
          Agregar película
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-4"
      >
        Cerrar sesión
      </button>
    </nav>
  );
};

export default Navbar;
