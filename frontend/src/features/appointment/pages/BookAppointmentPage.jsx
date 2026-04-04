import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CalendarView from "../components/CalendarView";
import TimeSlotPicker from "../components/TimeSlotPicker";
import ConfirmationModal from "../components/ConfirmationModal";
import { getDoctorById, getDoctorAvailability } from "../services/doctorService";
import { useAppointment } from "../AppointmentContext";

// ── Mock data fallback ────────────────────────────────────────────────────
const MOCK_DOCTOR = { id: 1, name: "Arjun Sharma", specialization: "Cardiology" };
const buildMockSlots = () => {
  const slots = [];
  const times = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM",
                  "11:30 AM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM"];
  times.forEach((t, i) => slots.push({ id: i + 1, time: t, available: i % 3 !== 2 }));
  return slots;
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
  const { bookAppointment } = useAppointment();

  const [doctor,         setDoctor]         = useState(null);
  const [selectedDate,   setSelectedDate]   = useState(null);
  const [slots,          setSlots]          = useState([]);
  const [selectedSlot,   setSelectedSlot]   = useState(null);
  const [reason,         setReason]         = useState("");
  const [modalOpen,      setModalOpen]      = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [pageLoading,    setPageLoading]    = useState(true);
  const [error,          setError]          = useState("");

  // Load doctor info
  useEffect(() => {
    getDoctorById(doctorId)
      .then(setDoctor)
      .catch(() => setDoctor(MOCK_DOCTOR))
      .finally(() => setPageLoading(false));
  }, [doctorId]);

  // Load slots when date changes
  useEffect(() => {
    if (!selectedDate) { setSlots([]); return; }
    getDoctorAvailability(doctorId, { date: toDateKey(selectedDate) })
      .then((data) => setSlots(Array.isArray(data) ? data : MOCK_DOCTOR && buildMockSlots()))
      .catch(() => setSlots(buildMockSlots()));
    setSelectedSlot(null);
  }, [selectedDate, doctorId]);

  const handleConfirm = async () => {
    if (!reason.trim()) { setError("Please enter a reason for the appointment."); return; }
    setModalOpen(true);
  };

  const handleBook = async () => {
    setLoading(true);
    try {
      await bookAppointment({
        doctorId,
        doctorName: doctor?.name || "Dr. Arjun Sharma",
        date: toDateKey(selectedDate),
        time: selectedSlot.time,
        reason,
        status: "BOOKED",
      });
      navigate("/patient/appointments");
    } catch (err) {
      setError(err?.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Back + Header */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 text-sm hover:underline mb-4 flex items-center gap-1"
        >
          ← Back to Doctors
        </button>

        {doctor && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
              {doctor.name?.charAt(0) || "D"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Dr. {doctor.name}</h1>
              <p className="text-blue-600 text-sm font-medium">{doctor.specialization}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
              1. Select Date
            </h2>
            <CalendarView
              selected={selectedDate}
              onSelect={setSelectedDate}
              minDate={new Date()}
            />
          </div>

          {/* Slots + Reason */}
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                2. Select Time Slot
              </h2>
              {selectedDate ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <p className="text-xs text-slate-400 mb-3">
                    {selectedDate.toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
                  </p>
                  <TimeSlotPicker
                    slots={slots}
                    selected={selectedSlot?.id}
                    onSelect={setSelectedSlot}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-sm">
                  Please select a date first
                </div>
              )}
            </div>

            {/* Reason */}
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
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
              {error && <p className="text-xs text-red-500 mt-1">⚠ {error}</p>}
            </div>

            {/* Book button */}
            <button
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedSlot}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm
                hover:bg-blue-700 transition-colors shadow disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Book Appointment
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
            ? `Book with Dr. ${doctor?.name} on ${selectedDate.toDateString()} at ${selectedSlot.time}?`
            : ""
        }
        confirmLabel="Book Now"
      />
    </div>
  );
};

export default BookAppointmentPage;
