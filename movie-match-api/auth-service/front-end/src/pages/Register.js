import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const register = async () => {
        try {
            const res = await fetch('http://localhost:3005/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                const msg = Array.isArray(data.error)
                    ? data.error.map((e) => e.message).join(', ')
                    : data.error || 'Error';
                throw new Error(msg);
            }
            setUser(data);
            setError('');
            setForm({ name: '', email: '', password: '' });
        }
        catch (err) {
            const msg = err instanceof Error
                ? err.message.includes('[object') ? 'Error de validación. Verificá los campos ingresados.' : err.message
                : 'Error desconocido';
            setError(msg);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-100 px-4", children: _jsxs("div", { className: "bg-white p-8 rounded-lg shadow-md w-full max-w-md", children: [_jsx("h1", { className: "text-2xl font-semibold mb-6 text-center text-gray-800", children: "Registro" }), _jsx("input", { className: "w-full p-2 mb-2 border rounded", placeholder: "Nombre", name: "name", value: form.name, onChange: handleChange }), _jsx("input", { className: "w-full p-2 mb-2 border rounded", placeholder: "Email", name: "email", value: form.email, onChange: handleChange }), _jsx("input", { className: "w-full p-2 mb-4 border rounded", placeholder: "Password", type: "password", name: "password", value: form.password, onChange: handleChange }), _jsxs("div", { className: "flex justify-between gap-4", children: [_jsx("button", { className: "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded", onClick: () => navigate('/'), children: "Volver" }), _jsx("button", { className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50", onClick: register, disabled: !form.name || !form.email || !form.password, children: "Registrarse" })] }), error && _jsx("p", { className: "text-red-600 mt-4 text-center", children: error }), user && _jsxs("p", { className: "text-green-600 mt-2 text-sm text-center", children: ["Registrado como: ", user.email] })] }) }));
}
