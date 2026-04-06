import React, { createContext, useContext, useState, useCallback } from "react";
import * as svc from "./services/recordService";

/**
 * MedicalContext – manages state for records and prescriptions.
 */

const MedicalContext = createContext(null);

export const MedicalProvider = ({ children }) => {
  const [records,       setRecords]       = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  // ── Fetchers ───────────────────────────────────────────────────────────

  /**
   * Fetch medical records for a patient
   * @param {number} patientId - Patient ID
   */
  const fetchRecords = useCallback(async (patientId) => {
    if (!patientId) {
      setError("Patient ID is required");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await svc.getMedicalRecords(patientId);
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load medical records.");
      console.error("Error fetching records:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch prescriptions for a patient
   * @param {number} patientId - Patient ID
   */
  const fetchPrescriptions = useCallback(async (patientId) => {
    if (!patientId) {
      setError("Patient ID is required");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await svc.getPrescriptions(patientId);
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load prescriptions.");
      console.error("Error fetching prescriptions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDoctorPrescriptions = useCallback(async (doctorId) => {
    if (!doctorId) {
      setError("Doctor ID is required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await svc.getDoctorPrescriptions(doctorId);
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load doctor prescriptions.");
      console.error("Error fetching doctor prescriptions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await svc.getAllPrescriptions();
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load all prescriptions.");
      console.error("Error fetching all prescriptions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────

  /**
   * Upload a new medical record
   * @param {number} patientId - Patient ID
   * @param {FormData} formData - FormData with file and metadata
   */
  const uploadRecord = async (patientId, formData) => {
    if (!patientId || !formData) {
      throw new Error("patientId and formData are required");
    }
    const fresh = await svc.createMedicalRecord(patientId, formData);
    setRecords((prev) => [fresh, ...prev]);
    return fresh;
  };

  const removeRecord = async (id) => {
    if (!id) throw new Error("Record ID is required");
    await svc.deleteMedicalRecord(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  /**
   * Create a new prescription
   * @param {number} doctorId - Doctor ID
   * @param {FormData} formData - FormData with patientId, appointmentId, image, validUntil
   */
  const createPrescription = async (doctorId, formData) => {
    if (!doctorId || !formData) {
      throw new Error("doctorId and formData are required");
    }
    const fresh = await svc.issuePrescription(doctorId, formData);
    setPrescriptions((prev) => [fresh, ...prev]);
    return fresh;
  };

  const removePrescription = async (id) => {
    if (!id) throw new Error("Prescription ID is required");
    await svc.deletePrescription(id);
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const value = {
    records,
    prescriptions,
    loading,
    error,
    fetchRecords,
    fetchPrescriptions,
    fetchDoctorPrescriptions,
    fetchAllPrescriptions,
    uploadRecord,
    removeRecord,
    createPrescription,
    removePrescription,
  };

  return <MedicalContext.Provider value={value}>{children}</MedicalContext.Provider>;
};

export const useMedical = () => {
  const ctx = useContext(MedicalContext);
  if (!ctx) throw new Error("useMedical must be used within MedicalProvider");
  return ctx;
};

export default MedicalContext;
