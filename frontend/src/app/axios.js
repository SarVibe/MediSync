import axios from "axios";
<<<<<<< HEAD
import { getAccessToken } from "./sessionStore";
=======
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6

/**
 * Axios instance pre-configured with the API Gateway base URL.
 * All feature services should import from this file.
 */
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ── Request interceptor – attach JWT token if available ───────────────────
instance.interceptors.request.use(
  (config) => {
<<<<<<< HEAD
    const token = getAccessToken();
=======
    const token = localStorage.getItem("token");
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
<<<<<<< HEAD
  (error) => Promise.reject(error),
=======
  (error) => Promise.reject(error)
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
);

// ── Response interceptor – handle 401 globally ────────────────────────────
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
<<<<<<< HEAD
      // Redirect to login when session token is not valid.
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
=======
      // Clear stale credentials and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
);

export default instance;
