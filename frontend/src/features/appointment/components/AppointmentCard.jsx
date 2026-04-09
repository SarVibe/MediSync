import React from "react";
import StatusBadge from "./StatusBadge";

const AppointmentCard = ({ appointment, actions = [], viewMode = "patient" }) => {
  const {
    doctorName,
    doctorSpecialization,
    doctorQualifications,
    doctorExperienceYears,
    patientName,
    date,
    time,
    reason,
    cancellationReason,
    statusReasonType,
    status,
  } = appointment;

  const primaryName = viewMode === "patient" ? doctorName : patientName;
  const primaryLabel = viewMode === "patient" ? "Doctor" : "Patient";
  const secondaryDetails =
    viewMode === "patient"
      ? [
          doctorSpecialization,
          doctorQualifications,
          typeof doctorExperienceYears === "number"
            ? `${doctorExperienceYears} year${doctorExperienceYears === 1 ? "" : "s"} exp`
            : "",
        ]
          .filter(Boolean)
          .join(" | ")
      : "";
  const rejectedByLabel =
    statusReasonType === "DOCTOR_REJECT"
      ? "Doctor"
      : statusReasonType === "ADMIN_REJECT"
        ? "Admin"
        : null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div
        className={`h-1 w-full ${
          status?.toUpperCase() === "COMPLETED"
            ? "bg-green-400"
            : status?.toUpperCase() === "CANCELLED" || status?.toUpperCase() === "REJECTED"
              ? "bg-red-400"
              : status?.toUpperCase() === "PENDING" || status?.toUpperCase() === "BOOKED"
                ? "bg-yellow-400"
                : "bg-blue-500"
        }`}
      />

      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {primaryLabel}
            </p>
            <h3 className="truncate text-base font-bold text-slate-800">
              {primaryName || "-"}
            </h3>
            {secondaryDetails && (
              <p className="mt-1 truncate text-sm text-slate-500">{secondaryDetails}</p>
            )}
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="text-blue-500">Date</span>
            <span>{date || "-"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-blue-500">Time</span>
            <span>{time || "-"}</span>
          </div>
          {reason && (
            <div className="col-span-2 flex items-start gap-1.5">
              <span className="text-blue-500">Reason</span>
              <span className="leading-snug">{reason}</span>
            </div>
          )}
          {status?.toUpperCase() === "RESCHEDULED" && statusReasonType === "DOCTOR_RESCHEDULED" && (
            <div className="col-span-2 flex items-start gap-1.5">
              <span className="text-amber-500">Update</span>
              <span className="leading-snug">
                Doctor rescheduled this appointment. Please accept, cancel, or reschedule.
              </span>
            </div>
          )}
          {(status?.toUpperCase() === "CANCELLED" || status?.toUpperCase() === "REJECTED") && cancellationReason && (
            <div className="col-span-2 flex items-start gap-1.5">
              <span className="text-red-500">Status Reason</span>
              <span className="leading-snug">
                {status?.toUpperCase() === "REJECTED" && rejectedByLabel
                  ? `Rejected by ${rejectedByLabel}: ${cancellationReason}`
                  : cancellationReason}
              </span>
            </div>
          )}
        </div>

        {actions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => action.onClick(appointment)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  action.style === "danger"
                    ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-300"
                    : action.style === "success"
                      ? "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 focus:ring-green-300"
                      : action.style === "primary"
                        ? "border border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 focus:ring-blue-300"
                        : "border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 focus:ring-blue-300"
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
