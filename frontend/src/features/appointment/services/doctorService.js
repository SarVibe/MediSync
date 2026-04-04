import axios from "../../../app/axios";

/**
 * doctorService – wraps all doctor-related API calls.
 */

/** GET all doctors (optionally filtered) */
export const getDoctors = (params = {}) =>
  axios.get("/doctors", { params }).then((r) => r.data);

/** GET a specific doctor */
export const getDoctorById = (id) =>
  axios.get(`/doctors/${id}`).then((r) => r.data);

/** GET a doctor's availability slots */
export const getDoctorAvailability = (doctorId, params = {}) =>
  axios.get(`/doctors/${doctorId}/availability`, { params }).then((r) => r.data);

/** POST – add a new availability slot (doctor use) */
export const addAvailabilitySlot = (payload) =>
  axios.post("/doctors/availability", payload).then((r) => r.data);

/** PUT – toggle or update an availability slot */
export const updateAvailabilitySlot = (slotId, payload) =>
  axios.put(`/doctors/availability/${slotId}`, payload).then((r) => r.data);

/** DELETE – remove an availability slot */
export const deleteAvailabilitySlot = (slotId) =>
  axios.delete(`/doctors/availability/${slotId}`).then((r) => r.data);
