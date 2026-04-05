import React from "react";
import StatusBadge from "./StatusBadge";

/**
 * AppointmentCard – shows a single appointment's details + action buttons.
 *
 * Props:
 *  appointment  – { id, doctorName, patientName, date, time, reason, status }
 *  actions      – array of { label, onClick, style? ("default"|"danger") }
 *  viewMode     – "patient" | "doctor" | "admin"
 */
const AppointmentCard = ({ appointment, actions = [], viewMode = "patient" }) => {
  const {
    doctorName,
    patientName,
    date,
    time,
    reason,
    status,
  } = appointment;

  const primaryName   = viewMode === "patient" ? doctorName : patientName;
  const primaryLabel  = viewMode === "patient" ? "Doctor"   : "Patient";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Accent bar keyed to status */}
      <div
        className={`h-1 w-full ${
          status?.toUpperCase() === "COMPLETED"
            ? "bg-green-400"
            : status?.toUpperCase() === "CANCELLED"
            ? "bg-red-400"
            : status?.toUpperCase() === "PENDING"
            ? "bg-yellow-400"
            : "bg-blue-500"
        }`}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          {/* Name & meta */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
              {primaryLabel}
            </p>
            <h3 className="text-base font-bold text-slate-800 truncate">
              {primaryName || "—"}
            </h3>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="text-blue-500">📅</span>
            <span>{date || "—"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-blue-500">🕐</span>
            <span>{time || "—"}</span>
          </div>
          {reason && (
            <div className="col-span-2 flex items-start gap-1.5">
              <span className="text-blue-500 mt-0.5">📝</span>
              <span className="leading-snug">{reason}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => action.onClick(appointment)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1
                  ${
                    action.style === "danger"
                      ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus:ring-red-300"
                      : action.style === "success"
                      ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 focus:ring-green-300"
                      : action.style === "primary"
                      ? "bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 focus:ring-blue-300 shadow-lg shadow-blue-100"
                      : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 focus:ring-blue-300"
                  }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
