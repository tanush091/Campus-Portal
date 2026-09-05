import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [isManualRole, setIsManualRole] = useState(false);
  const [user, setUser] = useState({
    name: "",
    role: "Student",
    email: "",
    password: ""
  });

  function handleChange(e) {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  }

  async function register(e) {
    e.preventDefault();
    try {
      const payload = {
        name: user.name.trim(),
        role: user.role.trim(),
        email: user.email.trim(),
        password: user.password.trim()
      };

      if (!payload.role) {
        alert("Please select or enter a role.");
        return;
      }

      if (payload.password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
      }

      await axios.post("http://localhost:8080/employee", payload);
      alert("Registration successful!");
      navigate("/");
    } catch (err) {
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (typeof errorData === "object") {
          const messages = Object.entries(errorData)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join("\n");
          alert("Registration Failed:\n" + messages);
        } else {
          alert("Registration Failed: " + errorData);
        }
      } else {
        alert("Registration Failed: Could not connect to backend server.");
      }
    }
  }

  return (
    <div>
      <h2>Register Page</h2>

      <form onSubmit={register}>
        <label>Role:</label>
        <select
          value={isManualRole ? "Other" : user.role}
          onChange={(e) => {
            if (e.target.value === "Other") {
              setIsManualRole(true);
              setUser({ ...user, role: "" });
            } else {
              setIsManualRole(false);
              setUser({ ...user, role: e.target.value });
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
            name="role"
            placeholder="Enter role manually (e.g. Admin, Staff, HOD)"
            value={user.role}
            onChange={handleChange}
            required
            style={{ marginTop: "4px" }}
          />
        )}

        <label>Name:</label>
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={user.name}
          onChange={handleChange}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={user.email}
          onChange={handleChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password (min 8 chars)"
          value={user.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Register as {user.role}</button>
      </form>

      <p>
        <Link to="/">Already have an account? Login here</Link>
      </p>
    </div>
  );
}

export default Register;