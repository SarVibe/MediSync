import React, { useEffect, useMemo, useState } from "react";
import ConfirmationModal from "../components/ConfirmationModal";
import {
  deleteDateOverride,
  getMyAvailabilityConfig,
  saveDateOverride,
  saveWeeklyAvailability,
} from "../services/doctorService";

const DAYS = [
  { key: "MONDAY", label: "Monday" },
  { key: "TUESDAY", label: "Tuesday" },
  { key: "WEDNESDAY", label: "Wednesday" },
  { key: "THURSDAY", label: "Thursday" },
  { key: "FRIDAY", label: "Friday" },
  { key: "SATURDAY", label: "Saturday" },
  { key: "SUNDAY", label: "Sunday" },
];

const DEFAULT_SLOTS = [{ startTime: "09:00", endTime: "17:00" }];
const EMPTY_OVERRIDE_FORM = {
  date: "",
  unavailable: false,
  slots: [{ startTime: "09:00", endTime: "12:00" }],
};

function normalizeSlots(slots) {
  if (!Array.isArray(slots) || slots.length === 0) {
    return DEFAULT_SLOTS;
  }

  return slots.map((slot) => ({
    startTime: String(slot.startTime || "").slice(0, 5) || "09:00",
    endTime: String(slot.endTime || "").slice(0, 5) || "17:00",
  }));
}

function formatDay(day) {
  const matched = DAYS.find((item) => item.key === day);
  return matched ? matched.label : day;
}

function formatSlot(slot) {
  return `${slot.startTime} - ${slot.endTime}`;
}

