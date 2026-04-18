import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentCard from "../components/AppointmentCard";
import ConfirmationModal from "../components/ConfirmationModal";
import CalendarView from "../components/CalendarView";
import TimeSlotPicker from "../components/TimeSlotPicker";
import { useAppointment } from "../AppointmentContext";
import { getDoctorAvailability } from "../services/doctorService";

const buildBookingBoundaryDate = (days) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
};

const toAppointmentDateTime = (appointment) => {
  if (!appointment?.date || !appointment?.time) {
    return null;
  }
  const normalizedTime = appointment.time.length === 5 ? `${appointment.time}:00` : appointment.time;
  const parsed = new Date(`${appointment.date}T${normalizedTime}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const TABS = ["Upcoming", "Rescheduled", "Completed", "Rejected", "Cancelled", "Expired"];

const filterByTab = (appointments, tab) => {
  const map = {
    Upcoming: ["BOOKED", "PENDING", "ACCEPTED"],
    Rescheduled: ["RESCHEDULED"],
    Completed: ["COMPLETED"],
    Rejected: ["REJECTED"],
    Cancelled: ["CANCELLED"],
    Expired: ["EXPIRED"],
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
  const minBookingDate = buildBookingBoundaryDate(1);
  const maxBookingDate = buildBookingBoundaryDate(30);

  const [activeTab, setActiveTab] = useState("Upcoming");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [reschedDate, setReschedDate] = useState(null);
  const [reschedSlot, setReschedSlot] = useState(null);
  const [reschedSlots, setReschedSlots] = useState([]);
  const [reschedSlotState, setReschedSlotState] = useState("idle");
  const [actionLoading, setActionLoading] = useState(false);
  const [localAppts, setLocalAppts] = useState([]);
  const [acceptError, setAcceptError] = useState("");

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
      .then((data) => {
        setReschedSlots(Array.isArray(data?.slots) ? data.slots : []);
        setReschedSlotState(
          data?.unavailable ? "unavailable" : data?.fullyBooked ? "fullyBooked" : "available",
        );
      })
      .catch(() => {
        setReschedSlots([]);
        setReschedSlotState("fullyBooked");
      });

    setReschedSlot(null);
  }, [reschedDate, rescheduleAppt]);

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      setCancelError("Please enter a cancellation reason.");
      return;
    }

    setActionLoading(true);
    try {
      await cancelAppointment(cancelTarget.id, { reason: cancelReason.trim() });
      setLocalAppts((prev) =>
        prev.map((appointment) =>
          appointment.id === cancelTarget.id
            ? {
                ...appointment,
                status: "CANCELLED",
                cancellationReason: cancelReason.trim(),
              }
            : appointment,
        ),
      );
      setCancelReason("");
      setCancelError("");
      setCancelTarget(null);
    } catch (error) {
      setCancelError(
        error?.response?.data?.message || "Unable to cancel the appointment.",
      );
    } finally {
      setActionLoading(false);
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
                status: "BOOKED",
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

  const handleAcceptRescheduled = async (appointment) => {
    setActionLoading(true);
    setAcceptError("");
    try {
      const updated = await changeAppointment(appointment.id, { status: "ACCEPTED" });
      setLocalAppts((prev) =>
        prev.map((item) => (item.id === appointment.id ? updated : item)),
      );
    } catch (error) {
      setAcceptError(
        error?.response?.data?.message || "Unable to accept the rescheduled appointment.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const displayed = filterByTab(localAppts, activeTab);

  return (
    <div className="px-4 py-8 min-h-screen to-blue-50 bg-linear-to-br from-slate-50">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Appointments</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track and manage your appointments.
            </p>
          </div>
          <button
            onClick={() => navigate("/patient/doctors")}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow transition-colors hover:bg-blue-700"
          >
            + Book New
          </button>
        </div>

        <div className="flex gap-1 p-1 mb-6 bg-white rounded-xl border shadow-sm border-slate-200">
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
            <div className="w-10 h-10 rounded-full border-4 border-blue-200 animate-spin border-t-blue-600" />
          </div>
        ) : displayed.length > 0 ? (
          <div className="flex flex-col gap-4">
            {displayed.map((appointment) => {
              const appointmentDateTime = toAppointmentDateTime(appointment);
              const isExpired = appointmentDateTime ? appointmentDateTime.getTime() < Date.now() : false;
              return (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                viewMode="patient"
                actions={[
                  ...(["BOOKED", "PENDING", "ACCEPTED", "RESCHEDULED"].includes(
                    appointment.status?.toUpperCase(),
                  )
                    ? [
                        ...(appointment.status?.toUpperCase() === "RESCHEDULED" && !isExpired
                          ? [
                              {
                                label: actionLoading ? "Saving..." : "Accept",
                                onClick: (item) => handleAcceptRescheduled(item),
                                style: "success",
                              },
                            ]
                          : []),
                        ...(appointment.status?.toUpperCase() === "ACCEPTED"
                          ? [
                              {
                                label: "Open Session",
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
                          onClick: (item) => {
                            setCancelTarget(item);
                            setCancelReason("");
                            setCancelError("");
                          },
                          style: "danger",
                        },
                      ]
                    : []),
                ]}
              />
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400">
            <p className="mb-3 text-5xl">No appointments</p>
            <p className="text-base font-medium">
              No {activeTab.toLowerCase()} appointments.
            </p>
          </div>
        )}
        {acceptError && (
          <p className="mt-4 text-sm text-red-500">{acceptError}</p>
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
      >
        <div className="mt-4">
          <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-slate-500">
            Cancellation Reason
          </label>
          <textarea
            rows={3}
            value={cancelReason}
            onChange={(event) => {
              setCancelReason(event.target.value);
              setCancelError("");
            }}
            placeholder="Enter the reason for cancellation"
            className="px-3 py-2 w-full text-sm rounded-lg border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          {cancelError && (
            <p className="mt-2 text-xs text-red-500">{cancelError}</p>
          )}
        </div>
      </ConfirmationModal>

      {rescheduleAppt && (
        <div className="flex fixed inset-0 z-50 justify-center items-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm bg-black/40"
            onClick={() => setRescheduleAppt(null)}
          />
          <div className="relative flex flex-col overflow-hidden w-full max-w-md bg-white border shadow-2xl rounded-2xl border-slate-100 max-h-[95vh]">
            <div className="shrink-0 w-full h-1 from-blue-500 to-sky-400 bg-linear-to-r" />
            
            <div className="flex-1 px-6 pt-6 pb-2 overflow-y-auto custom-scrollbar">
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
                  minDate={minBookingDate}
                  maxDate={maxBookingDate}
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
                    emptyMessage={
                      reschedSlotState === "unavailable"
                        ? "Doctor is not available on this date."
                        : "All bookings ended for this date."
                    }
                  />
                </div>
              )}
            </div>

            <div className="shrink-0 px-6 py-4 flex gap-3 justify-end border-t border-slate-50 bg-slate-50/30">
              <button
                onClick={() => setRescheduleAppt(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
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
      )}
    </div>
  );
};

export default PatientAppointmentsPage;
