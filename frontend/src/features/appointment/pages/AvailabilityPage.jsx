import React, { useState, useEffect } from "react";
import {
  addAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  getDoctorAvailability,
} from "../services/doctorService";
import ConfirmationModal from "../components/ConfirmationModal";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const MOCK_SLOTS = [
  { id:1, day:"Monday",    startTime:"09:00", endTime:"13:00", available:true  },
  { id:2, day:"Wednesday", startTime:"14:00", endTime:"18:00", available:true  },
  { id:3, day:"Friday",    startTime:"10:00", endTime:"14:00", available:false },
];

const INITIAL_FORM = { day: "Monday", startTime: "09:00", endTime: "17:00" };

/**
 * AvailabilityPage – /doctor/availability
 */
const AvailabilityPage = () => {
  const [slots,       setSlots]       = useState(MOCK_SLOTS);
  const [form,        setForm]        = useState(INITIAL_FORM);
  const [formError,   setFormError]   = useState("");
  const [adding,      setAdding]      = useState(false);
  const [deleteTarget,setDeleteTarget]= useState(null);
  const [deleting,    setDeleting]    = useState(false);

  // Try to load from API
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.id) {
      getDoctorAvailability(user.id)
        .then((d) => { if (Array.isArray(d) && d.length) setSlots(d); })
        .catch(() => {});
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFormError("");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (form.startTime >= form.endTime) {
      setFormError("End time must be after start time.");
      return;
    }
    setAdding(true);
    try {
      const saved = await addAvailabilitySlot({ ...form, available: true });
      setSlots((p) => [...p, saved]);
    } catch {
      // Mock add
      setSlots((p) => [...p, { id: Date.now(), ...form, available: true }]);
    } finally {
      setAdding(false);
      setForm(INITIAL_FORM);
    }
  };

  const handleToggle = async (slot) => {
    try {
      const updated = await updateAvailabilitySlot(slot.id, { available: !slot.available });
      setSlots((p) => p.map((s) => s.id === slot.id ? { ...s, ...updated } : s));
    } catch {
      setSlots((p) => p.map((s) => s.id === slot.id ? { ...s, available: !s.available } : s));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteAvailabilitySlot(deleteTarget.id);
    } catch {/* ok */} finally {
      setSlots((p) => p.filter((s) => s.id !== deleteTarget.id));
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">

        <div className="mb-7">
          <h1 className="text-3xl font-bold text-slate-800">Manage Availability</h1>
          <p className="text-slate-500 text-sm mt-1">Set the days and times you're available for appointments.</p>
        </div>

        {/* Add slot form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Add New Slot</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Day of Week</label>
              <select
                name="day"
                value={form.day}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">End Time</label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {formError && (
              <p className="col-span-full text-xs text-red-500">⚠ {formError}</p>
            )}
            <div className="col-span-full flex justify-end">
              <button
                type="submit"
                disabled={adding}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {adding ? "Adding…" : "+ Add Slot"}
              </button>
            </div>
          </form>
        </div>

        {/* Slots table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700">Your Availability Slots</h2>
          </div>
          {slots.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-12">No slots added yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {slots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between px-5 py-4 flex-wrap gap-3">
                  <div>
                    <span className="font-semibold text-slate-800 text-sm">{slot.day}</span>
                    <span className="text-slate-500 text-sm ml-3">
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(slot)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
                        ${slot.available
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                    >
                      {slot.available ? "Available" : "Unavailable"}
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => setDeleteTarget(slot)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-red-500
                        bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Slot"
        message={`Remove ${deleteTarget?.day} ${deleteTarget?.startTime}–${deleteTarget?.endTime}?`}
        confirmLabel="Delete"
        confirmStyle="danger"
      />
    </div>
  );
};

export default AvailabilityPage;
