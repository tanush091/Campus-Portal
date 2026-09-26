import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "./login.jsx";
import Register from "./register.jsx";
import Dashboard from "./dashboard.jsx";
import Employee from "./Employee.jsx";

// Pages that need a logged-in user bounce to /login without a token.
function RequireAuth({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/home" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/employee" element={<RequireAuth><Employee /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
