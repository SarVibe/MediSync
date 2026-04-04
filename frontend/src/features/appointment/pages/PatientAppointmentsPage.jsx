import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentCard from "../components/AppointmentCard";
import ConfirmationModal from "../components/ConfirmationModal";
import CalendarView from "../components/CalendarView";
import TimeSlotPicker from "../components/TimeSlotPicker";
import { useAppointment } from "../AppointmentContext";
import { getDoctorAvailability } from "../services/doctorService";

// ── Mock fallback ─────────────────────────────────────────────────────────
const MOCK_APPOINTMENTS = [
  { id: 1, doctorName: "Dr. Arjun Sharma", date: "2026-04-02", time: "10:00 AM", reason: "Chest pain checkup",  status: "BOOKED"    },
  { id: 2, doctorName: "Dr. Priya Nair",   date: "2026-03-20", time: "02:30 PM", reason: "Skin rash",           status: "COMPLETED"  },
  { id: 3, doctorName: "Dr. Ravi Kumar",   date: "2026-03-15", time: "09:00 AM", reason: "Headaches",           status: "CANCELLED"  },
  { id: 4, doctorName: "Dr. Suresh Menon", date: "2026-04-10", time: "11:00 AM", reason: "Knee pain follow-up", status: "PENDING"    },
];

const MOCK_SLOTS = [
  { id:1, time:"09:00 AM", available:true  },
  { id:2, time:"09:30 AM", available:false },
  { id:3, time:"10:00 AM", available:true  },
  { id:4, time:"11:00 AM", available:true  },
  { id:5, time:"02:00 PM", available:false },
  { id:6, time:"03:00 PM", available:true  },
];

const TABS = ["Upcoming", "Completed", "Cancelled"];

const filterByTab = (appts, tab) => {
  const map = {
    Upcoming:  ["BOOKED", "PENDING", "ACCEPTED"],
    Completed: ["COMPLETED"],
    Cancelled: ["CANCELLED"],
  };
  return appts.filter((a) => map[tab]?.includes(a.status?.toUpperCase()));
};

/**
 * PatientAppointmentsPage – /patient/appointments
 */
