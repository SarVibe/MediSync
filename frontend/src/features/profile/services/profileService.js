import { profileApi } from "../../../app/apiClients";
import { mapApiResponse } from "../../../utils/api";

function unwrap(response) {
  return mapApiResponse(response);
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
  return unwrap(response);
}

export async function getMyDoctorApplication() {
  const response = await profileApi.get("/api/profiles/doctor/application");
  return unwrap(response);
}

export async function updateMyDoctorApplication(payload) {
  const response = await profileApi.put(
    "/api/profiles/doctor/application",
    payload,
  );
  return unwrap(response);
}

export async function getMyDoctorProfile() {
  const response = await profileApi.get("/api/profiles/doctor/me");
  return unwrap(response);
}

export async function updateMyDoctorProfile(payload) {
  const response = await profileApi.put("/api/profiles/doctor/me", payload);
  return unwrap(response);
}

export async function getPendingDoctorRequests() {
  const response = await profileApi.get("/api/profiles/doctor/pending");
  return unwrap(response);
}
