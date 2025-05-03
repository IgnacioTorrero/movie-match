import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import CreateMovie from "./pages/CreateMovie";
import EditMovie from "./pages/EditMovie";
import MovieDetails from "./pages/MovieDetails";
import Navbar from "./components/Navbar";
import { getToken } from "./auth";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  return getToken() ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<PrivateRoute><CreateMovie /></PrivateRoute>} />
          <Route path="/movies/:id" element={<PrivateRoute><MovieDetails /></PrivateRoute>} />
          <Route path="/movies/edit/:id" element={<PrivateRoute><EditMovie /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
