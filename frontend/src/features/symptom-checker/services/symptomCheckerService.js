import { authApi } from "../../../app/apiClients";
import { mapApiResponse } from "../../../utils/api";

function unwrap(response) {
  const mapped = mapApiResponse(response);

  if (typeof mapped.data !== "undefined") {
    return mapped;
  }

  return {
    ...mapped,
    data: response?.data,
  };
}

export async function analyzeSymptoms(payload) {
  const response = await authApi.post("/api/symptom-checker/analyze", payload);
  return unwrap(response);
}

export async function getSymptomHistory() {
  const response = await authApi.get("/api/symptom-checker/history");
  return unwrap(response);
}

export async function getLatestSymptomHistory() {
  const response = await authApi.get("/api/symptom-checker/history/latest", {
    validateStatus: (status) => status === 200 || status === 204,
  });

  return unwrap(response);
}
