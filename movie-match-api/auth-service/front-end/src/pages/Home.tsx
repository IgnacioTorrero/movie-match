import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Movie Match</h1>
        <div className="flex flex-col gap-4">
          <button
            className="bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
            onClick={() => navigate('/login')}
          >
            Iniciar Sesión
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
            onClick={() => navigate('/register')}
          >
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}
