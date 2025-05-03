import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ email: string } | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const register = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = Array.isArray(data.error)
          ? data.error.map((e: any) => e.message).join(', ')
          : data.error || 'Error';
        throw new Error(errMsg);
      }      
      setUser(data);
      setError('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('[object')) {
          setError('Error de validación. Verificá los campos ingresados.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Error desconocido');
      }
    }      
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Registro</h1>
        <input className="w-full p-2 mb-2 border rounded" placeholder="Nombre" name="name" value={form.name} onChange={handleChange} />
        <input className="w-full p-2 mb-2 border rounded" placeholder="Email" name="email" value={form.email} onChange={handleChange} />
        <input className="w-full p-2 mb-4 border rounded" placeholder="Password" name="password" type="password" value={form.password} onChange={handleChange} />
        <div className="flex justify-between">
          <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded" onClick={() => navigate('/')}>Volver</button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" onClick={register}>Registrarse</button>
        </div>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        {user && <p className="text-green-600 mt-2 text-sm">Registrado como: {user.email}</p>}
      </div>
    </div>
  );
}
