import { useState } from "react";
import api, { errorMessage } from "./api.js";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Student");
  const [isManualRole, setIsManualRole] = useState(false);
  const [loginUser, setLoginUser] = useState({
    email: "",
    password: ""
  });

  function handleChange(e) {
    setLoginUser({
      ...loginUser,
      [e.target.name]: e.target.value
    });
  }

  async function submit(e) {
    e.preventDefault();
    try {
      const payload = {
        email: loginUser.email.trim(),
        password: loginUser.password.trim()
      };
      const response = await api.post("/employee/login", payload);
      
      const { token, ...user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ ...user, role: user.role || role }));
      alert("Login success!");
      navigate("/dashboard");
    } catch (err) {
      alert("Login Failed: " + errorMessage(err));
    }
  }

  return (
    <div>
      <h1>Login Page</h1>

      <form onSubmit={submit}>
        <label>Select Role:</label>
        <select
          value={isManualRole ? "Other" : role}
          onChange={(e) => {
            if (e.target.value === "Other") {
              setIsManualRole(true);
              setRole("");
            } else {
              setIsManualRole(false);
              setRole(e.target.value);
            }
          }}
        >
          <option value="Student">Student</option>
          <option value="Faculty">Faculty</option>
          <option value="Other">Other (Write role manually)</option>
        </select>

        {isManualRole && (
          <input
            type="text"
            placeholder="Enter custom role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            style={{ marginTop: "4px" }}
          />
        )}

        <label>Email:</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={loginUser.email}
          onChange={handleChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={loginUser.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Login as {role}</button>
      </form>

      <p>
        <Link to="/register">New User? Register here</Link>
      </p>
    </div>
  );
}

export default Login;