const AvailabilityPage = () => {
  const [selectedDays, setSelectedDays] = useState(DAYS.map((day) => day.key));
  const [defaultSlots, setDefaultSlots] = useState(DEFAULT_SLOTS);
  const [overrides, setOverrides] = useState([]);
  const [overrideForm, setOverrideForm] = useState(EMPTY_OVERRIDE_FORM);
  const [pageLoading, setPageLoading] = useState(true);
  const [savingWeekly, setSavingWeekly] = useState(false);
  const [savingOverride, setSavingOverride] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getMyAvailabilityConfig()
      .then((config) => {
        setSelectedDays(
          Array.isArray(config?.availableDays) && config.availableDays.length > 0
            ? config.availableDays
            : DAYS.map((day) => day.key),
        );
        setDefaultSlots(normalizeSlots(config?.defaultSlots));
        setOverrides(Array.isArray(config?.dateOverrides) ? config.dateOverrides : []);
      })
      .catch(() => {
        setError("Could not load availability settings.");
      })
      .finally(() => setPageLoading(false));
  }, []);

  const sortedOverrides = useMemo(
    () =>
      [...overrides].sort((left, right) => String(left.date).localeCompare(String(right.date))),
    [overrides],
  );

  const handleDayToggle = (dayKey) => {
    setSelectedDays((current) =>
      current.includes(dayKey)
        ? current.filter((day) => day !== dayKey)
        : [...current, dayKey],
    );
    setError("");
    setSuccess("");
  };

  const handleDefaultSlotChange = (index, field, value) => {
    setDefaultSlots((current) =>
      current.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, [field]: value } : slot,
      ),
    );
    setError("");
    setSuccess("");
  };

  const addDefaultSlot = () => {
    setDefaultSlots((current) => [...current, { startTime: "16:00", endTime: "18:00" }]);
  };

  const removeDefaultSlot = (index) => {
    setDefaultSlots((current) => current.filter((_, slotIndex) => slotIndex !== index));
  };

  const handleWeeklySave = async () => {
    setError("");
    setSuccess("");

    if (selectedDays.length === 0) {
      setError("Select at least one available day.");
      return;
    }

    if (defaultSlots.some((slot) => !slot.startTime || !slot.endTime || slot.startTime >= slot.endTime)) {
      setError("Each default time slot must have a valid start and end time.");
      return;
    }

    setSavingWeekly(true);
    try {
      const config = await saveWeeklyAvailability({
        availableDays: selectedDays,
        defaultSlots,
      });
      setSelectedDays(config.availableDays);
      setDefaultSlots(normalizeSlots(config.defaultSlots));
      setOverrides(Array.isArray(config.dateOverrides) ? config.dateOverrides : []);
      setSuccess("Weekly availability updated.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not save weekly availability.");
    } finally {
      setSavingWeekly(false);
    }
  };

  const handleOverrideSlotChange = (index, field, value) => {
    setOverrideForm((current) => ({
      ...current,
      slots: current.slots.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, [field]: value } : slot,
      ),
    }));
    setError("");
    setSuccess("");
  };

  const addOverrideSlot = () => {
    setOverrideForm((current) => ({
      ...current,
      slots: [...current.slots, { startTime: "16:00", endTime: "18:00" }],
    }));
  };

  const removeOverrideSlot = (index) => {
    setOverrideForm((current) => ({
      ...current,
      slots: current.slots.filter((_, slotIndex) => slotIndex !== index),
    }));
  };

  const handleOverrideSave = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!overrideForm.date) {
      setError("Choose a special date first.");
      return;
    }

    if (
      !overrideForm.unavailable &&
      overrideForm.slots.some((slot) => !slot.startTime || !slot.endTime || slot.startTime >= slot.endTime)
    ) {
      setError("Each special-day slot must have a valid start and end time.");
      return;
    }

    setSavingOverride(true);
    try {
      const savedOverride = await saveDateOverride({
        date: overrideForm.date,
        unavailable: overrideForm.unavailable,
        slots: overrideForm.unavailable ? [] : overrideForm.slots,
      });
      setOverrides((current) => {
        const next = current.filter((item) => item.date !== savedOverride.date);
        return [...next, savedOverride];
      });
      setOverrideForm(EMPTY_OVERRIDE_FORM);
      setSuccess("Special date updated.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not save the special date.");
    } finally {
      setSavingOverride(false);
    }
  };

  const handleDeleteOverride = async () => {
    if (!deleteTarget?.date) {
      return;
    }

    setDeleting(true);
    try {
      await deleteDateOverride(deleteTarget.date);
      setOverrides((current) => current.filter((item) => item.date !== deleteTarget.date));
      setSuccess("Special date removed.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not remove the special date.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen to-blue-50 bg-linear-to-br from-slate-50">
        <div className="w-10 h-10 rounded-full border-4 border-blue-200 animate-spin border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="px-4 py-8 min-h-screen via-white to-sky-50 bg-linear-to-br from-slate-50">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Doctor Availability</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            All days are available by default. Pick your regular weekdays, add one common set of time slots,
            then override any specific date as unavailable or with custom hours.
          </p>
        </div>

        {(error || success) && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              error
                ? "text-red-600 bg-red-50 border-red-200"
                : "text-emerald-700 bg-emerald-50 border-emerald-200"
            }`}
          >
            {error || success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <section className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-800">Weekly Schedule</h2>
              <p className="mt-1 text-sm text-slate-500">
                The selected days will use the same time slots every week until you set a special date override.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {DAYS.map((day) => {
                const active = selectedDays.includes(day.key);
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => handleDayToggle(day.key)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? "text-blue-700 bg-blue-50 border-blue-500 shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-sm font-semibold">{day.label}</div>
                    <div className="mt-1 text-xs">{active ? "Available" : "Unavailable"}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8">
              <div className="flex gap-3 justify-between items-center mb-3">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-500">
                    Common Time Slots
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Example: 09:00-12:00 and 16:00-18:00 for all selected days.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addDefaultSlot}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Add Slot
                </button>
              </div>

              <div className="space-y-3">
                {defaultSlots.map((slot, index) => (
                  <div key={`${slot.startTime}-${slot.endTime}-${index}`} className="grid gap-3 md:grid-cols-[1fr,1fr,auto]">
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(event) => handleDefaultSlotChange(index, "startTime", event.target.value)}
                      className="px-3 py-2 w-full text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(event) => handleDefaultSlotChange(index, "endTime", event.target.value)}
                      className="px-3 py-2 w-full text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeDefaultSlot(index)}
                      disabled={defaultSlots.length === 1}
                      className="px-3 py-2 text-xs font-semibold text-red-500 rounded-xl border border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={handleWeeklySave}
                disabled={savingWeekly}
                className="px-5 py-3 text-sm font-semibold text-white bg-blue-600 rounded-2xl shadow hover:bg-blue-700 disabled:opacity-50"
              >
                {savingWeekly ? "Saving..." : "Save Weekly Schedule"}
              </button>
            </div>
          </section>

          <section className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-800">Special Date Override</h2>
              <p className="mt-1 text-sm text-slate-500">
                Close a specific day fully, or give that date a different set of slots.
              </p>
            </div>

            <form onSubmit={handleOverrideSave} className="space-y-4">
              <input
                type="date"
                value={overrideForm.date}
                onChange={(event) =>
                  setOverrideForm((current) => ({ ...current, date: event.target.value }))
                }
                className="px-3 py-2 w-full text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none"
              />

              <label className="flex gap-3 items-center px-4 py-3 text-sm rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <input
                  type="checkbox"
                  checked={overrideForm.unavailable}
                  onChange={(event) =>
                    setOverrideForm((current) => ({
                      ...current,
                      unavailable: event.target.checked,
                    }))
                  }
                />
                Mark this date unavailable
              </label>

              {!overrideForm.unavailable && (
                <div className="space-y-3">
                  <div className="flex gap-3 justify-between items-center">
                    <p className="text-sm font-medium text-slate-600">Custom slots for this date</p>
                    <button
                      type="button"
                      onClick={addOverrideSlot}
                      className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      Add Slot
                    </button>
                  </div>
                  {overrideForm.slots.map((slot, index) => (
                    <div key={`${slot.startTime}-${slot.endTime}-${index}`} className="grid gap-3 md:grid-cols-[1fr,1fr,auto]">
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(event) => handleOverrideSlotChange(index, "startTime", event.target.value)}
                        className="px-3 py-2 w-full text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(event) => handleOverrideSlotChange(index, "endTime", event.target.value)}
                        className="px-3 py-2 w-full text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeOverrideSlot(index)}
                        disabled={overrideForm.slots.length === 1}
                        className="px-3 py-2 text-xs font-semibold text-red-500 rounded-xl border border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={savingOverride}
                className="px-4 py-3 w-full text-sm font-semibold text-white rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50"
              >
                {savingOverride ? "Saving..." : "Save Special Date"}
              </button>
            </form>

            <div className="mt-8">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-500">
                Saved Overrides
              </h3>

              {sortedOverrides.length === 0 ? (
                <div className="px-4 py-8 mt-3 text-sm text-center rounded-2xl border border-dashed border-slate-300 text-slate-400">
                  No special dates added yet.
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {sortedOverrides.map((override) => (
                    <div
                      key={override.date}
                      className="px-4 py-4 rounded-2xl border border-slate-200 bg-slate-50"
                    >
                      <div className="flex gap-4 justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{override.date}</p>
                          <p className="text-xs tracking-wide uppercase text-slate-400">
                            {formatDay(override.dayOfWeek)}
                          </p>
                          <div className="mt-2 text-sm text-slate-600">
                            {override.unavailable
                              ? "Unavailable for the full day"
                              : override.slots.map(formatSlot).join(", ")}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(override)}
                          className="px-3 py-2 text-xs font-semibold text-red-500 rounded-xl border border-red-200 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteOverride}
        loading={deleting}
        title="Delete Special Date"
        message={
          deleteTarget?.date
            ? `Remove the override for ${deleteTarget.date}?`
            : ""
        }
        confirmLabel="Delete"
        confirmStyle="danger"
      />
    </div>
  );
};

export default AvailabilityPage;
