import React from "react";

/**
 * ConfirmationModal – generic overlay modal.
 *
 * Props:
 *  isOpen        – boolean
 *  onClose       – () => void
 *  onConfirm     – () => void
 *  title         – string
 *  message       – string | ReactNode
 *  confirmLabel  – string (default "Confirm")
 *  cancelLabel   – string (default "Cancel")
 *  confirmStyle  – "danger" | "primary" (default "primary")
 *  loading       – boolean
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel  = "Cancel",
  confirmStyle = "primary",
  loading = false,
  children,
}) => {
  if (!isOpen) return null;

  const confirmCls =
    confirmStyle === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-400"
      : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-sky-400" />

        <div className="px-6 pt-6 pb-7">
          <h2 className="text-lg font-bold text-slate-800 mb-2">{title}</h2>
          {message && (
            <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
          )}
          {children}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600
                hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none
                focus:ring-2 focus:ring-offset-1 disabled:opacity-60 ${confirmCls}`}
            >
              {loading ? "Processing…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
