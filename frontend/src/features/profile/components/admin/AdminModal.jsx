import React, { useEffect, useRef } from "react";
import { X, User, Mail, Phone, Calendar, Info, ShieldAlert } from "lucide-react";

/**
 * Reusable AdminModal component for displaying details.
 */
const AdminModal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  icon: Icon = Info, 
  iconBg = "bg-primary/20", 
  iconColor = "text-primary", 
  children,
  footer
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-[slideUp_0.2s_ease-out]"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${iconBg} ${iconColor}`}>
              <Icon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
              {subtitle && (
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end px-6 py-5 bg-neutral-50/50 border-t border-neutral-100 gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModal;
