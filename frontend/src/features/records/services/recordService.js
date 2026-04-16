import { authApi } from "../../../app/apiClients";

/**
 * recordService – handles all medical records and prescriptions API calls.
 * 
 * Backend Endpoints:
 * Medical Records:
 *   - GET    /medical-records/{patientId}
 *   - POST   /medical-records/{patientId} (multipart)
 *   - DELETE /medical-records/{medicalRecordId}
 * 
 * Prescriptions:
 *   - GET    /prescriptions/{patientId}
 *   - POST   /prescriptions/{doctorId} (multipart)
 *   - DELETE /prescriptions/{prescriptionId}
 */

// ── Medical Records ────────────────────────────────────────────────────────

/**
 * GET medical records for a specific patient
 * @param {number} patientId - Patient ID
 * @returns {Promise<Array>} Array of medical records
 */
export const getMedicalRecords = (patientId) => {
  if (!patientId) throw new Error("patientId is required");
  return authApi.get(`/api/medical-records/${patientId}`).then((r) => r.data);
};

/**
 * Upload a new medical record (FormData with file)
 * @param {number} patientId - Patient ID
 * @param {FormData} formData - FormData containing: medicalDocument (file), recordType, description
 * @returns {Promise<Object>} Created record DTO
 */
export const createMedicalRecord = (patientId, formData) => {
  if (!patientId) throw new Error("patientId is required");
  if (!formData) throw new Error("formData is required");
  
  return authApi.post(`/api/medical-records/${patientId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

/**
 * Delete a medical record
 * @param {number} medicalRecordId - Medical record ID
 * @returns {Promise<string>} Success message
 */
export const deleteMedicalRecord = (medicalRecordId) => {
  if (!medicalRecordId) throw new Error("medicalRecordId is required");
  return authApi.delete(`/api/medical-records/${medicalRecordId}`).then((r) => r.data);
};


// ── Prescriptions ──────────────────────────────────────────────────────────

/**
 * GET prescriptions for a patient
 * @param {number} patientId - Patient ID
 * @returns {Promise<Array>} Array of prescriptions
 */
export const getPrescriptions = (patientId) => {
  if (!patientId) throw new Error("patientId is required");
  return authApi.get(`/api/prescriptions/${patientId}`).then((r) => r.data);
};

export const getDoctorPrescriptions = (doctorId) => {
  if (!doctorId) throw new Error("doctorId is required");
  return authApi.get(`/api/prescriptions/doctor/${doctorId}`).then((r) => r.data);
};

export const getAllPrescriptions = () => {
  return authApi.get(`/api/prescriptions/all`).then((r) => r.data);
};

/**
 * Create a new prescription (FormData with image file)
 * @param {number} doctorId - Doctor ID
 * @param {FormData} formData - FormData containing: patientId, appointmentId, image (file), validUntil (optional)
 * @returns {Promise<Object>} Created prescription DTO
 */
export const issuePrescription = (doctorId, formData) => {
  if (!doctorId) throw new Error("doctorId is required");
  if (!formData) throw new Error("formData is required");
  
  return authApi.post(`/api/prescriptions/${doctorId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

/**
 * Delete a prescription
 * @param {number} prescriptionId - Prescription ID
 * @returns {Promise<string>} Success message
 */
export const deletePrescription = (prescriptionId) => {
  if (!prescriptionId) throw new Error("prescriptionId is required");
  return authApi.delete(`/api/prescriptions/${prescriptionId}`).then((r) => r.data);
};
