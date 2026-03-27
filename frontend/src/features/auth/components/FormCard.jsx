import React from "react";

/**
 * FormCard – centered card container for auth pages.
 *
 * Props:
 *  title     – card heading
 *  subtitle  – optional subheading
 *  children  – form content
 */
const FormCard = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50 px-4 py-10">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-sky-100 rounded-full mix-blend-multiply blur-3xl opacity-40 pointer-events-none" />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400" />

        <div className="px-8 pt-8 pb-10">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-blue-700 tracking-tight">
              MediSync
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-800 mb-1">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mb-6">{subtitle}</p>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

export default FormCard;
