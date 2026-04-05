<<<<<<< HEAD
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";
import BrandLogo from "./BrandLogo";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICES = [
  { label: "Online Consultation", href: "#" },
  { label: "Diagnostic Tests", href: "#" },
  { label: "Lab Bookings", href: "#" },
  { label: "Health Checkups", href: "#" },
];

const COMPANY = [
  { label: "About Us", href: "#" },
  { label: "Contact Us", href: "#" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
];

const SOCIALS = [
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaXTwitter, href: "#", label: "X" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FooterLink({ href, children }) {
  const isExternal = href.startsWith("http");
  const cls =
    "group inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded";

  if (isExternal || href === "#") {
    return (
      <a
        href={href}
        className={cls}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
        <span
          className="flex-shrink-0 w-1 h-1 transition-colors duration-200 rounded-full bg-neutral-600 group-hover:bg-primary"
          aria-hidden="true"
        />
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={cls}>
      <span
        className="flex-shrink-0 w-1 h-1 transition-colors duration-200 rounded-full bg-neutral-600 group-hover:bg-primary"
        aria-hidden="true"
      />
      {children}
    </Link>
  );
}

function SocialButton({ icon: Icon, href, label }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center transition-all duration-200 border w-9 h-9 rounded-xl bg-neutral-800 hover:bg-primary border-neutral-700/50 hover:border-primary text-neutral-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 group"
    >
      <Icon
        size={15}
        className="transition-transform duration-200 group-hover:scale-110"
        aria-hidden="true"
      />
    </a>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef(null);

  const validate = (val) => {
    if (!val.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Enter a valid email.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate(email);
    if (err) {
      setErrorMsg(err);
      setStatus("error");
      inputRef.current?.focus();
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    // Simulate API call
    await new Promise((res) => setTimeout(res, 1200));

    // Simulate occasional error for demo
    if (email.toLowerCase().includes("fail")) {
      setStatus("error");
      setErrorMsg("Subscription failed. Please try again.");
      return;
    }

    setStatus("success");
    setEmail("");
  };

  if (status === "success") {
    return (
      <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 animate-[fadeIn_0.3s_ease]">
        <CheckCircle2
          size={16}
          className="text-emerald-400 flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold text-emerald-400">
            You're subscribed!
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">
            Health tips will be delivered to your inbox.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-2 text-xs underline transition-colors rounded cursor-pointer text-neutral-500 hover:text-neutral-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
          >
            Subscribe another email
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Newsletter subscription"
    >
      <p className="mb-4 text-xs leading-relaxed text-neutral-400">
        Get curated health tips, platform updates, and wellness insights —
        weekly.
      </p>

      <div className="flex gap-2">
        <div className="flex-1 min-w-0">
          <input
            ref={inputRef}
            type="email"
            id="newsletter-email"
            autoComplete="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") {
                setStatus("idle");
                setErrorMsg("");
              }
            }}
            aria-label="Email address"
            aria-invalid={status === "error"}
            aria-describedby={
              status === "error" ? "newsletter-error" : undefined
            }
            disabled={status === "loading"}
            className="w-full bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors duration-200 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          aria-label="Subscribe to newsletter"
          className="flex items-center justify-center gap-1.5 bg-primary hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl px-4 py-2.5 transition-all duration-200 flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {status === "loading" ? (
            <Loader2
              size={13}
              className="animate-spin"
              aria-label="Subscribing…"
            />
          ) : (
            <>
              <span>Join</span>
              <ArrowRight size={12} aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      {status === "error" && errorMsg && (
        <p
          id="newsletter-error"
          role="alert"
          className="flex items-center gap-1.5 text-xs text-red-400 mt-2 animate-[fadeIn_0.2s_ease]"
        >
          <AlertCircle size={11} aria-hidden="true" />
          {errorMsg}
        </p>
      )}
    </form>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Footer = () => (
  <footer className="mt-auto bg-neutral-900" role="contentinfo">
    {/* ── Main grid ───────────────────────────────────────────────────────── */}
    <div className="px-6 pb-10 mx-auto max-w-7xl sm:px-8 md:px-12 lg:px-16 pt-14">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
        {/* Brand column */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 mb-5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
            aria-label="MediSync — home"
          >
            <BrandLogo size="md" />
          </Link>

          <p className="max-w-xs mb-6 text-sm leading-relaxed text-neutral-400">
            Connecting patients with the best healthcare specialists instantly.
            Your health, our priority.
          </p>

          <div
            className="flex gap-2"
            role="list"
            aria-label="Social media links"
          >
            {SOCIALS.map((s) => (
              <div key={s.label} role="listitem">
                <SocialButton {...s} />
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h2 className="mb-5 text-xs font-bold tracking-widest text-white uppercase">
            Services
          </h2>
          <ul className="space-y-3" role="list">
            {SERVICES.map(({ label, href }) => (
              <li key={label}>
                <FooterLink href={href}>{label}</FooterLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h2 className="mb-5 text-xs font-bold tracking-widest text-white uppercase">
            Company
          </h2>
          <ul className="space-y-3" role="list">
            {COMPANY.map(({ label, href }) => (
              <li key={label}>
                <FooterLink href={href}>{label}</FooterLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h2 className="mb-5 text-xs font-bold tracking-widest text-white uppercase">
            Newsletter
          </h2>
          <Newsletter />
        </div>
      </div>
    </div>

    {/* ── Bottom bar ──────────────────────────────────────────────────────── */}
    <div className="border-t border-neutral-800">
      <div className="flex flex-col items-center justify-between gap-3 px-6 py-5 mx-auto text-xs max-w-7xl sm:px-8 md:px-12 lg:px-16 sm:flex-row text-neutral-500">
        <p>
          &copy; {new Date().getFullYear()} MediSync Healthcare Platform. All
          rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link
            to="/privacy-policy"
            className="transition-colors duration-200 rounded hover:text-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Privacy
          </Link>
          <span className="select-none text-neutral-700" aria-hidden="true">
            ·
          </span>
          <Link
            to="/terms"
            className="transition-colors duration-200 rounded hover:text-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Terms
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
