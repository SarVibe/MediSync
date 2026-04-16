import React, { useEffect, useState } from "react";
import loginBg from "../../../assets/login-bg.jpeg";

/* ─────────────────────────────────────────────
   Icons
───────────────────────────────────────────── */
const ShieldIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

/** Glassmorphic pill badge for the left panel */
// eslint-disable-next-line no-unused-vars
const FeaturePill = ({ icon: Icon, label }) => (
  <div
    className="
      group flex items-center gap-2 rounded-full
      bg-white/10 hover:bg-white/18
      backdrop-blur-sm border border-white/20 hover:border-white/35
      px-3.5 py-1.5
      transition-all duration-200 ease-out
      cursor-default select-none
    "
  >
    <Icon className="w-3.5 h-3.5 text-sky-300 group-hover:text-sky-200 transition-colors duration-200" />
    <span className="text-xs font-medium transition-colors duration-200 text-white/80 group-hover:text-white/95">
      {label}
    </span>
  </div>
);

/** Animated stat counter shown in the left panel */
const StatItem = ({ value, label }) => (
  <div className="flex flex-col">
    <span className="text-2xl font-bold text-white">{value}</span>
    <span className="text-xs text-white/50 mt-0.5">{label}</span>
  </div>
);

/** Thin progress-style accent bar at the top of the card */
const AccentBar = () => (
  <div className="h-[3px] w-full bg-linear-to-r from-blue-600 via-sky-400 to-cyan-400 relative overflow-hidden">
    {/* shimmer sweep */}
    <span
      aria-hidden
      className="absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2.4s_ease-in-out_infinite]"
    />
  </div>
);

