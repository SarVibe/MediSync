import React, { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormCard from "../components/FormCard";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { registerUser } from "../services/authService";
import {
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Stethoscope as StethoscopeIcon,
  User as UserIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Validation
───────────────────────────────────────────── */
const validators = {
  username: (v) => (!v.trim() ? "Username is required." : ""),
  email: (v) => {
    if (!v.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email.";
    return "";
  },
  password: (v) => {
    if (!v) return "Password is required.";
    if (v.length < 8) return "At least 8 characters required.";
    if (!/[A-Z]/.test(v)) return "Include at least one uppercase letter.";
    if (!/[0-9]/.test(v)) return "Include at least one number.";
    return "";
  },
  confirmPassword: (v, f) =>
    v !== f.password ? "Passwords do not match." : "",
  name: (v) => (!v.trim() ? "Full name is required." : ""),
  contactNumber: (v) => {
    if (!v.trim()) return "Contact number is required.";
    if (!/^\+?[0-9\s\-()]{7,15}$/.test(v))
      return "Enter a valid contact number.";
    return "";
  },
  specialization: (v) => (!v.trim() ? "Specialization is required." : ""),
  qualifications: (v) => (!v.trim() ? "Qualifications are required." : ""),
  experienceYears: (v) => {
    if (v === "" || v === undefined) return "Experience is required.";
    if (isNaN(v) || Number(v) < 0) return "Enter a valid number of years.";
    return "";
  },
};

const INITIAL_FORM = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "PATIENT",
  name: "",
  contactNumber: "",
  specialization: "",
  qualifications: "",
  experienceYears: "",
};

const PATIENT_FIELDS = [
  "username",
  "email",
  "password",
  "confirmPassword",
  "name",
  "contactNumber",
];
const DOCTOR_FIELDS = [
  "username",
  "email",
  "password",
  "confirmPassword",
  "name",
  "specialization",
  "qualifications",
  "experienceYears",
];

/* ─────────────────────────────────────────────
   Password strength meter
───────────────────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
const STRENGTH_META = [
  { label: "Too short", bar: "w-1/4", color: "bg-red-400" },
  { label: "Weak", bar: "w-2/4", color: "bg-orange-400" },
  { label: "Good", bar: "w-3/4", color: "bg-yellow-400" },
  { label: "Strong", bar: "w-full", color: "bg-green-500" },
];

const PasswordStrength = ({ password }) => {
  const level = getStrength(password);
  if (!password) return null;
  const meta = STRENGTH_META[level - 1] ?? STRENGTH_META[0];
  return (
    <div className="mt-1.5 space-y-1" aria-live="polite">
      <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${meta.bar} ${meta.color}`}
        />
      </div>
      <p
        className={`text-[11px] font-medium ${
          level <= 1
            ? "text-red-500"
            : level === 2
              ? "text-orange-500"
              : level === 3
                ? "text-yellow-600"
                : "text-green-600"
        }`}
      >
        {meta.label}
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Alert Banner
───────────────────────────────────────────── */
const AlertBanner = ({ type, message }) => {
  if (!message) return null;
  const isError = type === "error";
  return (
    <div
      role="alert"
      className={`
        flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm
        animate-[fadeSlideDown_0.2s_ease-out]
        ${
          isError
            ? "bg-red-50 border-red-200 text-red-700"
            : "bg-green-50 border-green-200 text-green-700"
        }
      `}
    >
      {isError ? (
        <AlertCircleIcon className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
      ) : (
        <CheckCircleIcon className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />
      )}
      <span>{message}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Role Card
───────────────────────────────────────────── */
const RoleCard = ({ role, active, onClick }) => {
  const isPatient = role === "PATIENT";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`
        group relative flex flex-col items-center gap-2.5 rounded-xl border-2 px-4 py-4
        cursor-pointer transition-all duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${
          active
            ? "border-blue-600 bg-blue-50 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
        }
      `}
    >
      {/* selected dot */}
      {active && (
        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-600 shadow-sm" />
      )}

      {/* icon bubble */}
      <span
        className={`
        w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200
        ${active ? "bg-blue-100" : "bg-slate-100 group-hover:bg-blue-50"}
      `}
      >
        {isPatient ? (
          <UserIcon
            className={`w-5 h-5 ${active ? "text-blue-600" : "text-slate-500 group-hover:text-blue-500"}`}
          />
        ) : (
          <StethoscopeIcon
            className={`w-5 h-5 ${active ? "text-blue-600" : "text-slate-500 group-hover:text-blue-500"}`}
          />
        )}
      </span>

      <span
        className={`text-sm font-semibold transition-colors duration-200 ${active ? "text-blue-700" : "text-slate-600 group-hover:text-slate-800"}`}
      >
        {isPatient ? "Patient" : "Doctor"}
      </span>
      <span
        className={`text-[11px] text-center leading-relaxed transition-colors duration-200 ${active ? "text-blue-500" : "text-slate-400"}`}
      >
        {isPatient
          ? "Book appointments & manage health"
          : "Manage patients & consultations"}
      </span>
    </button>
  );
};

/* ─────────────────────────────────────────────
   Section divider with label
───────────────────────────────────────────── */
const SectionDivider = ({ label, icon: Icon }) => (
  <div className="flex items-center gap-3 pt-1">
    <div className="flex-1 h-px bg-slate-100" />
    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </div>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

/* ─────────────────────────────────────────────
   SignupPage
───────────────────────────────────────────── */
const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const isPatient = form.role === "PATIENT";
  const isDoctor = form.role === "DOCTOR";

  /* ── handlers ── */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setServerError("");
    setSuccessMsg("");
  }, []);

  const switchRole = useCallback((role) => {
    setForm((p) => ({ ...p, role }));
    setErrors({});
    setServerError("");
    setSuccessMsg("");
  }, []);

  const validate = useCallback(() => {
    const fields = isPatient ? PATIENT_FIELDS : DOCTOR_FIELDS;
    const newErrors = {};
    for (const field of fields) {
      const fn = validators[field];
      if (fn) newErrors[field] = fn(form[field], form);
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  }, [form, isPatient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
        name: form.name,
        ...(isPatient && { contactNumber: form.contactNumber }),
        ...(isDoctor && {
          specialization: form.specialization,
          qualifications: form.qualifications,
          experienceYears: Number(form.experienceYears),
        }),
      };
      await registerUser(payload);
      setSuccessMsg("Account created! Redirecting to login…");
      setTimeout(() => navigate("/auth/login"), 2500);
    } catch (err) {
      setServerError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── success state overlay ── */
  const isSuccess = !!successMsg;

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────────── */
  return (
    <FormCard
      title="Create your account"
      subtitle="Join MediSync — your connected healthcare companion."
      badge="New account"
      leftTitle={"Create your\nMediSync account."}
      leftSubtitle="Set up secure access as a patient or doctor and get started with a connected care experience."
      footer={
        <span>
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-blue-600 font-medium hover:text-blue-800 hover:underline underline-offset-2 transition-colors"
          >
            Sign in
          </Link>
        </span>
      }
    >
      {/* ── success screen ── */}
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center animate-[fadeSlideDown_0.3s_ease-out]">
          <span className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircleIcon className="w-9 h-9 text-green-600" />
          </span>
          <div>
            <p className="text-base font-semibold text-slate-800">
              Account created!
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Redirecting you to login…
            </p>
          </div>
          <div className="w-32 h-1 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-green-500 animate-[progressBar_2.5s_linear_forwards]" />
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          {/* alerts */}
          <AlertBanner type="error" message={serverError} />

          {/* ── Role selector ── */}
          <fieldset>
            <legend className="text-sm font-medium text-slate-700 mb-2.5">
              Register as{" "}
              <span className="text-red-500" aria-hidden>
                *
              </span>
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {["PATIENT", "DOCTOR"].map((r) => (
                <RoleCard
                  key={r}
                  role={r}
                  active={form.role === r}
                  onClick={() => switchRole(r)}
                />
              ))}
            </div>
          </fieldset>

          {/* ── Account credentials ── */}
          <SectionDivider label="Account credentials" icon={InfoIcon} />

          <InputField
            id="username"
            name="username"
            label="Username"
            value={form.username}
            onChange={handleChange}
            error={errors.username}
            placeholder="johndoe"
            autoComplete="username"
            required
          />

          <InputField
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          {/* Password pair */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <InputField
                id="password"
                name="password"
                label="Password"
                type="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                required
              />
              <PasswordStrength password={form.password} />
            </div>
            <InputField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Repeat password"
              autoComplete="new-password"
              required
            />
          </div>

          {/* ── Role-specific info ── */}
          <SectionDivider
            label={isPatient ? "Patient information" : "Doctor information"}
            icon={isPatient ? UserIcon : StethoscopeIcon}
          />

          <InputField
            id="name"
            name="name"
            label="Full Name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="John Doe"
            autoComplete="name"
            required
          />

          {/* Patient extra */}
          {isPatient && (
            <div className="animate-[fadeSlideDown_0.2s_ease-out]">
              <InputField
                id="contactNumber"
                name="contactNumber"
                label="Contact Number"
                type="tel"
                value={form.contactNumber}
                onChange={handleChange}
                error={errors.contactNumber}
                placeholder="+94 77 000 0000"
                autoComplete="tel"
                required
              />
            </div>
          )}

          {/* Doctor extras */}
          {isDoctor && (
            <div className="flex flex-col gap-4 animate-[fadeSlideDown_0.2s_ease-out]">
              <InputField
                id="specialization"
                name="specialization"
                label="Specialization"
                value={form.specialization}
                onChange={handleChange}
                error={errors.specialization}
                placeholder="e.g. Cardiology"
                required
              />
              <InputField
                id="qualifications"
                name="qualifications"
                label="Qualifications"
                value={form.qualifications}
                onChange={handleChange}
                error={errors.qualifications}
                placeholder="e.g. MBBS, MD"
                required
              />
              <InputField
                id="experienceYears"
                name="experienceYears"
                label="Experience (Years)"
                type="number"
                value={form.experienceYears}
                onChange={handleChange}
                error={errors.experienceYears}
                placeholder="e.g. 5"
                min="0"
                required
              />
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
            size="lg"
          >
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>
      )}

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes progressBar {
          from { width: 0%;    }
          to   { width: 100%;  }
        }
      `}</style>
    </FormCard>
  );
};

export default Signup;
