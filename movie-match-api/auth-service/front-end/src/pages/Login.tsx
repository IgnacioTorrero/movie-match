import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h1>

        <input
          className="w-full p-3 mb-3 border rounded-lg text-sm"
          placeholder="Email"
          name="email"
          value={loginForm.email}
          onChange={handleChange}
        />

        <div className="relative mb-6">
          <input
            className="w-full p-3 pr-10 border rounded-lg text-sm"
            placeholder="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={loginForm.password}
            onChange={handleChange}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            role="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.03-10-9s4.477-9 10-9 10 4.03 10 9c0 1.385-.312 2.7-.875 3.875M15 15l6 6m0 0l-6-6m6 6L9 3" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm" onClick={() => navigate('/')}>
            Volver
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm" onClick={login}>
            Login
          </button>
        </div>

        {error && <p className="text-red-600 mt-4 text-center text-sm">{error}</p>}
        {user && <p className="text-gray-600 mt-2 text-sm text-center">Logueado como: {user.email}</p>}
      </div>
    </div>
  );
}
