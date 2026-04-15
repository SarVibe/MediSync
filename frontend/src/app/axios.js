import axios from "axios";
import { getAccessToken } from "./sessionStore";

/**
 * Axios instance pre-configured with the API Gateway base URL.
 * All feature services should import from this file.
 */
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ── Request interceptor – attach JWT token if available ───────────────────
instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor – handle 401 globally ────────────────────────────
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login when session token is not valid.
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);

export default instance;
