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

  const fetchRecords = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await svc.getMedicalRecords(params);
      setRecords(Array.isArray(data) ? data : data.records ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load medical records.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPrescriptions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await svc.getPrescriptions(params);
      setPrescriptions(Array.isArray(data) ? data : data.prescriptions ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load prescriptions.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────

  const uploadRecord = async (payload) => {
    const fresh = await svc.createMedicalRecord(payload);
    setRecords((prev) => [fresh, ...prev]);
    return fresh;
  };

  const removeRecord = async (id) => {
    await svc.deleteMedicalRecord(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const createPrescription = async (payload) => {
    const fresh = await svc.issuePrescription(payload);
    setPrescriptions((prev) => [fresh, ...prev]);
    return fresh;
  };

  const removePrescription = async (id) => {
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
