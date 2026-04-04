<<<<<<< HEAD
import { authApi } from "../../../app/apiClients";
import { mapApiResponse } from "../../../utils/api";

function unwrap(response) {
  return mapApiResponse(response);
}

export async function authenticateWithPhone(phone) {
  const response = await authApi.post(
    "/auth/authenticate",
    { phone },
    { skipAuthRefresh: true },
  );
  return unwrap(response);
}

export async function verifyPhoneOtp(phone, otp) {
  const response = await authApi.post(
    "/auth/verify-otp",
    { phone, otp },
    { skipAuthRefresh: true },
  );
  return unwrap(response);
}

export async function adminLogin(email, password) {
  const response = await authApi.post(
    "/auth/login",
    { email, password },
    { skipAuthRefresh: true },
  );
  return unwrap(response);
}

export async function adminVerify2FA(challengeToken, otp) {
  const response = await authApi.post(
    "/auth/admin/verify-2fa",
    { challengeToken, otp },
    { skipAuthRefresh: true },
  );
  return unwrap(response);
}

export async function forgotAdminPassword(email) {
  const response = await authApi.post(
    "/auth/admin/forgot-password",
    { email },
    { skipAuthRefresh: true },
  );
  return unwrap(response);
}

export async function resetAdminPassword(payload) {
  const response = await authApi.post("/auth/admin/reset-password", payload, {
    skipAuthRefresh: true,
  });
  return unwrap(response);
}

export async function changeAdminPassword(payload) {
  const response = await authApi.post("/auth/admin/change-password", payload);
  return unwrap(response);
}

export async function refreshSession() {
  const response = await authApi.post(
    "/auth/refresh",
    {},
    { skipAuthRefresh: true },
  );
  return unwrap(response);
}

export async function logoutSession() {
  const response = await authApi.post("/auth/logout");
  return unwrap(response);
}

export async function createUserByAdmin(payload) {
  const response = await authApi.post("/auth/admin/create-user", payload);
  return unwrap(response);
}

export async function blockUserByAdmin(userId) {
  const response = await authApi.post(`/auth/admin/block/${userId}`, {});
  return unwrap(response);
}

export async function unblockUserByAdmin(userId) {
  const response = await authApi.post(`/auth/admin/unblock/${userId}`);
  return unwrap(response);
}

export async function approveDoctorByAdmin(userId) {
  const response = await authApi.post(`/auth/admin/approve-doctor/${userId}`);
  return unwrap(response);
}

export async function rejectDoctorByAdmin(userId, reason) {
  const response = await authApi.post(`/auth/admin/reject-doctor/${userId}`, {
    reason,
  });
  return unwrap(response);
}
=======
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
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
