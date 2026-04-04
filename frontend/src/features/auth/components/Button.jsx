import React from "react";

<<<<<<< HEAD
/* ─────────────────────────────────────────────
   Spinner – isolated so Button stays readable
───────────────────────────────────────────── */
const Spinner = () => (
  <svg
    aria-hidden
    className="h-4 w-4 animate-spin shrink-0"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="3"
      className="opacity-25"
    />
    <path
      d="M21 12a9 9 0 00-9-9"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

/* ─────────────────────────────────────────────
   Variant config
   Each entry drives: base colors, hover, active,
   focus ring, shadow, and disabled appearance.
───────────────────────────────────────────── */
const VARIANTS = {
  primary: `
    bg-blue-600 text-white
    hover:bg-blue-700 hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(37,99,235,0.35)]
    active:bg-blue-800 active:translate-y-0 active:shadow-none
    focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
    shadow-sm
  `,
  outline: `
    border border-blue-600 text-blue-600 bg-white
    hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 hover:-translate-y-[1px]
    active:bg-blue-100 active:translate-y-0
    focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2
  `,
  ghost: `
    text-slate-600 bg-transparent
    hover:bg-slate-100 hover:text-slate-800
    active:bg-slate-200
    focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
  `,
  danger: `
    bg-red-600 text-white
    hover:bg-red-700 hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(220,38,38,0.30)]
    active:bg-red-800 active:translate-y-0 active:shadow-none
    focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
    shadow-sm
  `,
  success: `
    bg-green-600 text-white
    hover:bg-green-700 hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(22,163,74,0.30)]
    active:bg-green-800 active:translate-y-0 active:shadow-none
    focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2
    shadow-sm
  `,
};

const SIZES = {
  sm: "h-8  px-3.5 text-xs  gap-1.5 rounded-lg",
  md: "h-10 px-5   text-sm  gap-2   rounded-lg",
  lg: "h-11 px-6   text-sm  gap-2   rounded-xl",
  xl: "h-12 px-7   text-base gap-2.5 rounded-xl",
};

/* ─────────────────────────────────────────────
   Button
───────────────────────────────────────────── */
/**
 * Props:
 *  children   – label / content
 *  type       – "button" | "submit" | "reset"
 *  onClick    – click handler
 *  variant    – "primary" | "outline" | "ghost" | "danger" | "success"
 *  size       – "sm" | "md" | "lg" | "xl"
 *  disabled   – boolean
 *  loading    – boolean (shows spinner, blocks interaction)
 *  fullWidth  – boolean (w-full)
 *  iconLeft   – ReactNode rendered before label
 *  iconRight  – ReactNode rendered after label
 *  className  – additional classes for one-off overrides
=======
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
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
 */
const Button = ({
  children,
  type = "button",
  onClick,
  variant = "primary",
<<<<<<< HEAD
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  className = "",
}) => {
  const isDisabled = disabled || loading;
=======
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
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6

  return (
    <button
      type={type}
      onClick={onClick}
<<<<<<< HEAD
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={[
        /* layout & typography */
        "relative inline-flex items-center justify-center font-semibold",
        "select-none cursor-pointer",
        "outline-none focus-visible:outline-none",

        /* smooth transitions on transform + shadow + colors */
        "transition-all duration-200 ease-out",

        /* disabled */
        "disabled:opacity-55 disabled:cursor-not-allowed disabled:pointer-events-none",

        /* size */
        SIZES[size] ?? SIZES.md,

        /* variant */
        VARIANTS[variant] ?? VARIANTS.primary,

        /* width */
        fullWidth ? "w-full" : "",

        /* consumer overrides */
        className,
      ]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()}
    >
      {/* loading overlay — keeps button width stable and keeps loading label visible */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 rounded-[inherit] bg-inherit">
          <Spinner />
          <span>{children}</span>
        </span>
      )}

      {/* content row — invisible while loading to preserve intrinsic width */}
      <span
        className={`
          inline-flex items-center justify-center gap-[inherit]
          transition-opacity duration-150
          ${loading ? "invisible" : "visible"}
        `}
        aria-hidden={loading}
      >
        {iconLeft && <span className="shrink-0 -ml-0.5">{iconLeft}</span>}
        {children}
        {iconRight && <span className="shrink-0 -mr-0.5">{iconRight}</span>}
      </span>
=======
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
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
    </button>
  );
};

export default Button;
