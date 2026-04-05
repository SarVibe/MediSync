import React from "react";

/**
 * TimeSlotPicker – grid of time-slot buttons.
 *
 * Props:
 *  slots         – array of { id, time, available: boolean }
 *  selected      – currently selected slot id
 *  onSelect      – (slot) => void
 */
const TimeSlotPicker = ({ slots = [], selected, onSelect }) => {
  if (slots.length === 0) {
    return (
      <p className="text-sm text-slate-400 italic py-4 text-center">
        No time slots available for this date.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const isSelected   = selected === slot.id;
        const isAvailable  = slot.available !== false;

        return (
          <button
            key={slot.id}
            type="button"
            disabled={!isAvailable}
            onClick={() => isAvailable && onSelect(slot)}
            className={`py-2 px-1 rounded-lg border text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1
              ${
                !isAvailable
                  ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed line-through"
                  : isSelected
                  ? "bg-blue-600 border-blue-600 text-white shadow-md focus:ring-blue-400"
                  : "bg-white border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50 focus:ring-blue-300"
              }`}
          >
            {slot.time}
          </button>
        );
      })}
    </div>
  );
};

export default TimeSlotPicker;
