import { useState } from "react";
import axios from "axios";
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
      const response = await axios.post("http://localhost:8080/employee/login", payload);
      
      const userData = response.data;
      const user = typeof userData === "object" ? userData : { email: payload.email, role: role };
      const actualRole = user.role || role;

      localStorage.setItem("user", JSON.stringify({ ...user, role: actualRole }));
      alert("Login success!");
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.data) {
        const msg = err.response.data.message || err.response.data.error || JSON.stringify(err.response.data);
        alert("Login Failed: " + msg);
      } else {
        alert("Login Failed: Could not reach backend server at http://localhost:8080");
      }
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