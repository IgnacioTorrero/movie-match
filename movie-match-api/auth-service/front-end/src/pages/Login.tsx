import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState<{ email: string } | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const login = async () => {
    try {
      const cleanEmail = loginForm.email.trim().toLowerCase();

      console.log("LOGIN PAYLOAD", {
        email: cleanEmail,
        password: loginForm.password
      });

      const res = await fetch('http://localhost:3005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: loginForm.password
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');

      // Almacenamiento de Token para endpoints protegidos
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.user.email);

      setToken(data.token);
      setUser(data.user);
      setError('');

      // Redireccionamiento a pagina principal
      window.location.href = `http://localhost:8082/?token=${data.token}`;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido');
      }
    }    
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h1>
        <input
          className="w-full p-2 mb-2 border rounded"
          placeholder="Email"
          name="email"
          value={loginForm.email}
          onChange={handleChange}
        />
        <input
          className="w-full p-2 mb-4 border rounded"
          placeholder="Password"
          name="password"
          type="password"
          value={loginForm.password}
          onChange={handleChange}
        />
        <div className="flex justify-between">
          <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded" onClick={() => navigate('/')}>Volver</button>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded" onClick={login}>Login</button>
        </div>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        {user && <p className="text-gray-700 mt-2 text-sm">Logged in as: {user.email}</p>}
      </div>
    </div>
  );
}
