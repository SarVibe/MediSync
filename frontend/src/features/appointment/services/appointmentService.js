import axios from "../../../app/axios";

/**
 * appointmentService – wraps all appointment-related API calls.
 */

/** GET all appointments (optionally filtered by query params) */
export const getAppointments = (params = {}) =>
  axios.get("/appointments", { params }).then((r) => r.data);

/** GET a single appointment */
export const getAppointmentById = (id) =>
  axios.get(`/appointments/${id}`).then((r) => r.data);

/** POST – book a new appointment */
export const createAppointment = (payload) =>
  axios.post("/appointments", payload).then((r) => r.data);

/** PUT – update an appointment (status, time, etc.) */
export const updateAppointment = (id, payload) =>
  axios.put(`/appointments/${id}`, payload).then((r) => r.data);

/** DELETE – cancel an appointment */
export const deleteAppointment = (id) =>
  axios.delete(`/appointments/${id}`).then((r) => r.data);
