import axios from "axios";

// In dev, this points at your local backend. Before deploying, change this
// to your live Render backend URL (or better, read from an env variable —
// see the README deployment section).
const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the JWT (if we have one) to every outgoing request automatically,
// so individual components never have to think about auth headers.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("smms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, the backend returns 401 — log the user
// out cleanly instead of leaving them stuck on a broken page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("smms_token");
      localStorage.removeItem("smms_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
