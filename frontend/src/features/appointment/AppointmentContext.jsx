import React, { createContext, useContext, useState, useCallback } from "react";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "./services/appointmentService";

/**
 * AppointmentContext – global state for the appointment module.
 *
 * Provides:
 *  appointments      – array of loaded appointments
 *  selectedDoctor    – currently selected doctor object
 *  selectedTimeSlot  – currently selected time-slot object
 *  loading           – boolean
 *  error             – string | null
 *
 *  setSelectedDoctor    – setter
 *  setSelectedTimeSlot  – setter
 *  fetchAppointments    – (params?) => Promise
 *  bookAppointment      – (payload) => Promise
 *  changeAppointment    – (id, payload) => Promise
 *  cancelAppointment    – (id) => Promise
 */

const AppointmentContext = createContext(null);

const MOCK_APPOINTMENTS = [
  { id: 101, doctorId: 1, doctorName: "Arjun Sharma", date: "2026-04-02", time: "10:00 AM", reason: "Chest pain checkup",  status: "ACCEPTED", paid: false },
  { id: 102, doctorId: 2, doctorName: "Priya Nair",   date: "2026-03-20", time: "02:30 PM", reason: "Skin rash",           status: "COMPLETED", paid: true  },
];

export const AppointmentProvider = ({ children }) => {
  const [appointments,     setAppointments]     = useState(MOCK_APPOINTMENTS);
  const [selectedDoctor,   setSelectedDoctor]   = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────

  /** Load appointments from the API and store them in state. */
  const fetchAppointments = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAppointments(params);
      const appts = Array.isArray(data) ? data : data.appointments ?? [];
      if (appts.length > 0) setAppointments(appts);
    } catch (err) {
      // In dummy mode, we keep the existing local appointments
      console.warn("API failed, using local mock appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Book ───────────────────────────────────────────────────────────────

  /** Book a new appointment and prepend it to state. */
  const bookAppointment = useCallback(async (payload) => {
    try {
      const newAppt = await createAppointment(payload);
      setAppointments((prev) => [{ ...newAppt, paid: false }, ...prev]);
      return newAppt;
    } catch (err) {
      // Dummy fallback
      const dummyAppt = { 
        id: Date.now(), 
        ...payload, 
        doctorName: payload.doctorName || "Dr. Arjun Sharma", 
        paid: false 
      };
      setAppointments((prev) => [dummyAppt, ...prev]);
      return dummyAppt;
    }
  }, []);

  // ── Update ─────────────────────────────────────────────────────────────

  /** Update an appointment (status, reschedule, etc.) and refresh state. */
  const changeAppointment = useCallback(async (id, payload) => {
    try {
      const updated = await updateAppointment(id, payload);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
      );
      return updated;
    } catch (err) {
      // Dummy fallback
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...payload } : a))
      );
      return { id, ...payload };
    }
  }, []);

  // ── Payment ────────────────────────────────────────────────────────────
  const markAsPaid = useCallback((id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === Number(id) || a.id === id ? { ...a, paid: true, status: "ACCEPTED" } : a))
    );
  }, []);

  // ── Cancel ─────────────────────────────────────────────────────────────

  /** Cancel (delete) an appointment and remove from state. */
  const cancelAppointment = useCallback(async (id) => {
    try {
      await deleteAppointment(id);
    } catch (err) { /* ignore */ }
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = {
    appointments,
    selectedDoctor,
    selectedTimeSlot,
    loading,
    error,
    setSelectedDoctor,
    setSelectedTimeSlot,
    fetchAppointments,
    bookAppointment,
    changeAppointment,
    markAsPaid,
    cancelAppointment,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

/** Hook for consuming appointment context inside any page/component. */
export const useAppointment = () => {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error("useAppointment must be used within AppointmentProvider");
  return ctx;
};

export default AppointmentContext;
