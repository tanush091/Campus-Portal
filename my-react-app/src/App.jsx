import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "./login.jsx";
import Register from "./register.jsx";
import Dashboard from "./dashboard.jsx";
import Employee from "./Employee.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
