import React, { createContext, useContext, useState, useCallback } from "react";
import {
  cancelAppointmentRequest,
  createAppointment,
  getMyAppointments,
  rescheduleAppointment,
  updateAppointmentStatus,
} from "./services/appointmentService";

const AppointmentContext = createContext(null);

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyAppointments();
      setAppointments(data);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load appointments.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bookAppointment = useCallback(async (payload) => {
    const newAppointment = await createAppointment(payload);
    setAppointments((prev) => [newAppointment, ...prev]);
    return newAppointment;
  }, []);

  const changeAppointment = useCallback(async (id, payload) => {
    const updated = payload?.newDateTime
      ? await rescheduleAppointment(id, payload)
      : await updateAppointmentStatus(id, payload);

    setAppointments((prev) =>
      prev.map((appointment) => (appointment.id === id ? updated : appointment)),
    );
    return updated;
  }, []);

  const markAsPaid = useCallback((id) => {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === Number(id) || appointment.id === id
          ? { ...appointment, paid: true }
          : appointment,
      ),
    );
  }, []);

  const cancelAppointment = useCallback(async (id) => {
    const updated = await cancelAppointmentRequest(id);
    setAppointments((prev) =>
      prev.map((appointment) => (appointment.id === id ? updated : appointment)),
    );
    return updated;
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

export const useAppointment = () => {
  const ctx = useContext(AppointmentContext);
  if (!ctx) {
    throw new Error("useAppointment must be used within AppointmentProvider");
  }
  return ctx;
};

export default AppointmentContext;
