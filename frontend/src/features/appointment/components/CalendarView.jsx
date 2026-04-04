import React, { useState } from "react";

/**
 * CalendarView – a simple month-grid date picker.
 *
 * Props:
 *  selected        – Date | null (currently selected date)
 *  onSelect        – (date: Date) => void
 *  highlightDates  – string[] of "YYYY-MM-DD" to show as having appointments
 *  minDate         – Date (cannot select before this date)
 */

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const CalendarView = ({
  selected,
  onSelect,
  highlightDates = [],
  minDate,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = useState(
    selected ? new Date(selected.getFullYear(), selected.getMonth(), 1)
             : new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const prevMonth = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  // Build the day grid
  const year  = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const highlightSet = new Set(highlightDates);
  const selectedKey  = selected ? toKey(selected) : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-full hover:bg-blue-500 flex items-center justify-center transition-colors"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="font-semibold text-sm">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-full hover:bg-blue-500 flex items-center justify-center transition-colors"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 bg-blue-50 border-b border-slate-100">
        {DAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-semibold text-blue-600"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 p-2 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;

          const key        = toKey(date);
          const isToday    = key === toKey(today);
          const isSelected = key === selectedKey;
          const isPast     = minDate ? date < minDate : date < today;
          const hasAppt    = highlightSet.has(key);

          return (
            <button
              key={key}
              type="button"
              disabled={isPast}
              onClick={() => !isPast && onSelect(date)}
              className={`relative h-9 w-full rounded-lg text-sm font-medium transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
                ${
                  isSelected
                    ? "bg-blue-600 text-white shadow"
                    : isToday
                    ? "border-2 border-blue-400 text-blue-700"
                    : isPast
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
            >
              {date.getDate()}
              {/* Appointment dot */}
              {hasAppt && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
