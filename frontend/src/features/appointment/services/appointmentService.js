import axios from "./appointmentApi";

function normalizeAppointment(appointment) {
  if (!appointment) {
    return appointment;
  }

  const scheduledAt = appointment.scheduledAt || null;
  const date = appointment.date || (scheduledAt ? scheduledAt.slice(0, 10) : "");
  const time =
    appointment.time ||
    (scheduledAt ? scheduledAt.slice(11, 16) : "");

  return {
    ...appointment,
    date,
    time: String(time || "").slice(0, 5),
  };
}

export const getMyAppointments = () =>
  axios.get("/appointments/me").then((r) =>
    Array.isArray(r.data) ? r.data.map(normalizeAppointment) : [],
  );

export const createAppointment = (payload) =>
  axios.post("/appointments", payload).then((r) => normalizeAppointment(r.data));

export const rescheduleAppointment = (id, payload) =>
  axios
    .put(`/appointments/${id}/reschedule`, payload)
    .then((r) => normalizeAppointment(r.data));

export const updateAppointmentStatus = (id, payload) =>
  axios
    .put(`/appointments/${id}/status`, payload)
    .then((r) => normalizeAppointment(r.data));

export const cancelAppointmentRequest = (id) =>
  axios
    .put(`/appointments/${id}/cancel`)
    .then((r) => normalizeAppointment(r.data));
