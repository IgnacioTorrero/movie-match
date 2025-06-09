import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
export default function Home() {
    const navigate = useNavigate();
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-100 px-4", children: _jsxs("div", { className: "bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center", children: [_jsx("h1", { className: "text-3xl font-semibold mb-6 text-gray-800", children: "Movie Match" }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsx("button", { className: "bg-green-600 hover:bg-green-700 text-white py-2 rounded transition", onClick: () => navigate('/login'), children: "Iniciar Sesi\u00F3n" }), _jsx("button", { className: "bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition", onClick: () => navigate('/register'), children: "Registrarse" })] })] }) }));
}
