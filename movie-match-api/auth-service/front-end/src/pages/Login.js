import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Login() {
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [token, setToken] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const handleChange = (e) => {
        setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    };
    const login = async () => {
        try {
            const cleanEmail = loginForm.email.trim().toLowerCase();
            console.log("LOGIN PAYLOAD", {
                email: cleanEmail,
                password: loginForm.password
            });
            const res = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: cleanEmail,
                    password: loginForm.password
                })
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error || 'Error');
            // Almacenamiento de Token para endpoints protegidos
            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', data.user.email);
            setToken(data.token);
            setUser(data.user);
            setError('');
            // Redireccionamiento a pagina principal
            navigate(`/?token=${data.token}`);
        }
        catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
            else {
                setError('Error desconocido');
            }
        }
    };
    return (_jsx("div", { className: "h-screen w-screen flex items-center justify-center bg-gray-100", children: _jsxs("div", { className: "bg-white p-8 rounded shadow-md w-full max-w-md", children: [_jsx("h1", { className: "text-2xl font-bold mb-4 text-center", children: "Iniciar Sesi\u00F3n" }), _jsx("input", { className: "w-full p-2 mb-2 border rounded", placeholder: "Email", name: "email", value: loginForm.email, onChange: handleChange }), _jsx("input", { className: "w-full p-2 mb-4 border rounded", placeholder: "Password", name: "password", type: "password", value: loginForm.password, onChange: handleChange }), _jsxs("div", { className: "flex justify-between", children: [_jsx("button", { className: "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded", onClick: () => navigate('/'), children: "Volver" }), _jsx("button", { className: "bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded", onClick: login, children: "Login" })] }), error && _jsx("p", { className: "text-red-500 mt-4 text-center", children: error }), user && _jsxs("p", { className: "text-gray-700 mt-2 text-sm", children: ["Logged in as: ", user.email] })] }) }));
}
