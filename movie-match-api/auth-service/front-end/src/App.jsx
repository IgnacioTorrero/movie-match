import { useState } from 'react';
import './index.css';

export default function App() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
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
      if (!res.ok) throw new Error(data.error || 'Error');
      setUser(data);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const login = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setToken(data.token);
      setUser(data.user);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Auth Service</h1>
        <input className="w-full p-2 mb-2 border rounded" placeholder="Name" name="name" value={form.name} onChange={handleChange} />
        <input className="w-full p-2 mb-2 border rounded" placeholder="Email" name="email" value={form.email} onChange={handleChange} />
        <input className="w-full p-2 mb-4 border rounded" placeholder="Password" name="password" type="password" value={form.password} onChange={handleChange} />
        <div className="flex justify-between">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" onClick={register}>Register</button>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded" onClick={login}>Login</button>
        </div>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        {token && <p className="text-green-600 mt-4 break-all text-sm">Token: {token}</p>}
        {user && <p className="text-gray-700 mt-2 text-sm">Logged in as: {user.email}</p>}
      </div>
    </div>
  );
}
