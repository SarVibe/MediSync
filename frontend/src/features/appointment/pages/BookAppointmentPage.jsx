import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CalendarView from "../components/CalendarView";
import TimeSlotPicker from "../components/TimeSlotPicker";
import ConfirmationModal from "../components/ConfirmationModal";
import { getDoctorById, getDoctorAvailability } from "../services/doctorService";

// ── Mock data fallback ────────────────────────────────────────────────────
const MOCK_DOCTOR = { id: 1, name: "Arjun Sharma", specialization: "Cardiology" };
const buildBookingBoundaryDate = (days) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
};
const toDateKey = (d) =>
  d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` : "";

/**
 * BookAppointmentPage – /patient/book/:doctorId
 * Calendar → time slot → reason → confirm modal → POST
 */
const BookAppointmentPage = () => {
  const { doctorId }      = useParams();
  const navigate          = useNavigate();
  const minBookingDate = buildBookingBoundaryDate(1);
  const maxBookingDate = buildBookingBoundaryDate(30);

  const [doctor,         setDoctor]         = useState(null);
  const [selectedDate,   setSelectedDate]   = useState(null);
  const [slots,          setSlots]          = useState([]);
  const [slotState,      setSlotState]      = useState("idle");
  const [selectedSlot,   setSelectedSlot]   = useState(null);
  const [reason,         setReason]         = useState("");
  const [modalOpen,      setModalOpen]      = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [pageLoading,    setPageLoading]    = useState(true);
  const [error,          setError]          = useState("");
  const selectedDateKey = toDateKey(selectedDate);
  const showReasonField = Boolean(selectedDate) && slotState === "available";

  // Load doctor info
  useEffect(() => {
    getDoctorById(doctorId)
      .then(setDoctor)
      .catch(() => setDoctor(MOCK_DOCTOR))
      .finally(() => setPageLoading(false));
  }, [doctorId]);

  // Load slots when date changes
  useEffect(() => {
    if (!selectedDateKey) return;

    getDoctorAvailability(doctorId, { date: selectedDateKey })
      .then((data) => {
        setSlots(Array.isArray(data?.slots) ? data.slots : []);
        setSlotState(
          data?.unavailable ? "unavailable" : data?.fullyBooked ? "fullyBooked" : "available",
        );
      })
      .catch(() => {
        setSlots([]);
        setSlotState("fullyBooked");
      });
  }, [selectedDateKey, doctorId]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlots([]);
    setSlotState("idle");
  };

  const handleConfirm = async () => {
    if (!reason.trim()) { setError("Please enter a reason for the appointment."); return; }
    setModalOpen(true);
  };

  const handleBook = async () => {
    setLoading(true);
    navigate("/patient/payment/checkout", {
      state: {
        booking: {
          doctorId: Number(doctorId),
          doctorName: doctor?.name || "Doctor",
          doctorSpecialization: doctor?.specialization || "",
          date: toDateKey(selectedDate),
          time: selectedSlot.time,
          reason: reason.trim(),
        },
      },
    });
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-4 border-blue-200 animate-spin border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="px-4 py-8 min-h-screen to-blue-50 bg-linear-to-br from-slate-50">
      <div className="mx-auto max-w-3xl">

        {/* Back + Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex gap-1 items-center mb-4 text-sm text-blue-600 hover:underline"
        >
          ← Back to Doctors
        </button>

        {doctor && (
          <div className="flex gap-4 items-center p-5 mb-6 bg-white rounded-xl border shadow-sm border-slate-200">
            <div className="flex justify-center items-center w-14 h-14 text-2xl font-bold text-blue-600 bg-blue-100 rounded-full">
              {doctor.name?.charAt(0) || "D"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Dr. {doctor.name}</h1>
              <p className="text-sm font-medium text-blue-600">{doctor.specialization}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Calendar */}
          <div>
            <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase text-slate-700">
              1. Select Date
            </h2>
            <CalendarView
              selected={selectedDate}
              onSelect={handleDateSelect}
              minDate={minBookingDate}
              maxDate={maxBookingDate}
            />
          </div>

          {/* Slots + Reason */}
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase text-slate-700">
                2. Select Time Slot
              </h2>
              {selectedDate ? (
                <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
                  <p className="mb-3 text-xs text-slate-400">
                    {selectedDate.toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
                  </p>
                  <TimeSlotPicker
                    slots={slots}
                    selected={selectedSlot?.id}
                    onSelect={setSelectedSlot}
                    emptyMessage={
                      slotState === "unavailable"
                        ? "Doctor is not available on this date."
                        : "All bookings ended for this date."
                    }
                  />
                </div>
              ) : (
                <div className="p-8 text-sm text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                  Please select a date first
                </div>
              )}
            </div>

            {/* Reason */}
            {showReasonField ? <div>
              <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase text-slate-700">
                3. Reason for Visit
              </h2>
              <textarea
                rows={3}
                placeholder="Briefly describe your symptoms or reason for the visit…"
                value={reason}
                onChange={(e) => { setReason(e.target.value); setError(""); }}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800
                  placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              {error && <p className="mt-1 text-xs text-red-500">⚠ {error}</p>}
            </div> : null}

            {/* Book button */}
            <button
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedSlot}
              className="py-3 w-full text-sm font-semibold text-white bg-blue-600 rounded-lg shadow transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleBook}
        loading={loading}
        title="Confirm Appointment"
        message={
          selectedSlot && selectedDate
            ? `Proceed to payment for Dr. ${doctor?.name} on ${selectedDate.toDateString()} at ${selectedSlot.time}?`
            : ""
        }
        confirmLabel={loading ? "Redirecting..." : "Pay Now"}
      />
    </div>
  );
};

export default BookAppointmentPage;
