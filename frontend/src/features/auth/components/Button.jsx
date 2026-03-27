import React from "react";

/**
 * Button – reusable button component.
 *
 * Props:
 *  children  – button label
 *  type      – "button" | "submit" | "reset"
 *  onClick   – click handler (optional)
 *  variant   – "primary" | "outline"
 *  disabled  – boolean
 *  loading   – boolean (shows spinner)
 *  fullWidth – boolean
 */
const Button = ({
  children,
  type = "button",
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = false,
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 shadow-sm hover:shadow-md",
    outline:
      "border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 focus:ring-blue-400",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""}`}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
