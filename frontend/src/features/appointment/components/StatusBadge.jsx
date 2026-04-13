import React from "react";

/**
 * StatusBadge displays a color-coded pill for appointment status.
 */
const STATUS_STYLES = {
  BOOKED: "bg-blue-100 text-blue-700 border-blue-200",
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-600 border-red-200",
  REJECTED: "bg-rose-100 text-rose-700 border-rose-200",
  ACCEPTED: "bg-teal-100 text-teal-700 border-teal-200",
  EXPIRED: "bg-slate-200 text-slate-700 border-slate-300",
};

const STATUS_ICONS = {
  BOOKED: "*",
  PENDING: "*",
  COMPLETED: "*",
  CANCELLED: "*",
  REJECTED: "*",
  ACCEPTED: "*",
  EXPIRED: "*",
};

const StatusBadge = ({ status }) => {
  const key = status?.toUpperCase() || "PENDING";
  const style = STATUS_STYLES[key] || "bg-slate-100 text-slate-600 border-slate-200";
  const icon = STATUS_ICONS[key] || ".";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
    >
      <span>{icon}</span>
      {key.charAt(0) + key.slice(1).toLowerCase()}
    </span>
  );
};

export default StatusBadge;