const PatientAppointmentsPage = () => {
  const navigate = useNavigate();
  const { appointments, fetchAppointments, cancelAppointment, changeAppointment, loading } =
    useAppointment();

  const [activeTab,      setActiveTab]      = useState("Upcoming");
  const [cancelTarget,   setCancelTarget]   = useState(null);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [reschedDate,    setReschedDate]    = useState(null);
  const [reschedSlot,    setReschedSlot]    = useState(null);
  const [reschedSlots,   setReschedSlots]   = useState(MOCK_SLOTS);
  const [actionLoading,  setActionLoading]  = useState(false);
  const [localAppts,     setLocalAppts]     = useState(MOCK_APPOINTMENTS);

  // Attempt real API; fall back to mock
  useEffect(() => {
    fetchAppointments()
      .then(() => {
        if (appointments.length > 0) setLocalAppts(appointments);
      })
      .catch(() => {});
  }, []);                   // eslint-disable-line

  useEffect(() => {
    if (appointments.length > 0) setLocalAppts(appointments);
  }, [appointments]);

  // Load reschedule slots when date picked
  useEffect(() => {
    if (!rescheduleAppt || !reschedDate) return;
    getDoctorAvailability(rescheduleAppt.doctorId, {})
      .then((d) => setReschedSlots(Array.isArray(d) ? d : MOCK_SLOTS))
      .catch(() => setReschedSlots(MOCK_SLOTS));
    setReschedSlot(null);
  }, [reschedDate, rescheduleAppt]);

  // ── Cancel ────────────────────────────────────────────────────────────
  const handleCancelConfirm = async () => {
    setActionLoading(true);
    try {
      await cancelAppointment(cancelTarget.id);
      setLocalAppts((prev) =>
        prev.map((a) => a.id === cancelTarget.id ? { ...a, status: "CANCELLED" } : a)
      );
    } catch {
      setLocalAppts((prev) =>
        prev.map((a) => a.id === cancelTarget.id ? { ...a, status: "CANCELLED" } : a)
      );
    } finally {
      setActionLoading(false);
      setCancelTarget(null);
    }
  };

  // ── Reschedule ────────────────────────────────────────────────────────
  const handleRescheduleConfirm = async () => {
    if (!reschedDate || !reschedSlot) return;
    setActionLoading(true);
    const dateKey = `${reschedDate.getFullYear()}-${String(reschedDate.getMonth()+1).padStart(2,"0")}-${String(reschedDate.getDate()).padStart(2,"0")}`;
    try {
      await changeAppointment(rescheduleAppt.id, { date: dateKey, time: reschedSlot.time });
      setLocalAppts((prev) =>
        prev.map((a) =>
          a.id === rescheduleAppt.id ? { ...a, date: dateKey, time: reschedSlot.time } : a
        )
      );
    } catch {
      setLocalAppts((prev) =>
        prev.map((a) =>
          a.id === rescheduleAppt.id ? { ...a, date: dateKey, time: reschedSlot.time } : a
        )
      );
    } finally {
      setActionLoading(false);
      setRescheduleAppt(null);
      setReschedDate(null);
      setReschedSlot(null);
    }
  };

  const displayed = filterByTab(localAppts, activeTab);

  return (
<<<<<<< HEAD
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Appointments</h1>
            <p className="mt-1 text-sm text-slate-500">Track and manage your appointments.</p>
          </div>
          <button
            onClick={() => navigate("/patient/doctors")}
            className="px-4 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow hover:bg-blue-700"
=======
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Appointments</h1>
            <p className="text-slate-500 text-sm mt-1">Track and manage your appointments.</p>
          </div>
          <button
            onClick={() => navigate("/patient/doctors")}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg
              hover:bg-blue-700 transition-colors shadow"
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
          >
            + Book New
          </button>
        </div>

        {/* Tabs */}
<<<<<<< HEAD
        <div className="flex gap-1 p-1 mb-6 bg-white border shadow-sm border-slate-200 rounded-xl">
=======
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm mb-6">
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150
                ${activeTab === tab
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-500 hover:text-blue-600"}`}
            >
              {tab}
              <span className="ml-1.5 text-xs opacity-75">
                ({filterByTab(localAppts, tab).length})
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
<<<<<<< HEAD
            <div className="w-10 h-10 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin" />
=======
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
          </div>
        ) : displayed.length > 0 ? (
          <div className="flex flex-col gap-4">
            {displayed.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                viewMode="patient"
                actions={[
                  ...(["BOOKED","PENDING","ACCEPTED"].includes(appt.status?.toUpperCase())
                    ? [
                        ...(appt.status === "ACCEPTED" && !appt.paid 
                          ? [{ label: "Pay Now 💸", onClick: (a) => navigate(`/patient/payment/${a.id}`), style: "success" }] 
                          : appt.status === "ACCEPTED" 
                          ? [{ label: "Join Call 📹", onClick: (a) => navigate(`/patient/session/${a.id}`), style: "primary" }]
                          : []),
                        { label: "Reschedule", onClick: (a) => setRescheduleAppt(a) },
                        { label: "Cancel",     onClick: (a) => setCancelTarget(a), style: "danger" },
                      ]
                    : []),
                ]}
              />
            ))}
          </div>
        ) : (
<<<<<<< HEAD
          <div className="py-20 text-center text-slate-400">
            <p className="mb-3 text-5xl">📭</p>
=======
          <div className="text-center py-20 text-slate-400">
            <p className="text-5xl mb-3">📭</p>
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
            <p className="text-base font-medium">No {activeTab.toLowerCase()} appointments.</p>
          </div>
        )}
      </div>

      {/* Cancel confirmation */}
      <ConfirmationModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        loading={actionLoading}
        title="Cancel Appointment"
        message={`Cancel your appointment with ${cancelTarget?.doctorName} on ${cancelTarget?.date}?`}
        confirmLabel="Yes, Cancel"
        confirmStyle="danger"
      />

      {/* Reschedule modal */}
      {rescheduleAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRescheduleAppt(null)} />
<<<<<<< HEAD
          <div className="relative w-full max-w-md overflow-hidden bg-white border shadow-2xl rounded-2xl border-slate-100">
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-sky-400" />
            <div className="px-6 pt-6 pb-7">
              <h2 className="mb-4 text-lg font-bold text-slate-800">Reschedule Appointment</h2>
              <p className="mb-4 text-sm text-slate-500">
=======
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-sky-400" />
            <div className="px-6 pt-6 pb-7">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Reschedule Appointment</h2>
              <p className="text-sm text-slate-500 mb-4">
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
                Rescheduling: <strong>{rescheduleAppt.doctorName}</strong>
              </p>
              <div className="mb-4">
                <CalendarView
                  selected={reschedDate}
                  onSelect={setReschedDate}
                  minDate={new Date()}
                />
              </div>
              {reschedDate && (
                <div className="mb-4">
<<<<<<< HEAD
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Select Time</p>
=======
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Select Time</p>
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
                  <TimeSlotPicker
                    slots={reschedSlots}
                    selected={reschedSlot?.id}
                    onSelect={setReschedSlot}
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setRescheduleAppt(null)}
<<<<<<< HEAD
                  className="px-4 py-2 text-sm font-medium border rounded-lg border-slate-300 text-slate-600 hover:bg-slate-50"
=======
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50"
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleConfirm}
                  disabled={!reschedDate || !reschedSlot || actionLoading}
<<<<<<< HEAD
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
=======
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold
                    hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
                >
                  {actionLoading ? "Saving…" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointmentsPage;
