import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const register = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(data.error)
          ? data.error.map((e: any) => e.message).join(', ')
          : data.error || 'Error';
        throw new Error(msg);
      }
      setUser(data);
      setError('');
      setForm({ name: '', email: '', password: '' });
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? err.message.includes('[object') ? 'Error de validación. Verificá los campos ingresados.' : err.message
        : 'Error desconocido';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Registro</h1>

        <input className="w-full p-3 mb-3 border rounded-lg text-sm" placeholder="Nombre" name="name" value={form.name} onChange={handleChange} />
        <input className="w-full p-3 mb-3 border rounded-lg text-sm" placeholder="Email" name="email" value={form.email} onChange={handleChange} />

        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            className="w-full p-3 pr-10 border rounded-lg text-sm"
            value={form.password}
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
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50"
            onClick={register}
            disabled={!form.name || !form.email || !form.password}
          >
            Registrarse
          </button>
        </div>

        {error && <p className="text-red-600 mt-4 text-center text-sm">{error}</p>}
        {user && <p className="text-green-600 mt-2 text-sm text-center">Registrado como: {user.email}</p>}
      </div>
    </div>
  );
}
