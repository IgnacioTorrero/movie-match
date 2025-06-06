import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ email: string } | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const login = async () => {
    try {
      const res = await fetch('http://localhost:3005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email.trim().toLowerCase(),
          password: loginForm.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');

      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.user.email);
      setUser(data.user);
      setError('');
      window.location.href = `/movies/?token=${data.token}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">Iniciar Sesión</h1>
        <input
          className="w-full p-2 mb-3 border rounded"
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
        <div className="flex justify-between gap-4">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            onClick={() => navigate('/')}
          >
            Volver
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            onClick={login}
          >
            Login
          </button>
        </div>
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
        {user && <p className="text-gray-600 mt-2 text-sm text-center">Logueado como: {user.email}</p>}
      </div>
    </div>
  );
}
