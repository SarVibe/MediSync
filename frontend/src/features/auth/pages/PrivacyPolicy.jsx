import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Database,
  Eye,
  FileText,
  Lock,
  Mail,
  Shield,
  Users,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "collection",
    number: "01",
    icon: Database,
    title: "Information Collection",
    summary: "Only what's essential",
    content:
      "MediSync collects only the information required to provide authentication, appointment scheduling, and care coordination services. This includes basic personal details, medical identifiers, and communication preferences necessary for delivering quality healthcare services.",
  },
  {
    id: "security",
    number: "02",
    icon: Lock,
    title: "Data Security",
    summary: "AES-256 encryption",
    content:
      "Sensitive data is processed through secured services with industry-standard encryption (AES-256) in transit and at rest. Access is strictly controlled based on user roles with multi-factor authentication and regular security audits.",
  },
  {
    id: "sharing",
    number: "03",
    icon: Eye,
    title: "Data Sharing",
    summary: "No unauthorised access",
    content:
      "We do not share your personal data with unauthorised parties. Disclosures are limited to lawful requirements, operational necessities, and service-related needs with your explicit consent when required by applicable regulations.",
  },
  {
    id: "rights",
    number: "04",
    icon: Users,
    title: "Your Rights",
    summary: "Full control over your data",
    content:
      "You have the right to access, correct, or delete your personal information. Request data exports, withdraw consent, and lodge complaints with supervisory authorities as provided by data protection laws.",
  },
];

