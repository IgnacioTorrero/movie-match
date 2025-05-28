import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
export default function Home() {
    const navigate = useNavigate();
    return (_jsx("div", { className: "h-screen w-screen flex items-center justify-center bg-gray-100", children: _jsxs("div", { className: "bg-white p-8 rounded shadow-md w-full max-w-md text-center", children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: "Movie Match API" }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsx("button", { className: "bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded", onClick: () => navigate('/login'), children: "Iniciar Sesi\u00F3n" }), _jsx("button", { className: "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded", onClick: () => navigate('/register'), children: "Registrarse" })] })] }) }));
}
