import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080" });

// Attach the JWT saved at login to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token missing/expired on a protected call -> back to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.endsWith("/employee/login");
    if (error.response?.status === 401 && !isLogin) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Turn a backend error response into a readable message.
export function errorMessage(err) {
  const data = err.response?.data;
  if (!err.response) {
    return "Could not reach the backend at http://localhost:8080. Is it running?";
  }
  if (typeof data === "string" && data) return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (data && typeof data === "object") {
    // Validation errors come back as { field: message }.
    return Object.entries(data).map(([field, msg]) => `${field}: ${msg}`).join("\n");
  }
  return `Request failed (${err.response.status})`;
}