/** Brand lockup used in both panels */
const BrandLogo = ({ size = "md" }) => {
  const textSize = size === "lg" ? "text-xl" : "text-lg";

  return (
    <div className="flex items-center gap-2.5">
       <div className="flex overflow-hidden justify-center items-center w-11 h-11 rounded-2xl shadow-lg transition duration-300 group-hover:scale-105 group-hover:shadow-xl">
            <img
              src="/MediSync_Logo_3.png"
              alt="MediSync logo"
              className="object-cover w-full h-full"
            />
          </div>
      <span className={`font-bold tracking-tight ${textSize}`}>
        <span className="text-[#2563EB]">Medi</span>
        <span className="text-[#16A34A]">Sync</span>
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Left Decorative Panel
───────────────────────────────────────────── */
const LeftPanel = ({ title, subtitle }) => {
  const displayTitle = title ?? "Unified access\nfor modern care.";
  const displaySubtitle =
    subtitle ??
    "Secure, role-based authentication for patients, doctors, and administrators — all in one place.";

  return (
    <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col overflow-hidden">
      {/* background image */}
      <img
        src={loginBg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center scale-[1.02] transition-transform duration-700"
      />

      {/* layered gradients */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-950/85 via-blue-900/65 to-cyan-800/55" />
      <div className="absolute inset-0 to-transparent bg-linear-to-t from-slate-950/75 via-slate-900/20" />

      {/* decorative grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* decorative radial glow */}
      <div
        aria-hidden
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
        }}
      />

      {/* content */}
      <div className="flex relative z-10 flex-col justify-between px-10 py-10 h-full xl:px-14">
        {/* top: brand */}
        <BrandLogo size="lg" />

        {/* middle: hero */}
        <div>
          <div className="flex gap-2 items-center mb-4">
            <span className="block w-5 h-px bg-sky-400" />
            <p className="text-[10px] font-bold text-sky-300 uppercase tracking-[0.2em]">
              Healthcare Platform
            </p>
          </div>

          <h2 className="text-4xl xl:text-[2.75rem] font-bold text-white leading-[1.18] mb-4 whitespace-pre-line">
            {displayTitle}
          </h2>

          <p className="text-white/65 text-[0.9375rem] leading-relaxed max-w-88 mb-7">
            {displaySubtitle}
          </p>

          {/* feature pills */}
          <div className="flex flex-wrap gap-2 mb-10">
            {[
              { icon: ShieldIcon, label: "End-to-end encrypted" },
              { icon: LockIcon, label: "2FA protected" },
              { icon: CheckIcon, label: "HIPAA compliant" },
            ].map((f) => (
              <FeaturePill key={f.label} {...f} />
            ))}
          </div>

          {/* stats row */}
          <div className="flex gap-8 items-center pt-6 border-t border-white/10">
            <StatItem value="50k+" label="Active users" />
            <div className="w-px h-8 bg-white/15" />
            <StatItem value="99.9%" label="Uptime" />
            <div className="w-px h-8 bg-white/15" />
            <StatItem value="256-bit" label="Encryption" />
          </div>
        </div>

        {/* bottom: copyright */}
        <p className="text-white/30 text-[11px]">
          © {new Date().getFullYear()} MediSync · All rights reserved
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   FormCard – main export
───────────────────────────────────────────── */
/**
 * Props:
 *  title        – card heading (required)
 *  subtitle     – optional subheading text
 *  leftTitle    – override left-panel headline
 *  leftSubtitle – override left-panel body text
 *  badge        – optional small badge above the title (e.g. "Step 1 of 2")
 *  footer       – optional JSX rendered below the card
 *  children     – form / page content
 */
const FormCard = ({
  title,
  subtitle,
  leftTitle,
  leftSubtitle,
  badge,
  footer,
  children,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── left decorative panel ── */}
      <LeftPanel title={leftTitle} subtitle={leftSubtitle} />

      {/* ── right form column ── */}
      <div className="flex flex-col flex-1 justify-center items-center px-4 py-10 sm:px-8">
        {/* mobile brand (hidden on lg+) */}

        {/* card */}
        <div
          className={`
            w-full max-w-[432px]
            transition-all duration-500 ease-out
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}
        >
          <div
            className="
              bg-white rounded-2xl
              shadow-[0_4px_24px_rgba(15,23,42,0.08),0_1px_4px_rgba(15,23,42,0.06)]
              border border-slate-100
              overflow-hidden
            "
          >
            {/* shimmer accent bar */}
            <AccentBar />

            <div className="px-7 pt-7 pb-8 sm:px-8 sm:pt-8">
              {/* brand + badge row */}
              <div className="flex justify-between items-center mb-6">
                <BrandLogo size="md" />
                {badge && (
                  <span
                    className="
                      text-[11px] font-semibold text-blue-600
                      bg-blue-50 border border-blue-100
                      rounded-full px-2.5 py-0.5
                    "
                  >
                    {badge}
                  </span>
                )}
              </div>

              {/* heading block */}
              <div className="mb-6">
                <h1 className="text-[1.6rem] font-bold leading-tight tracking-tight">
                  <span className="text-[#2563EB]">{title.split(" ")[0]}</span>{" "}
                  <span className="text-[#16A34A]">{title.split(" ")[1]}</span>
                </h1>
                {subtitle && (
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* form content */}
              <div className="animate-[fadeUp_0.3s_ease-out_both]">
                {children}
              </div>
            </div>

            {/* card footer slot */}
            {footer && (
              <div className="px-7 py-4 border-t border-slate-100 bg-slate-50/70 sm:px-8">
                <div className="text-xs text-center text-slate-500">
                  {footer}
                </div>
              </div>
            )}
          </div>

          {/* below-card legal copy */}
          <p className="mt-5 text-center text-[11px] text-slate-400 leading-relaxed">
            By continuing you agree to our{" "}
            <a
              href="/terms-of-service"
              className="underline transition-colors underline-offset-2 hover:text-slate-600"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy-policy"
              className="underline transition-colors underline-offset-2 hover:text-slate-600"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      {/* keyframes */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(340%);  }
          100% { transform: translateX(340%);  }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
};

export default FormCard;
