import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { JSX } from "react";
import Home from "./pages/Home";
import CreateMovie from "./pages/CreateMovie";
import EditMovie from "./pages/EditMovie";
import MovieDetails from "./pages/MovieDetails";
import Navbar from "./components/Navbar";
import { getToken } from "./auth";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  return getToken() ? children : <Navigate to="/auth/" />;
};

function App() {
  return (
    <Router basename="/movies">
      <div className="min-h-screen bg-gray-100 overflow-x-hidden">
        <Navbar />
        <Routes>
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><CreateMovie /></PrivateRoute>} />
          <Route path="/:id" element={<PrivateRoute><MovieDetails /></PrivateRoute>} />
          <Route path="/edit/:id" element={<PrivateRoute><EditMovie /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
