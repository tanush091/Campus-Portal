import { useEffect, useState } from "react";
import api, { errorMessage } from "./api.js";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
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
      const response = await api.get("/employee");
      setUsers(response.data);
    } catch (err) {
      alert("Could not load records: " + errorMessage(err));
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`/employee/${id}`);
      alert("Successfully deleted.");
      if (id === currentUser?.id) {
        logout();
        return;
      }
      getUsers();
    } catch (err) {
      alert("Deletion failed: " + errorMessage(err));
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
      password: ""
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
        const { data: updated } = await api.put(`/employee/${formData.id}`, formData);
        if (updated.id === currentUser?.id) {
          // Keep the header in sync when you edit your own record.
          const me = { ...currentUser, ...updated };
          localStorage.setItem("user", JSON.stringify(me));
          setCurrentUser(me);
        }
        alert("Updated successfully!");
      } else {
        await api.post("/employee", formData);
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
      alert("Operation failed:\n" + errorMessage(err));
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
      </p>

      <button onClick={getUsers}>Refresh Data</button>
      <button onClick={logout} style={{ marginLeft: "6px" }}>Logout</button>
      {isFaculty && (
        <Link to="/employee" style={{ marginLeft: "12px" }}>Manage Employees</Link>
      )}

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
              placeholder={formData.id ? "Leave blank to keep current password" : "Enter password"}
              value={formData.password}
              onChange={handleFormChange}
              required={!formData.id}
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

          <h3>Faculty Members Directory</h3>
          <table border="1">
            <thead>
              <tr>
                <th>ID</th>
                <th>Faculty Name</th>
                <th>Role</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.length === 0 ? (
                <tr>
                  <td colSpan="4">No faculty records found.</td>
                </tr>
              ) : (
                facultyList.map((faculty) => (
                  <tr key={faculty.id}>
                    <td>{faculty.id}</td>
                    <td>{faculty.name}</td>
                    <td>{faculty.role}</td>
                    <td>{faculty.email}</td>
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
