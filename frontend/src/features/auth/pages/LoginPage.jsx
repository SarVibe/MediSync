import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormCard from "../components/FormCard";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { loginUser } from "../services/authService";

/**
 * LoginPage – authenticates a user and redirects by role.
 * Routes: PATIENT → /patient/dashboard
 *         DOCTOR  → /doctor/dashboard
 *         ADMIN   → /admin/dashboard
 */

// ── Validation helpers ────────────────────────────────────────────────────
const validateEmail = (email) => {
  if (!email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email.";
  return "";
};

const validatePassword = (password) => {
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  return "";
};

// ── Role → route mapping ──────────────────────────────────────────────────
const ROLE_ROUTES = {
  PATIENT: "/patient/dashboard",
  DOCTOR: "/doctor/dashboard",
  ADMIN: "/admin/dashboard",
};

// ── Component ─────────────────────────────────────────────────────────────
const LoginPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on edit
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const newErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    try {
      const data = await loginUser({ email: form.email, password: form.password });
      // Store token (adjust key to match your app's convention)
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.role?.toUpperCase();
      const destination = ROLE_ROUTES[role] || "/";
      navigate(destination);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Invalid email or password. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <FormCard
      title="Welcome back 👋"
      subtitle="Sign in to your MediSync account"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Server-level error */}
        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
            <span className="mt-0.5">🔴</span>
            <span>{serverError}</span>
          </div>
        )}

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

        <InputField
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••"
          required
        />

        {/* Forgot password link */}
        <div className="flex justify-end -mt-1">
          <Link
            to="/auth/forgot-password"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading} disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      {/* Sign-up link */}
      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          to="/auth/signup"
          className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
        >
          Create Account
        </Link>
      </p>
    </FormCard>
  );
};

export default LoginPage;