const KEY_PRINCIPLES = [
  "End-to-end encryption for all sensitive data",
  "Regular third-party security audits",
  "GDPR and HIPAA compliant practices",
  "Zero-knowledge architecture where applicable",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useIntersection(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, ...options },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, visible];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ section, index }) {
  const [ref, visible] = useIntersection();
  const [hovered, setHovered] = useState(false);
  const Icon = section.icon;

  return (
    <article
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transitionDelay: `${index * 60}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition:
          "opacity 0.45s ease, transform 0.45s ease, box-shadow 0.2s ease",
      }}
      className="relative overflow-hidden bg-white border border-gray-200 rounded-2xl group"
      aria-labelledby={`section-title-${section.id}`}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary transition-all duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? "scaleY(1)" : "scaleY(0.4)",
          transformOrigin: "top",
        }}
        aria-hidden="true"
      />

      <div className="p-6 sm:p-8 pl-7 sm:pl-9">
        <div className="flex items-start gap-5">
          {/* Number + icon */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2 pt-0.5">
            <span className="text-[11px] font-bold tracking-widest text-neutral-300 tabular-nums select-none">
              {section.number}
            </span>
            <div
              className="flex items-center justify-center transition-all duration-300 w-9 h-9 rounded-xl"
              style={{
                background: hovered
                  ? "var(--color-primary)"
                  : "color-mix(in srgb, var(--color-primary) 10%, white)",
              }}
              aria-hidden="true"
            >
              <Icon
                size={17}
                style={{ color: hovered ? "white" : "var(--color-primary)" }}
                className="transition-colors duration-300"
              />
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-2">
              <h2
                id={`section-title-${section.id}`}
                className="text-base font-semibold leading-snug sm:text-lg text-neutral-900"
              >
                {section.title}
              </h2>
              <span className="text-xs font-medium text-neutral-400">
                {section.summary}
              </span>
            </div>
            <p className="text-sm sm:text-[0.9375rem] text-neutral-600 leading-relaxed">
              {section.content}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function PrincipleItem({ principle, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <li
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-start gap-3 cursor-default group"
      style={{
        animationDelay: `${index * 80 + 200}ms`,
      }}
    >
      <CheckCircle2
        size={16}
        className="mt-0.5 flex-shrink-0 transition-all duration-300"
        style={{
          color: hovered ? "var(--color-primary)" : "#a3a3a3",
          transform: hovered ? "scale(1.15)" : "scale(1)",
        }}
        aria-hidden="true"
      />
      <span
        className="text-sm leading-relaxed transition-colors duration-200"
        style={{ color: hovered ? "#171717" : "#525252" }}
      >
        {principle}
      </span>
    </li>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PrivacyPolicy() {
  const [headerRef, headerVisible] = useIntersection();

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

      <div className="relative max-w-6xl px-4 py-10 mx-auto sm:px-6 lg:px-8 sm:py-14 lg:py-20">
        {/* ── Back link ───────────────────────────────────────────────────── */}
        <div className="mb-8 sm:mb-10">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform duration-200"
              aria-hidden="true"
            />
            Back to login
          </Link>
        </div>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <header
          ref={headerRef}
          className="mb-12 sm:mb-16"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-xl"
              style={{
                background:
                  "color-mix(in srgb, var(--color-primary) 12%, white)",
              }}
              aria-hidden="true"
            >
              <Shield size={20} style={{ color: "var(--color-primary)" }} />
            </div>
            <span className="text-xs font-bold tracking-[0.15em] text-neutral-400 uppercase select-none">
              Privacy Policy
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-neutral-900 leading-tight tracking-tight max-w-2xl">
            Your data, handled with&nbsp;care.
          </h1>
          <p className="max-w-xl mt-3 text-base leading-relaxed sm:mt-4 sm:text-lg text-neutral-500">
            How MediSync collects, uses, and protects your information with
            industry-leading security standards.
          </p>
          <p className="mt-3 text-xs text-neutral-400">
            Last updated: January 2024
          </p>
        </header>

        {/* ── Main grid ───────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-8 lg:gap-12 items-start">
          {/* ── Left — sections + footer ──────────────────────────────────── */}
          <div className="min-w-0 space-y-4 sm:space-y-5">
            {/* Intro card */}
            <div
              className="p-6 bg-white border border-gray-200 rounded-2xl sm:p-8"
              style={{ animationDelay: "0ms" }}
            >
              <p className="text-sm sm:text-[0.9375rem] text-neutral-700 leading-relaxed">
                At MediSync, we prioritise your privacy and are committed to
                maintaining the confidentiality and security of your medical and
                account data. Our comprehensive privacy framework ensures your
                information is handled with the utmost care and in full
                compliance with applicable healthcare regulations.
              </p>
            </div>

            {/* Section cards */}
            {SECTIONS.map((section, i) => (
              <SectionCard key={section.id} section={section} index={i} />
            ))}

            {/* Contact / CTA card */}
            <div
              className="overflow-hidden border rounded-2xl border-primary/20"
              style={{
                background:
                  "color-mix(in srgb, var(--color-primary) 4%, white)",
              }}
            >
              <div className="p-6 sm:p-8">
                <h3 className="mb-2 text-base font-semibold sm:text-lg text-neutral-900">
                  Need assistance?
                </h3>
                <p className="text-sm sm:text-[0.9375rem] text-neutral-600 mb-5 leading-relaxed">
                  If you have privacy concerns, need help with your data, or
                  want to understand how we protect your information, our
                  dedicated team is ready to help.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href="mailto:support@medisync.com"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <Mail size={15} aria-hidden="true" />
                    Contact Support
                  </a>
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 group"
                  >
                    <ArrowLeft
                      size={15}
                      className="group-hover:-translate-x-0.5 transition-transform duration-200"
                      aria-hidden="true"
                    />
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <p className="pt-2 pb-4 text-xs text-center text-neutral-400">
              © {new Date().getFullYear()} MediSync. All rights reserved. This
              policy is subject to change.
            </p>
          </div>

          {/* ── Right sidebar ─────────────────────────────────────────────── */}
          <aside
            className="space-y-4 lg:sticky lg:top-8"
            aria-label="Key principles sidebar"
          >
            {/* Key principles card */}
            <div className="p-5 bg-white border border-gray-200 rounded-2xl sm:p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <FileText
                  size={15}
                  style={{ color: "var(--color-primary)" }}
                  aria-hidden="true"
                />
                <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
                  Key Principles
                </h2>
              </div>

              <ul className="space-y-3.5">
                {KEY_PRINCIPLES.map((p, i) => (
                  <PrincipleItem key={i} principle={p} index={i} />
                ))}
              </ul>

              <div className="pt-5 mt-6 border-t border-neutral-100">
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-primary) 6%, white)",
                  }}
                >
                  <p className="text-xs text-neutral-600 mb-2.5 leading-relaxed">
                    <strong style={{ color: "var(--color-primary)" }}>
                      Questions?
                    </strong>{" "}
                    Our privacy team is here to help.
                  </p>
                  <a
                    href="mailto:privacy@medisync.com"
                    className="inline-flex items-center gap-1 text-xs font-medium transition-colors duration-200 rounded group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <Mail size={12} aria-hidden="true" />
                    privacy@medisync.com
                    <ChevronRight
                      size={12}
                      className="group-hover:translate-x-0.5 transition-transform duration-200"
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </div>
            </div>

            {/* Compliance badges */}
            <div className="p-5 bg-white border border-gray-200 rounded-2xl sm:p-6">
              <h2 className="mb-4 text-sm font-semibold text-neutral-900">
                Compliance
              </h2>
              <div className="space-y-2.5">
                {[
                  { label: "GDPR", desc: "EU Data Protection" },
                  { label: "HIPAA", desc: "Health Information Privacy" },
                  { label: "AES-256", desc: "Encryption Standard" },
                ].map(({ label, desc }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-3 py-2 transition-colors duration-150 rounded-lg cursor-default bg-neutral-50 hover:bg-neutral-100"
                  >
                    <span className="text-xs font-bold tracking-wide text-neutral-700">
                      {label}
                    </span>
                    <span className="text-xs text-neutral-400">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
