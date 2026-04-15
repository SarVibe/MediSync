import { profileApi } from "../../../app/apiClients";
import { mapApiResponse } from "../../../utils/api";

function unwrap(response) {
  return mapApiResponse(response);
}

function normalizeProfileAssetUrl(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";

  if (
    rawValue.startsWith("blob:") ||
    rawValue.startsWith("data:") ||
    rawValue.startsWith("http://") ||
    rawValue.startsWith("https://")
  ) {
    return rawValue;
  }

  const baseUrl = String(profileApi.defaults.baseURL || "").trim();
  if (!baseUrl) {
    return rawValue;
  }

  const normalizedPath = rawValue.startsWith("/") ? rawValue : `/${rawValue}`;

  try {
    return new URL(normalizedPath, baseUrl).toString();
  } catch {
    return rawValue;
  }
}

function normalizeDoctorRecord(record) {
  if (!record || typeof record !== "object") {
    return record;
  }

  const profilePictureUrl = normalizeProfileAssetUrl(
    record.profilePictureUrl || record.profileImageUrl,
  );

  return {
    ...record,
    profileImageUrl: profilePictureUrl,
    profilePictureUrl,
  };
}

function normalizeDoctorResponse(response) {
  const unwrapped = unwrap(response);
  const { data } = unwrapped;

  return {
    ...unwrapped,
    data: Array.isArray(data)
      ? data.map((item) => normalizeDoctorRecord(item))
      : normalizeDoctorRecord(data),
  };
}

export async function initProfile(payload) {
  const response = await profileApi.post("/api/profiles/init", payload, {
    skipAuthRefresh: true,
  });
  return unwrap(response);
}

export async function uploadProfilePicture(profilePic) {
  const formData = new FormData();
  formData.append("profileImage", profilePic);

  const response = await profileApi.post(
    "/api/profiles/profile-picture",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return unwrap(response)?.data || "";
}

export async function getMyPatientProfile() {
  const response = await profileApi.get("/api/profiles/patient/me");
  return unwrap(response);
}

export async function upsertMyPatientProfile(payload) {
  const response = await profileApi.put("/api/profiles/patient/me", payload);
  return unwrap(response);
}

export async function deleteMyPatientProfile() {
  const response = await profileApi.delete("/api/profiles/patient/me");
  return unwrap(response);
}

export async function submitDoctorUpgradeRequest(payload) {
  const response = await profileApi.post(
    "/api/profiles/doctor/upgrade-request",
    payload,
  );
  return normalizeDoctorResponse(response);
}

export async function getMyDoctorApplication() {
  const response = await profileApi.get("/api/profiles/doctor/application");
  return normalizeDoctorResponse(response);
}

export async function updateMyDoctorApplication(payload) {
  const response = await profileApi.put(
    "/api/profiles/doctor/application",
    payload,
  );
  return normalizeDoctorResponse(response);
}

export async function getMyDoctorProfile() {
  const response = await profileApi.get("/api/profiles/doctor/me");
  return normalizeDoctorResponse(response);
}

export async function updateMyDoctorProfile(payload) {
  const response = await profileApi.put("/api/profiles/doctor/me", payload);
  return normalizeDoctorResponse(response);
}

export async function getPendingDoctorRequests() {
  const response = await profileApi.get("/api/profiles/doctor/pending");
  return normalizeDoctorResponse(response);
}

export async function getPatientOptions() {
  const response = await profileApi.get("/api/profiles/patients/options");
  return unwrap(response);
}

export async function getDoctorOptions() {
  const response = await profileApi.get("/api/profiles/doctors/options");
  return unwrap(response);
}

export async function getPatientProfilesBatch(userIds) {
  const response = await profileApi.post(
    "/api/profiles/admin/patients/batch",
    userIds,
  );
  return unwrap(response);
}

export async function getDoctorProfilesBatch(userIds) {
  const response = await profileApi.post(
    "/api/profiles/admin/doctors/batch",
    userIds,
  );
  return normalizeDoctorResponse(response);
}
