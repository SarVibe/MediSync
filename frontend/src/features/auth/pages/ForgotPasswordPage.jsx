import React, { useState } from "react";
import { Link } from "react-router-dom";
import FormCard from "../components/FormCard";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { forgotPassword } from "../services/authService";

/**
 * ForgotPasswordPage – accepts an email and requests a password-reset link.
 *
 * On success, shows a confirmation banner.
 * On failure, shows a server error message.
 */

// ── Validation ─────────────────────────────────────────────────────────────
const validateEmail = (email) => {
  if (!email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email.";
  return "";
};

// ── Component ──────────────────────────────────────────────────────────────
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    setLoading(true);
    setServerError("");
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <FormCard
      title="Forgot Password?"
      subtitle="Enter your registered email and we'll send you a reset link."
    >
      {/* ── Success state ── */}
      {sent ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">
            📧
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-800 mb-1">
              Reset link sent!
            </p>
            <p className="text-sm text-slate-500">
              We've emailed a password reset link to{" "}
              <span className="font-medium text-blue-600">{email}</span>.
              Check your inbox (and spam folder).
            </p>
          </div>
          <Link
            to="/auth/login"
            className="mt-2 text-sm text-blue-600 font-medium hover:underline"
          >
            ← Back to Sign In
          </Link>
        </div>
      ) : (
        /* ── Form state ── */
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Server error */}
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
            value={email}
            onChange={handleChange}
            error={emailError}
            placeholder="you@example.com"
            required
          />

          <Button type="submit" fullWidth loading={loading} disabled={loading}>
            {loading ? "Sending…" : "Send Reset Link"}
          </Button>

          <p className="text-center text-sm text-slate-500 mt-1">
            Remembered your password?{" "}
            <Link
              to="/auth/login"
              className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
            >
              Sign In
            </Link>
          </p>
        </form>
      )}
    </FormCard>
  );
};

export default ForgotPasswordPage;
