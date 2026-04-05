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
