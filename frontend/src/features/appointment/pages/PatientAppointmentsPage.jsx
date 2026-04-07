import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentCard from "../components/AppointmentCard";
import ConfirmationModal from "../components/ConfirmationModal";
import CalendarView from "../components/CalendarView";
import TimeSlotPicker from "../components/TimeSlotPicker";
import { useAppointment } from "../AppointmentContext";
import { getDoctorAvailability } from "../services/doctorService";

const MOCK_SLOTS = [
  { id: 1, time: "09:00", available: true },
  { id: 2, time: "09:30", available: false },
  { id: 3, time: "10:00", available: true },
  { id: 4, time: "11:00", available: true },
  { id: 5, time: "14:00", available: false },
  { id: 6, time: "15:00", available: true },
];

const TABS = ["Upcoming", "Completed", "Cancelled"];

const filterByTab = (appointments, tab) => {
  const map = {
    Upcoming: ["BOOKED", "PENDING", "ACCEPTED", "RESCHEDULED"],
    Completed: ["COMPLETED"],
    Cancelled: ["CANCELLED"],
  };

  return appointments.filter((appointment) =>
    map[tab]?.includes(appointment.status?.toUpperCase()),
  );
};

const PatientAppointmentsPage = () => {
  const navigate = useNavigate();
  const {
    appointments,
    fetchAppointments,
    cancelAppointment,
    changeAppointment,
    loading,
  } = useAppointment();

  const [activeTab, setActiveTab] = useState("Upcoming");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [reschedDate, setReschedDate] = useState(null);
  const [reschedSlot, setReschedSlot] = useState(null);
  const [reschedSlots, setReschedSlots] = useState(MOCK_SLOTS);
  const [actionLoading, setActionLoading] = useState(false);
  const [localAppts, setLocalAppts] = useState([]);

  useEffect(() => {
    fetchAppointments().catch(() => {
      setLocalAppts([]);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLocalAppts(Array.isArray(appointments) ? appointments : []);
  }, [appointments]);

  useEffect(() => {
    if (!rescheduleAppt || !reschedDate) {
      return;
    }

    getDoctorAvailability(rescheduleAppt.doctorId, {
      date: `${reschedDate.getFullYear()}-${String(reschedDate.getMonth() + 1).padStart(2, "0")}-${String(reschedDate.getDate()).padStart(2, "0")}`,
    })
      .then((slots) => {
        setReschedSlots(Array.isArray(slots) && slots.length > 0 ? slots : []);
      })
      .catch(() => setReschedSlots([]));

    setReschedSlot(null);
  }, [reschedDate, rescheduleAppt]);

  const handleCancelConfirm = async () => {
    setActionLoading(true);
    try {
      await cancelAppointment(cancelTarget.id);
      setLocalAppts((prev) =>
        prev.map((appointment) =>
          appointment.id === cancelTarget.id
            ? { ...appointment, status: "CANCELLED" }
            : appointment,
        ),
      );
    } finally {
      setActionLoading(false);
      setCancelTarget(null);
    }
  };

  const handleRescheduleConfirm = async () => {
    if (!reschedDate || !reschedSlot) {
      return;
    }

    setActionLoading(true);
    const dateKey = `${reschedDate.getFullYear()}-${String(reschedDate.getMonth() + 1).padStart(2, "0")}-${String(reschedDate.getDate()).padStart(2, "0")}`;

    try {
      await changeAppointment(rescheduleAppt.id, {
        newDateTime: `${dateKey}T${reschedSlot.time}`,
      });
      setLocalAppts((prev) =>
        prev.map((appointment) =>
          appointment.id === rescheduleAppt.id
            ? {
                ...appointment,
                date: dateKey,
                time: reschedSlot.time,
                status: "RESCHEDULED",
              }
            : appointment,
        ),
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
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Appointments</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track and manage your appointments.
            </p>
          </div>
          <button
            onClick={() => navigate("/patient/doctors")}
            className="px-4 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow hover:bg-blue-700"
          >
            + Book New
          </button>
        </div>

        <div className="flex gap-1 p-1 mb-6 bg-white border shadow-sm border-slate-200 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-500 hover:text-blue-600"
              }`}
            >
              {tab}
              <span className="ml-1.5 text-xs opacity-75">
                ({filterByTab(localAppts, tab).length})
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin" />
          </div>
        ) : displayed.length > 0 ? (
          <div className="flex flex-col gap-4">
            {displayed.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                viewMode="patient"
                actions={[
                  ...(["BOOKED", "PENDING", "ACCEPTED", "RESCHEDULED"].includes(
                    appointment.status?.toUpperCase(),
                  )
                    ? [
                        ...(appointment.status === "ACCEPTED" && !appointment.paid
                          ? [
                              {
                                label: "Pay Now",
                                onClick: (item) =>
                                  navigate(`/patient/payment/${item.id}`),
                                style: "success",
                              },
                            ]
                          : appointment.status === "ACCEPTED"
                            ? [
                                {
                                  label: "Join Call",
                                  onClick: (item) =>
                                    navigate(`/patient/session/${item.id}`),
                                  style: "primary",
                                },
                              ]
                            : []),
                        {
                          label: "Reschedule",
                          onClick: (item) => setRescheduleAppt(item),
                        },
                        {
                          label: "Cancel",
                          onClick: (item) => setCancelTarget(item),
                          style: "danger",
                        },
                      ]
                    : []),
                ]}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400">
            <p className="mb-3 text-5xl">No appointments</p>
            <p className="text-base font-medium">
              No {activeTab.toLowerCase()} appointments.
            </p>
          </div>
        )}
      </div>

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

      {rescheduleAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setRescheduleAppt(null)}
          />
          <div className="relative w-full max-w-md overflow-hidden bg-white border shadow-2xl rounded-2xl border-slate-100">
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-sky-400" />
            <div className="px-6 pt-6 pb-7">
              <h2 className="mb-4 text-lg font-bold text-slate-800">
                Reschedule Appointment
              </h2>
              <p className="mb-4 text-sm text-slate-500">
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
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                    Select Time
                  </p>
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
                  className="px-4 py-2 text-sm font-medium border rounded-lg border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleConfirm}
                  disabled={!reschedDate || !reschedSlot || actionLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Saving..." : "Confirm"}
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
