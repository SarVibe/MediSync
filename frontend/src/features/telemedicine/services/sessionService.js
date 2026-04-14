import { telemedicineApi } from "../../../app/apiClients";
 
const SESSION_BASE_PATH = "/video-sessions";
 
function normalizeSession(session) {
  if (!session) {
    return null;
  }
 
  return {
    ...session,
    status: String(session.status || "").toUpperCase(),
    scheduledTime: session.scheduledTime || null,
    startedAt: session.startedAt || null,
    endedAt: session.endedAt || null,
    createdAt: session.createdAt || null,
  };
}
 
export function createVideoSession(appointmentId) {
  return telemedicineApi
    .post(`${SESSION_BASE_PATH}/create`, { appointmentId })
    .then((response) => normalizeSession(response.data));
}
 
export function getVideoSession(appointmentId) {
  return telemedicineApi
    .get(`${SESSION_BASE_PATH}/${appointmentId}`)
    .then((response) => normalizeSession(response.data));
}
 
export function joinVideoSession(appointmentId) {
  return telemedicineApi
    .post(`${SESSION_BASE_PATH}/join`, { appointmentId })
    .then((response) => ({
      ...response.data,
      session: normalizeSession(response.data?.session),
    }));
}
 
export function endVideoSession(appointmentId, finalStatus = "COMPLETED") {
  return telemedicineApi
    .post(`${SESSION_BASE_PATH}/end`, { appointmentId, finalStatus })
    .then((response) => normalizeSession(response.data));
}
 
 