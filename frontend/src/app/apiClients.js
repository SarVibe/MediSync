import axios from "axios";
import {
  clearSessionStore,
  getAccessToken,
  setAccessToken,
  setCurrentUser,
} from "./sessionStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";
const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_SERVICE_URL || API_BASE_URL;
const PROFILE_BASE_URL =
  import.meta.env.VITE_PROFILE_SERVICE_URL || API_BASE_URL;
const APPOINTMENT_BASE_URL =
  import.meta.env.VITE_APPOINTMENT_API_BASE_URL || `${API_BASE_URL}/api`;

const publicAuthPaths = new Set([
  "/auth/authenticate",
  "/auth/login",
  "/auth/verify-otp",
  "/auth/admin/verify-2fa",
  "/auth/admin/forgot-password",
  "/auth/admin/reset-password",
  "/auth/refresh",
]);

let refreshRequest = null;

function appendAuthHeader(config) {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

async function performRefresh() {
  const response = await axios.post(
    `${AUTH_BASE_URL}/auth/refresh`,
    {},
    {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    },
  );

  const payload = response?.data?.data;
  const nextToken = payload?.accessToken || payload?.token;
  // Some backends may return a dedicated `user` object; others may flatten user fields.
  const nextUser = payload?.user || (payload?.role ? { ...payload } : null);

  if (!nextToken) {
    throw new Error("Refresh did not return an access token.");
  }

  setAccessToken(nextToken);
  if (nextUser) {
    setCurrentUser(nextUser);
  }

  return nextToken;
}

function shouldTryRefresh(error) {
  const status = error?.response?.status;
  const original = error?.config;
  if (status !== 401 || !original || original._retry) {
    return false;
  }

  if (original.skipAuthRefresh) {
    return false;
  }

  const url = original.url || "";
  const relativePath = url.startsWith("http") ? new URL(url).pathname : url;

  return !publicAuthPaths.has(relativePath);
}

function attachInterceptors(instance) {
  instance.interceptors.request.use(
    (config) => appendAuthHeader(config),
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!shouldTryRefresh(error)) {
        return Promise.reject(error);
      }

      const original = error.config;
      original._retry = true;

      try {
        if (!refreshRequest) {
          refreshRequest = performRefresh().finally(() => {
            refreshRequest = null;
          });
        }

        const nextToken = await refreshRequest;
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${nextToken}`;

        return instance(original);
      } catch (refreshError) {
        clearSessionStore();
        return Promise.reject(refreshError);
      }
    },
  );
}

export const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export const profileApi = axios.create({
  baseURL: PROFILE_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export const appointmentApi = axios.create({
  baseURL: APPOINTMENT_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

attachInterceptors(authApi);
attachInterceptors(profileApi);
attachInterceptors(appointmentApi);
