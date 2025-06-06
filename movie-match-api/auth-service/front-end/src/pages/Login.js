import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Login() {
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const handleChange = (e) => {
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
            if (!res.ok)
                throw new Error(data.error || 'Error');
            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', data.user.email);
            setUser(data.user);
            setError('');
            window.location.href = `/movies/?token=${data.token}`;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-100 px-4", children: _jsxs("div", { className: "bg-white p-8 rounded-lg shadow-md w-full max-w-md", children: [_jsx("h1", { className: "text-2xl font-semibold mb-6 text-center text-gray-800", children: "Iniciar Sesi\u00F3n" }), _jsx("input", { className: "w-full p-2 mb-3 border rounded", placeholder: "Email", name: "email", value: loginForm.email, onChange: handleChange }), _jsx("input", { className: "w-full p-2 mb-4 border rounded", placeholder: "Password", name: "password", type: "password", value: loginForm.password, onChange: handleChange }), _jsxs("div", { className: "flex justify-between gap-4", children: [_jsx("button", { className: "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded", onClick: () => navigate('/'), children: "Volver" }), _jsx("button", { className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded", onClick: login, children: "Login" })] }), error && _jsx("p", { className: "text-red-600 mt-4 text-center", children: error }), user && _jsxs("p", { className: "text-gray-600 mt-2 text-sm text-center", children: ["Logueado como: ", user.email] })] }) }));
}
