import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showPasswords, setShowPasswords] = useState(true);
  const [isManualRole, setIsManualRole] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    role: "Student",
    email: "",
    password: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch {
        setCurrentUser({ name: "User", role: "Student" });
      }
    } else {
      setCurrentUser({ name: "User", role: "Student" });
    }
    getUsers();
  }, []);

  async function getUsers() {
    try {
      const response = await axios.get("http://localhost:8080/employee");
      setUsers(response.data);
    } catch (err) {
      alert("Something went wrong while fetching data.");
    }
  }

  function logout() {
    localStorage.removeItem("user");
    navigate("/");
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`http://localhost:8080/employee/${id}`);
      alert("Successfully deleted.");
      getUsers();
    } catch (err) {
      alert("Deletion failed.");
    }
  }

  function handleEdit(user) {
    const hasCustomRole = user.role && user.role !== "Student" && user.role !== "Faculty";
    setIsManualRole(hasCustomRole);
    setFormData({
      id: user.id,
      name: user.name || "",
      role: user.role || "Student",
      email: user.email || "",
      password: user.password || ""
    });
  }

  function handleFormChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (formData.id) {
        await axios.put(`http://localhost:8080/employee/${formData.id}`, formData);
        alert("Updated successfully!");
      } else {
        await axios.post("http://localhost:8080/employee", formData);
        alert("Added successfully!");
      }
      setIsManualRole(false);
      setFormData({
        id: "",
        name: "",
        role: "Student",
        email: "",
        password: ""
      });
      getUsers();
    } catch (err) {
      alert("Operation failed. Ensure password is at least 8 characters.");
    }
  }

  const isFaculty = currentUser?.role?.toLowerCase() === "faculty";
  const facultyList = users.filter((u) => u.role?.toLowerCase() === "faculty");

  return (
    <div>
      <h1>Welcome to {isFaculty ? "Faculty Dashboard" : "Student Dashboard"}</h1>
      <p>
        <strong>Logged in user:</strong> {currentUser?.name || currentUser?.email} (
        <strong>Role:</strong> {currentUser?.role || "Student"})
        {currentUser?.password && (
          <span>
            {" "}| <strong>Password:</strong> {showPasswords ? currentUser.password : "••••••••"}
          </span>
        )}
      </p>

      <button onClick={getUsers}>Refresh Data</button>
      <button onClick={() => setShowPasswords(!showPasswords)} style={{ marginLeft: "6px" }}>
        {showPasswords ? "Hide Passwords" : "Show Passwords"}
      </button>
      <button onClick={logout} style={{ marginLeft: "6px" }}>Logout</button>

      <hr style={{ margin: "20px 0" }} />

      {/* Faculty View */}
      {isFaculty ? (
        <div>
          <h3>{formData.id ? "Edit Member" : "Add New Member"}</h3>
          <form onSubmit={handleSubmit}>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={handleFormChange}
              required
            />

            <label>Role:</label>
            <select
              value={isManualRole ? "Other" : (formData.role || "Student")}
              onChange={(e) => {
                if (e.target.value === "Other") {
                  setIsManualRole(true);
                  setFormData({ ...formData, role: "" });
                } else {
                  setIsManualRole(false);
                  setFormData({ ...formData, role: e.target.value });
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
                value={formData.role}
                onChange={handleFormChange}
                required
                style={{ marginTop: "4px" }}
              />
            )}

            <label>Email:</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />

            <label>Password:</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleFormChange}
              required
            />

            <button type="submit">{formData.id ? "Update" : "Save"}</button>
            {formData.id && (
              <button
                type="button"
                onClick={() => {
                  setIsManualRole(false);
                  setFormData({
                    id: "",
                    name: "",
                    role: "Student",
                    email: "",
                    password: ""
                  });
                }}
              >
                Cancel
              </button>
            )}
          </form>

          <h3>All Campus Records ({users.length})</h3>
          <table border="1">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Password</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>{user.email}</td>
                  <td>{showPasswords ? user.password : "••••••••"}</td>
                  <td>
                    <button onClick={() => handleEdit(user)}>Edit</button>
                    <button onClick={() => handleDelete(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Student View */
        <div>
          <h3>My Profile</h3>
          <p><strong>Name:</strong> {currentUser?.name}</p>
          <p><strong>Email:</strong> {currentUser?.email}</p>
          <p><strong>Role:</strong> Student</p>
          <p><strong>Password:</strong> {showPasswords ? (currentUser?.password || "••••••••") : "••••••••"}</p>

          <h3>Faculty Members Directory</h3>
          <table border="1">
            <thead>
              <tr>
                <th>ID</th>
                <th>Faculty Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Password</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.length === 0 ? (
                <tr>
                  <td colSpan="5">No faculty records found.</td>
                </tr>
              ) : (
                facultyList.map((faculty) => (
                  <tr key={faculty.id}>
                    <td>{faculty.id}</td>
                    <td>{faculty.name}</td>
                    <td>{faculty.role}</td>
                    <td>{faculty.email}</td>
                    <td>{showPasswords ? faculty.password : "••••••••"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
