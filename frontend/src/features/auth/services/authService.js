import axios from "../../../app/axios";

/**
 * authService – handles all authentication API calls.
 * All functions return the `data` portion of the Axios response.
 * Errors are re-thrown so calling components can handle them.
 */

/**
 * Login a user.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, role: string, user: object }>}
 */
export const loginUser = async (credentials) => {
  const response = await axios.post("/auth/login", credentials);
  return response.data;
};

/**
 * Register a new user.
 * @param {object} payload – form data (role-specific fields included)
 * @returns {Promise<{ message: string }>}
 */
export const registerUser = async (payload) => {
  const response = await axios.post("/auth/register", payload);
  return response.data;
};

/**
 * Request a password-reset link for the given email.
 * @param {{ email: string }} payload
 * @returns {Promise<{ message: string }>}
 */
export const forgotPassword = async (payload) => {
  const response = await axios.post("/auth/forgot-password", payload);
  return response.data;
};
