import axios from "../../../app/axios";

/**
 * recordService – handles all medical records and prescriptions API calls.
 */

// ── Medical Records ────────────────────────────────────────────────────────

/** GET all medical records (optionally filtered) */
export const getMedicalRecords = (params = {}) =>
  axios.get("/medical-records", { params }).then((r) => r.data);

/** POST – upload a new medical record */
export const createMedicalRecord = (payload) =>
  axios.post("/medical-records", payload).then((r) => r.data);

/** DELETE – remove a medical record */
export const deleteMedicalRecord = (id) =>
  axios.delete(`/medical-records/${id}`).then((r) => r.data);


// ── Prescriptions ──────────────────────────────────────────────────────────

/** GET all prescriptions (optionally filtered) */
export const getPrescriptions = (params = {}) =>
  axios.get("/prescriptions", { params }).then((r) => r.data);

/** GET a specific prescription detail */
export const getPrescriptionById = (id) =>
  axios.get(`/prescriptions/${id}`).then((r) => r.data);

/** POST – issue a new prescription */
export const issuePrescription = (payload) =>
  axios.post("/prescriptions", payload).then((r) => r.data);

/** DELETE – remove a prescription (admin only) */
export const deletePrescription = (id) =>
  axios.delete(`/prescriptions/${id}`).then((r) => r.data);
