import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormCard from "../components/FormCard";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { registerUser } from "../services/authService";

/**
 * SignupPage – registers a new PATIENT or DOCTOR.
 *
 * Common fields  : username, email, password, confirmPassword, role
 * Patient extras : name, contactNumber
 * Doctor extras  : name, specialization, qualifications, experienceYears
 */

// ── Validation helpers ────────────────────────────────────────────────────
const validators = {
  username: (v) => (!v.trim() ? "Username is required." : ""),
  email: (v) => {
    if (!v.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email.";
    return "";
  },
  password: (v) => {
    if (!v) return "Password is required.";
    if (v.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(v)) return "Include at least one uppercase letter.";
    if (!/[0-9]/.test(v)) return "Include at least one number.";
    return "";
  },
  confirmPassword: (v, form) =>
    v !== form.password ? "Passwords do not match." : "",
  name: (v) => (!v.trim() ? "Full name is required." : ""),
  contactNumber: (v) => {
    if (!v.trim()) return "Contact number is required.";
    if (!/^\+?[0-9\s\-()]{7,15}$/.test(v)) return "Enter a valid contact number.";
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
  // Patient fields
  name: "",
  contactNumber: "",
  // Doctor fields
  specialization: "",
  qualifications: "",
  experienceYears: "",
};

// ── Component ─────────────────────────────────────────────────────────────
const SignupPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
    if (successMsg) setSuccessMsg("");
  };

  const getRequiredFields = () => {
    const base = ["username", "email", "password", "confirmPassword", "name"];
    if (form.role === "PATIENT") return [...base, "contactNumber"];
    if (form.role === "DOCTOR")
      return [...base, "specialization", "qualifications", "experienceYears"];
    return base;
  };

  const validate = () => {
    const fields = getRequiredFields();
    const newErrors = {};
    for (const field of fields) {
      const fn = validators[field];
      if (fn) newErrors[field] = fn(form[field], form);
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    try {
      // Build payload with only the relevant fields
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
        name: form.name,
        ...(form.role === "PATIENT" && {
          contactNumber: form.contactNumber,
        }),
        ...(form.role === "DOCTOR" && {
          specialization: form.specialization,
          qualifications: form.qualifications,
          experienceYears: Number(form.experienceYears),
        }),
      };

      await registerUser(payload);
      setSuccessMsg("Account created successfully! Redirecting to login…");
      setTimeout(() => navigate("/auth/login"), 2500);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Registration failed. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isPatient = form.role === "PATIENT";
  const isDoctor = form.role === "DOCTOR";

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <FormCard
      title="Create Account"
      subtitle="Join MediSync — your healthcare companion"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Server error */}
        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
            <span className="mt-0.5">🔴</span>
            <span>{serverError}</span>
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-start gap-2">
            <span className="mt-0.5">✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Role selector ── */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">
            Register as <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {["PATIENT", "DOCTOR"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, role: r }));
                  setErrors({});
                }}
                className={`py-2.5 rounded-lg border text-sm font-semibold transition-all duration-200
                  ${
                    form.role === r
                      ? "bg-blue-600 text-white border-blue-600 shadow"
                      : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                  }`}
              >
                {r === "PATIENT" ? "🧑‍⚕️ Patient" : "👨‍⚕️ Doctor"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Common fields ── */}
        <InputField
          id="username"
          label="Username"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
          placeholder="johndoe"
          required
        />

        <InputField
          id="email"
          label="Email Address"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="you@example.com"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            id="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Min. 8 chars"
            required
          />
          <InputField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Repeat password"
            required
          />
        </div>

        {/* ── Role-specific fields ── */}
        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">
            {isPatient ? "Patient Information" : "Doctor Information"}
          </p>

          <div className="flex flex-col gap-4">
            <InputField
              id="name"
              label="Full Name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="John Doe"
              required
            />

            {/* Patient-only */}
            {isPatient && (
              <InputField
                id="contactNumber"
                label="Contact Number"
                type="tel"
                value={form.contactNumber}
                onChange={handleChange}
                error={errors.contactNumber}
                placeholder="+91 98765 43210"
                required
              />
            )}

            {/* Doctor-only */}
            {isDoctor && (
              <>
                <InputField
                  id="specialization"
                  label="Specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  error={errors.specialization}
                  placeholder="e.g. Cardiology"
                  required
                />
                <InputField
                  id="qualifications"
                  label="Qualifications"
                  value={form.qualifications}
                  onChange={handleChange}
                  error={errors.qualifications}
                  placeholder="e.g. MBBS, MD"
                  required
                />
                <InputField
                  id="experienceYears"
                  label="Experience (Years)"
                  type="number"
                  value={form.experienceYears}
                  onChange={handleChange}
                  error={errors.experienceYears}
                  placeholder="e.g. 5"
                  required
                />
              </>
            )}
          </div>
        </div>

        <Button type="submit" fullWidth loading={loading} disabled={loading}>
          {loading ? "Creating Account…" : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
        >
          Sign In
        </Link>
      </p>
    </FormCard>
  );
};

export default SignupPage;
