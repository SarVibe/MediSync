import React, { useEffect, useMemo, useState } from "react";
import AppointmentCard from "../components/AppointmentCard";
import ConfirmationModal from "../components/ConfirmationModal";
import CalendarView from "../components/CalendarView";
import TimeSlotPicker from "../components/TimeSlotPicker";
import { useAppointment } from "../AppointmentContext";
import { getDoctorAvailability } from "../services/doctorService";

const GROUPS = [
  { key: "BOOKED", label: "New Requests", color: "bg-yellow-500" },
  { key: "ACCEPTED", label: "Accepted", color: "bg-teal-500" },
  { key: "RESCHEDULED", label: "Awaiting Patient", color: "bg-amber-500" },
  { key: "COMPLETED", label: "Completed", color: "bg-green-500" },
  { key: "REJECTED", label: "Rejected", color: "bg-rose-500" },
  { key: "CANCELLED", label: "Cancelled", color: "bg-red-500" },
  { key: "EXPIRED", label: "Expired", color: "bg-slate-500" },
];

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

const DoctorAppointmentsPage = () => {
  const { appointments, fetchAppointments, changeAppointment, loading } = useAppointment();
  const minBookingDate = buildBookingBoundaryDate(1);
  const maxBookingDate = buildBookingBoundaryDate(30);
  const [local, setLocal] = useState([]);
  const [modal, setModal] = useState({ open: false, appt: null, action: null });
  const [actionLoad, setActionLoad] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [reschedDate, setReschedDate] = useState(null);
  const [reschedSlot, setReschedSlot] = useState(null);
  const [reschedSlots, setReschedSlots] = useState([]);
  const [reschedSlotState, setReschedSlotState] = useState("idle");
  const [reschedError, setReschedError] = useState("");

  useEffect(() => {
    fetchAppointments().catch(() => {
      setLocal([]);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLocal(Array.isArray(appointments) ? appointments : []);
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
    setReschedError("");
  }, [reschedDate, rescheduleAppt]);

  const groupedCounts = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        count: local.filter((appointment) => appointment.status?.toUpperCase() === group.key).length,
      })),
    [local],
  );

  const openModal = (appt, action) => {
    setModal({ open: true, appt, action });
    setRejectReason("");
    setRejectError("");
  };
  const closeModal = () => {
    setModal({ open: false, appt: null, action: null });
    setRejectReason("");
    setRejectError("");
  };

  const handleConfirm = async () => {
    const { appt, action } = modal;
    const newStatus =
      action === "accept" ? "ACCEPTED" : action === "reject" ? "REJECTED" : "COMPLETED";

    if (action === "reject" && !rejectReason.trim()) {
      setRejectError("Please enter a rejection reason.");
      return;
    }

    setActionLoad(true);
    try {
      const updated = await changeAppointment(appt.id, {
        status: newStatus,
        ...(action === "reject" ? { reason: rejectReason.trim() } : {}),
      });
      setLocal((current) =>
        current.map((item) => (item.id === appt.id ? updated : item)),
      );
    } catch (error) {
      setRejectError(
        error?.response?.data?.message || "Unable to update the appointment.",
      );
      return;
    } finally {
      setActionLoad(false);
    }
    closeModal();
  };

  const actionFor = (appointment) => {
    const status = appointment.status?.toUpperCase();
    const appointmentDateTime = toAppointmentDateTime(appointment);
    const isPastAppointment = appointmentDateTime ? appointmentDateTime.getTime() < Date.now() : false;
    const actions = [];

    if (status !== "CANCELLED" && status !== "REJECTED" && status !== "COMPLETED" && status !== "EXPIRED") {
      actions.push({
        label: "Reschedule",
        onClick: (item) => {
          setRescheduleAppt(item);
          setReschedDate(null);
          setReschedSlot(null);
          setReschedSlots([]);
          setReschedSlotState("idle");
          setReschedError("");
        },
      });
    }

    if (status === "BOOKED" && !isPastAppointment) {
      actions.push({
        label: "Accept",
        onClick: (item) => openModal(item, "accept"),
        style: "success",
      });
    }

    if (status === "BOOKED") {
      actions.push({
        label: "Reject",
        onClick: (item) => openModal(item, "reject"),
        style: "danger",
      });
    }

    // if (status === "ACCEPTED") {
    //   actions.push({
    //     label: "Start Session",
    //     onClick: (item) => window.open(`/doctor/session/${item.id}`, "_blank"),
    //     style: "primary",
    //   });
    //   actions.push({
    //     label: "Mark Complete",
    //     onClick: (item) => openModal(item, "complete"),
    //   });
    // }


    if (status === "BOOKED" || status === "ACCEPTED") {
  actions.push({
    label: status === "BOOKED" ? "Prepare Session" : "Open Session",
    onClick: (item) =>
      window.open(
        `/doctor/session/${item.id}`,
        "_blank",
        "noopener,noreferrer"
      ),
    style: "primary",
  });
}

if (status === "ACCEPTED") {
  const isFuture = appointmentDateTime ? appointmentDateTime.getTime() > Date.now() : false;
  actions.push({
    label: "Mark Complete",
    onClick: (item) => openModal(item, "complete"),
    disabled: isFuture,
    title: isFuture ? "Can't complete before the date" : "",
  });
}

    return actions;
  };

  const handleRescheduleConfirm = async () => {
    if (!reschedDate || !reschedSlot || !rescheduleAppt) {
      setReschedError("Please select a date and time slot.");
      return;
    }

    setActionLoad(true);
    const dateKey = `${reschedDate.getFullYear()}-${String(reschedDate.getMonth() + 1).padStart(2, "0")}-${String(reschedDate.getDate()).padStart(2, "0")}`;

    try {
      const updated = await changeAppointment(rescheduleAppt.id, {
        newDateTime: `${dateKey}T${reschedSlot.time}`,
      });
      setLocal((current) =>
        current.map((item) => (item.id === rescheduleAppt.id ? updated : item)),
      );
      setRescheduleAppt(null);
      setReschedDate(null);
      setReschedSlot(null);
      setReschedSlots([]);
      setReschedSlotState("idle");
      setReschedError("");
    } catch (error) {
      setReschedError(
        error?.response?.data?.message || "Unable to reschedule the appointment.",
      );
    } finally {
      setActionLoad(false);
    }
  };

  const MODAL_META = {
    accept: {
      title: "Accept Appointment",
      msg: "Accept this appointment?",
      label: "Accept",
      style: "primary",
    },
    reject: {
      title: "Reject Appointment",
      msg: "Reject this appointment?",
      label: "Reject",
      style: "danger",
    },
    complete: {
      title: "Mark as Completed",
      msg: "Mark this appointment as completed?",
      label: "Complete",
      style: "primary",
    },
  };

  const meta = MODAL_META[modal.action] || {};

  return (
    <div className="px-4 py-8 min-h-screen to-blue-50 bg-linear-to-br from-slate-50">
      <div className="mx-auto max-w-3xl">
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-slate-800">Appointment Requests</h1>
          <p className="mt-1 text-sm text-slate-500">Review and respond to patient appointments.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-7 md:grid-cols-4">
          {groupedCounts.map((group) => (
            <div key={group.key} className="p-4 text-center bg-white rounded-xl border shadow-sm border-slate-200">
              <div className={`mx-auto mb-2 h-2 w-2 rounded-full ${group.color}`} />
              <p className="text-2xl font-bold text-slate-800">{group.count}</p>
              <p className="text-xs font-medium text-slate-500">{group.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-blue-200 animate-spin border-t-blue-600" />
          </div>
        ) : local.length === 0 ? (
          <div className="px-6 py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
            No patient appointments for this doctor yet.
          </div>
        ) : (
          GROUPS.map((group) => {
            const items = local.filter((appointment) => appointment.status?.toUpperCase() === group.key);
            return (
              <div key={group.key} className="mb-6">
                <div className="flex gap-2 items-center mb-3">
                  <div className={`h-3 w-3 rounded-full ${group.color}`} />
                  <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-700">
                    {group.label} ({items.length})
                  </h2>
                </div>

                {items.length === 0 ? (
                  <p className="pl-5 text-sm text-slate-400">None</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {items.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        viewMode="doctor"
                        actions={actionFor(appointment)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <ConfirmationModal
        isOpen={modal.open}
        onClose={closeModal}
        onConfirm={handleConfirm}
        loading={actionLoad}
        title={meta.title}
        message={meta.msg}
        confirmLabel={meta.label}
        confirmStyle={meta.style}
      >
        {modal.action === "reject" && (
          <div className="mt-4">
            <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-slate-500">
              Rejection Reason
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(event) => {
                setRejectReason(event.target.value);
                setRejectError("");
              }}
              placeholder="Enter the reason for rejection"
              className="px-3 py-2 w-full text-sm rounded-lg border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            {rejectError && (
              <p className="mt-2 text-xs text-red-500">{rejectError}</p>
            )}
          </div>
        )}
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
                Patient: <strong>{rescheduleAppt.patientName}</strong>
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
              {reschedError && (
                <p className="mb-4 text-xs text-red-500">{reschedError}</p>
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
                disabled={!reschedDate || !reschedSlot || actionLoad}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoad ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentsPage;
