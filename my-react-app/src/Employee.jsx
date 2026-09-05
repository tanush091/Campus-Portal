import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Employee() {
  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [isManualRole, setIsManualRole] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    role: "Student",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const getEmployees = () => {
    axios
      .get("http://localhost:8080/employee")
      .then((response) => {
        setEmployees(response.data);
      })
      .catch((err) => console.error("Error fetching employees:", err));
  };

  useEffect(() => {
    getEmployees();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newerrors = {};
    if (!formData.name) newerrors.name = "Name is required";
    if (!formData.role) newerrors.role = "Role is required";
    if (!formData.email) newerrors.email = "Email is required";
    if (!formData.password) newerrors.password = "Password is required";

    if (Object.keys(newerrors).length > 0) {
      setErrors(newerrors);
      return;
    }

    if (formData.id === "") {
      axios
        .post("http://localhost:8080/employee", formData)
        .then(() => {
          getEmployees();
          setIsManualRole(false);
          setFormData({
            id: "",
            name: "",
            role: "Student",
            email: "",
            password: ""
          });
          setErrors({});
          alert("Registered successfully!");
        })
        .catch((err) => alert("Error creating employee."));
    } else {
      axios
        .put(`http://localhost:8080/employee/${formData.id}`, formData)
        .then(() => {
          getEmployees();
          setIsManualRole(false);
          setFormData({
            id: "",
            name: "",
            role: "Student",
            email: "",
            password: ""
          });
          setErrors({});
          alert("Updated successfully!");
        })
        .catch((err) => alert("Error updating employee."));
    }
  };

  const editHandle = (employee) => {
    const hasCustomRole = employee.role && employee.role !== "Student" && employee.role !== "Faculty";
    setIsManualRole(hasCustomRole);
    setFormData({
      id: employee.id || "",
      name: employee.name || "",
      role: employee.role || "Student",
      email: employee.email || "",
      password: employee.password || ""
    });
  };

  const deleteHandle = (id) => {
    if (!id || !window.confirm("Are you sure?")) return;
    axios
      .delete(`http://localhost:8080/employee/${id}`)
      .then(() => {
        getEmployees();
        alert("Deleted successfully!");
      })
      .catch((err) => alert("Error deleting record."));
  };

  return (
    <div>
      <h2>Employee / Campus Form</h2>
      <p>
        <Link to="/dashboard">Go to Dashboard</Link>
      </p>

      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Enter name"
          onChange={handleChange}
        />
        {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}

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
            onChange={handleChange}
            style={{ marginTop: "4px" }}
          />
        )}
        {errors.role && <p style={{ color: "red" }}>{errors.role}</p>}

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Enter email"
          onChange={handleChange}
        />
        {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          placeholder="Enter password"
          onChange={handleChange}
        />
        {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}

        <button type="submit">{formData.id ? "Update" : "Register"}</button>
      </form>

      <table border="1">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Role</th>
            <th>Email</th>
            <th>Password</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.name}</td>
              <td>{employee.role}</td>
              <td>{employee.email}</td>
              <td>{employee.password}</td>
              <td>
                <button type="button" onClick={() => editHandle(employee)}>
                  Edit
                </button>
                <button type="button" onClick={() => deleteHandle(employee.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Employee;