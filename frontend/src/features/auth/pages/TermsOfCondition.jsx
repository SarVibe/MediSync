import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  Mail,
  Shield,
  Users,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "acceptance",
    number: "01",
    icon: CheckCircle2,
    title: "Acceptance of Terms",
    content:
      "By accessing or using MediSync, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the platform. These terms constitute a legally binding agreement between you and MediSync.",
  },
  {
    id: "eligibility",
    number: "02",
    icon: Users,
    title: "Eligibility & Account Registration",
    content:
      "You must be at least 18 years old to use MediSync. By registering, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
  },
  {
    id: "security",
    number: "03",
    icon: Shield,
    title: "Security & Data Protection",
    content:
      "MediSync employs industry-standard security measures to protect your personal information. You are responsible for maintaining the security of your device and promptly notifying us of any unauthorised access. Never share your OTPs, passwords, or security codes with anyone.",
  },
  {
    id: "userObligations",
    number: "04",
    icon: FileText,
    title: "User Obligations",
    content:
      "You agree to use MediSync only for lawful purposes and in accordance with these terms. You shall not: (a) violate any applicable laws or regulations; (b) impersonate any person or entity; (c) interfere with the platform's security features; (d) upload malicious code or content.",
  },
  {
    id: "modifications",
    number: "05",
    icon: Clock,
    title: "Modifications to Terms",
    content:
      "MediSync reserves the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the modified terms.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useIntersection(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ─── Accordion Item ───────────────────────────────────────────────────────────

function AccordionItem({ section, isOpen, onToggle, index }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  const [itemRef, visible] = useIntersection();
  const Icon = section.icon;

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      ref={itemRef}
      id={section.id}
      className="overflow-hidden transition-shadow duration-200 bg-white border border-gray-200 rounded-2xl hover:shadow-sm"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.4s ease ${index * 55}ms, transform 0.4s ease ${index * 55}ms, box-shadow 0.2s ease`,
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`content-${section.id}`}
        className="flex items-center justify-between w-full gap-4 px-6 py-5 text-left transition-colors duration-150 cursor-pointer sm:px-8 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 hover:bg-neutral-50/60"
      >
        {/* Left: number + icon + title */}
        <div className="flex items-center min-w-0 gap-4">
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] font-bold tracking-widest text-neutral-300 select-none tabular-nums">
              {section.number}
            </span>
            <div
              className="flex items-center justify-center w-8 h-8 transition-all duration-300 rounded-lg"
              style={{
                background: isOpen
                  ? "var(--color-primary)"
                  : "color-mix(in srgb, var(--color-primary) 10%, white)",
              }}
              aria-hidden="true"
            >
              <Icon
                size={15}
                style={{ color: isOpen ? "white" : "var(--color-primary)" }}
                className="transition-colors duration-300"
              />
            </div>
          </div>
          <h2 className="text-sm font-semibold leading-snug truncate sm:text-base text-neutral-900">
            {section.title}
          </h2>
        </div>

        {/* Chevron */}
        <div
          className="flex-shrink-0 transition-transform duration-300 text-neutral-400"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          <ChevronDown size={17} />
        </div>
      </button>

      {/* Animated body */}
      <div
        id={`content-${section.id}`}
        role="region"
        aria-labelledby={`btn-${section.id}`}
        style={{
          height,
          overflow: "hidden",
          transition: "height 0.32s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          ref={contentRef}
          className="px-6 sm:px-8 pb-6 pl-[4.5rem] sm:pl-[5rem]"
        >
          <p className="text-sm sm:text-[0.9375rem] text-neutral-600 leading-relaxed">
            {section.content}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TermsOfCondition() {
  // First section open by default
  const [openSections, setOpenSections] = useState({ acceptance: true });
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState(false);

  const [heroRef, heroVisible] = useIntersection(0.05);

  const toggle = useCallback((id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const scrollTo = useCallback((id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Also open that section
    setOpenSections((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handleAcceptClick = (e) => {
    if (!accepted) {
      e.preventDefault();
      setAcceptError(true);
      setTimeout(() => setAcceptError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ── Subtle grid background ──────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-neutral-900) 1px, transparent 1px), linear-gradient(90deg, var(--color-neutral-900) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div>
        <div className="max-w-6xl px-4 py-12 mx-auto sm:px-6 lg:px-8 sm:py-16 lg:py-20">
          {/* Back link */}
          <div className="mb-8">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <ArrowLeft
                size={13}
                className="group-hover:-translate-x-0.5 transition-transform duration-200"
                aria-hidden="true"
              />
              Back to login
            </Link>
          </div>

          <div
            ref={heroRef}
            className="max-w-2xl"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
          >
            {/* Label */}
            <div className="flex items-center gap-2.5 mb-5">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-primary) 14%, white)",
                }}
                aria-hidden="true"
              >
                <FileText size={17} style={{ color: "var(--color-primary)" }} />
              </div>
              <span className="text-xs font-bold tracking-[0.15em] text-neutral-400 uppercase select-none">
                Terms &amp; Conditions
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-neutral-900 leading-tight tracking-tight">
              The rules that keep everyone&nbsp;safe.
            </h1>
            <p className="max-w-lg mt-3 text-base leading-relaxed sm:text-lg text-neutral-500">
              Please read these terms carefully before using MediSync. They
              govern how our platform works and what we expect from each other.
            </p>

            <div className="flex flex-wrap gap-5 mt-5 text-xs font-medium text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Clock size={12} aria-hidden="true" /> Effective immediately
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={12} aria-hidden="true" /> GDPR compliant
              </span>
              <span className="select-none text-neutral-300">·</span>
              <span>Last updated: January 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl px-4 py-10 mx-auto sm:px-6 lg:px-8 sm:py-14">
        <div className="grid lg:grid-cols-[200px_1fr] xl:grid-cols-[220px_1fr] gap-8 lg:gap-12 items-start">
          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside
            className="hidden lg:block lg:sticky lg:top-8"
            aria-label="Page navigation"
          >
            <nav className="space-y-0.5" aria-label="Terms sections">
              <p className="text-[10px] font-bold tracking-[0.14em] text-neutral-400 uppercase mb-3 px-2">
                Sections
              </p>
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm text-neutral-500 hover:text-neutral-900 hover:bg-white transition-all duration-150 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <Icon
                      size={13}
                      className="flex-shrink-0 transition-colors duration-200 group-hover:text-primary"
                      aria-hidden="true"
                    />
                    <span className="leading-snug truncate">{s.title}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-5 mt-6 border-t border-neutral-200">
              <a
                href="mailto:support@medisync.com"
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-primary transition-colors duration-200 px-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                <Mail size={12} aria-hidden="true" />
                support@medisync.com
                <ExternalLink
                  size={10}
                  className="transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </a>
            </div>
          </aside>

          {/* ── Main content ────────────────────────────────────────────── */}
          <main className="min-w-0 space-y-4">
            {/* Intro */}
            <div className="p-6 bg-white border border-gray-200 rounded-2xl sm:p-8">
              <p className="text-sm sm:text-[0.9375rem] text-neutral-700 leading-relaxed">
                Welcome to{" "}
                <strong
                  className="font-semibold"
                  style={{ color: "var(--color-primary)" }}
                >
                  MediSync
                </strong>
                . These Terms and Conditions govern your use of our healthcare
                platform. By accessing or using our services, you acknowledge
                that you have read, understood, and agree to be bound by these
                terms.
              </p>
            </div>

            {/* Accordion sections */}
            {SECTIONS.map((section, i) => (
              <AccordionItem
                key={section.id}
                section={section}
                index={i}
                isOpen={!!openSections[section.id]}
                onToggle={() => toggle(section.id)}
              />
            ))}

            {/* Liability note */}
            <div
              className="p-6 border rounded-2xl border-amber-200 sm:p-7"
              style={{ background: "color-mix(in srgb, #f59e0b 5%, white)" }}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  <AlertCircle size={16} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-1.5">
                    Limitation of Liability
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    MediSync provides healthcare coordination services but does
                    not replace professional medical advice. Always consult
                    qualified healthcare providers for medical decisions. We are
                    not liable for damages arising from use of our platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Acceptance card */}
            <div className="p-6 space-y-5 bg-white border border-gray-200 rounded-2xl sm:p-8">
              <h3 className="text-sm font-semibold text-neutral-900">
                Ready to proceed?
              </h3>

              {/* Checkbox */}
              <label
                htmlFor="acceptTerms"
                className="flex items-start gap-3.5 cursor-pointer group"
              >
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={accepted}
                    onChange={(e) => {
                      setAccepted(e.target.checked);
                      if (e.target.checked) setAcceptError(false);
                    }}
                    className="sr-only peer"
                  />
                  {/* Custom checkbox */}
                  <div
                    className="flex items-center justify-center w-5 h-5 transition-all duration-200 border-2 rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30"
                    style={{
                      borderColor: accepted
                        ? "var(--color-primary)"
                        : acceptError
                          ? "#ef4444"
                          : "#d4d4d4",
                      background: accepted ? "var(--color-primary)" : "white",
                    }}
                    aria-hidden="true"
                  >
                    {accepted && (
                      <CheckCircle2 size={13} className="text-white" />
                    )}
                  </div>
                </div>
                <span className="text-sm leading-relaxed transition-colors duration-150 text-neutral-700 group-hover:text-neutral-900">
                  I have read and agree to the Terms and Conditions, Privacy
                  Policy, and any applicable service agreements.
                </span>
              </label>

              {/* Inline error */}
              {acceptError && (
                <div
                  role="alert"
                  className="flex items-center gap-2 text-xs text-red-600 font-medium animate-[fadeIn_0.2s_ease]"
                >
                  <AlertCircle size={13} aria-hidden="true" />
                  Please accept the terms before continuing.
                </div>
              )}

              <div className="flex flex-col gap-3 pt-1 border-t sm:flex-row border-neutral-100">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-700 font-medium hover:bg-neutral-50 active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 group"
                >
                  <ArrowLeft
                    size={14}
                    className="group-hover:-translate-x-0.5 transition-transform duration-200"
                    aria-hidden="true"
                  />
                  Back
                </Link>
                <Link
                  to={accepted ? "/auth/register" : "#"}
                  onClick={handleAcceptClick}
                  aria-disabled={!accepted}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  style={{
                    background: accepted ? "var(--color-primary)" : "#e5e5e5",
                    color: accepted ? "white" : "#a3a3a3",
                    cursor: accepted ? "pointer" : "not-allowed",
                    transform: "scale(1)",
                  }}
                  onMouseEnter={(e) =>
                    accepted && (e.currentTarget.style.opacity = "0.9")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <CheckCircle size={14} aria-hidden="true" />
                  Accept &amp; Continue
                </Link>
              </div>
            </div>

            {/* Contact card */}
            <div className="p-6 text-center border border-gray-200 bg-neutral-50 rounded-2xl sm:p-7">
              <div
                className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-xl"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-primary) 10%, white)",
                }}
                aria-hidden="true"
              >
                <Mail size={18} style={{ color: "var(--color-primary)" }} />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-neutral-900">
                Have questions?
              </h3>
              <p className="mb-3 text-xs leading-relaxed text-neutral-500">
                Our legal team is here to help you understand these terms.
              </p>
              <a
                href="mailto:support@medisync.com"
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                style={{ color: "var(--color-primary)" }}
              >
                support@medisync.com
                <ExternalLink
                  size={13}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                  aria-hidden="true"
                />
              </a>
            </div>

            {/* Footer */}
            <p className="pb-4 text-xs text-center text-neutral-400">
              © {new Date().getFullYear()} MediSync. All rights reserved. These
              terms are subject to change.
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
