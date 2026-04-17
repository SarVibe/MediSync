/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import FormCard from "../components/FormCard";
import { useAuth } from "../context/AuthContext";
import {
  validateEmail,
  validatePassword,
  validatePhone,
} from "../../../utils/validation";
import { getApiErrorMessage } from "../../../utils/api";
import { notifyApiSuccess, notifyError } from "../../../utils/toast";
import {
  AlertCircle as AlertCircleIcon,
  Phone as PhoneIcon,
  Shield as ShieldIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Tiny reusable atoms (self-contained so the
   file works standalone; swap for your globals)
───────────────────────────────────────────── */

/** Animated tab pill switcher */
const ModeSwitcher = ({ mode, onChange }) => (
  <div
    role="tablist"
    aria-label="Login mode"
    className="flex relative p-1 mb-6 rounded-xl bg-slate-100"
  >
    {/* sliding highlight */}
    <span
      aria-hidden
      className={`
        absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm
        transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]
        ${mode === "ADMIN" ? "translate-x-[calc(100%+8px)]" : "translate-x-0"}
      `}
    />
    {[
      { id: "PHONE", label: "Patient / Doctor", icon: PhoneIcon },
      { id: "ADMIN", label: "Admin", icon: ShieldIcon },
    ].map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        role="tab"
        aria-selected={mode === id}
        type="button"
        onClick={() => onChange(id)}
        className={`
          relative z-10 flex-1 flex items-center justify-center gap-1.5
          py-2 px-3 text-sm font-medium rounded-lg
          transition-colors duration-200 focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
          cursor-pointer
          ${mode === id ? "text-slate-800" : "text-slate-500 hover:text-slate-700"}
        `}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {label}
      </button>
    ))}
  </div>
);

/** Inline server-error banner */
const ErrorBanner = ({ message }) =>
  message ? (
    <div
      role="alert"
      className="
        flex items-start gap-2.5 rounded-xl border border-red-200
        bg-red-50 px-4 py-3 mb-4 text-sm text-red-700
        animate-[fadeSlideDown_0.2s_ease-out]
      "
    >
      <AlertCircleIcon className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
      {message}
    </div>
  ) : null;

/* ─────────────────────────────────────────────
   Main Page Component
───────────────────────────────────────────── */
const Login = () => {
  const PHONE_PREFIX = "+94";
  const PHONE_DIGIT_LIMIT = 9;

  const navigate = useNavigate();
  const { phoneAuthenticate, loginAdmin } = useAuth();

  const [mode, setMode] = useState("PHONE");
  const [mounted, setMounted] = useState(false);

  // Phone form state
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Admin form state
  const [adminForm, setAdminForm] = useState({ email: "", password: "" });
  const [adminErrors, setAdminErrors] = useState({});
  const [adminLoading, setAdminLoading] = useState(false);

  const [serverError, setServerError] = useState("");

  const mapLoginErrorMessage = (error, fallbackMessage) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      return getApiErrorMessage(error ,"Invalid credentials. Please check and try again.");
    }
    if (status >= 500) {
      return "Server error. Please try again in a moment.";
    }
    return getApiErrorMessage(error, fallbackMessage);
  };

  useEffect(() => {
    // stagger mount animation
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const switchMode = (next) => {
    setMode(next);
    setServerError("");
    setPhoneError("");
    setAdminErrors({});
  };

  const normalizePhoneInput = (value) =>
    String(value || "")
      .replace(/\D/g, "")
      .slice(0, PHONE_DIGIT_LIMIT);

  const handlePhoneChange = (e) => {
    setPhone(normalizePhoneInput(e.target.value));
    if (phoneError) setPhoneError("");
    setServerError("");
  };

  const handlePhoneKeyDown = (e) => {
    const allowedControlKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ];

    if (e.ctrlKey || e.metaKey || allowedControlKeys.includes(e.key)) {
      return;
    }

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  /* ── Phone submit ── */
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    const fullPhone = `${PHONE_PREFIX}${phone}`;
    const err = validatePhone(fullPhone);
    if (err) {
      setPhoneError(err);
      return;
    }
    try {
      setPhoneLoading(true);
      setServerError("");
      const res = await phoneAuthenticate(fullPhone.trim());
      notifyApiSuccess(res, "OTP sent successfully.");
      navigate("/auth/otp", {
        state: {
          phone: fullPhone.trim(),
          isNewUser: res?.data?.isNewUser ?? false,
          resendAfterSeconds: res?.data?.resendAfterSeconds ?? 60,
        },
      });
    } catch (err) {
      const msg = mapLoginErrorMessage(err, "Unable to send OTP.");
      setServerError(msg);
      notifyError(msg);
    } finally {
      setPhoneLoading(false);
    }
  };

  /* ── Admin form handlers ── */
  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminForm((p) => ({ ...p, [name]: value }));
    if (adminErrors[name]) setAdminErrors((p) => ({ ...p, [name]: "" }));
    setServerError("");
  };

  const validateAdminForm = () => {
    const errs = {
      email: validateEmail(adminForm.email),
      password: validatePassword(adminForm.password, { minLength: 1 }),
    };
    setAdminErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!validateAdminForm()) return;
    try {
      setAdminLoading(true);
      setServerError("");
      const res = await loginAdmin(adminForm.email.trim(), adminForm.password);
      notifyApiSuccess(res, "Admin login accepted. Verify OTP to continue.");
      navigate("/auth/admin-2fa", {
        state: {
          challengeToken: res?.data?.challengeToken,
          email: adminForm.email.trim(),
        },
      });
    } catch (err) {
      const msg = mapLoginErrorMessage(err, "Unable to continue admin login.");
      setServerError(msg);
      notifyError(msg);
    } finally {
      setAdminLoading(false);
    }
  };

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────────── */
  return (
    <FormCard
      title="Welcome Back"
      subtitle={
        mode === "PHONE"
          ? "Enter your phone number to receive a one-time code."
          : "Sign in with admin credentials to continue."
      }
      leftTitle={
        mode === "PHONE"
          ? "Access your\nMediSync account"
          : "Admin login\nwith extra protection"
      }
      leftSubtitle={
        mode === "PHONE"
          ? "Quick and secure sign-in for patients and doctors."
          : "Sign in and verify your identity for secure access."
      }
    >
      <div
        className={`transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
      >
        <ModeSwitcher mode={mode} onChange={switchMode} />

        <ErrorBanner message={serverError} />

        {mode === "PHONE" && (
          <form
            key="phone"
            onSubmit={handlePhoneSubmit}
            noValidate
            className="space-y-4 animate-[fadeSlideUp_0.25s_ease-out]"
          >
            <div className="flex flex-col gap-1 w-full">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-slate-700"
              >
                Phone Number
                <span className="text-red-500 ml-0.5">*</span>
              </label>

              <div
                className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white
                  outline-none transition-all duration-200
                  focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500
                  ${
                    phoneError
                      ? "border-red-400 bg-red-50"
                      : "border-slate-300 hover:border-blue-400"
                  }`}
              >
                <div className="flex gap-2 items-center">
                  <span className="select-none text-slate-500">
                    {PHONE_PREFIX}
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    onKeyDown={handlePhoneKeyDown}
                    placeholder="771234567"
                    autoComplete="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={PHONE_DIGIT_LIMIT}
                    required
                    className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {phoneError && (
                <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                  <span>⚠</span>
                  {phoneError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              fullWidth
              loading={phoneLoading}
              disabled={phoneLoading}
            >
              {phoneLoading ? "Sending OTP..." : "Send OTP"}
            </Button>

            <p className="pt-1 text-xs text-center text-slate-400">
              A 6-digit code will be sent via SMS.
            </p>
          </form>
        )}

        {mode === "ADMIN" && (
          <form
            key="admin"
            onSubmit={handleAdminSubmit}
            noValidate
            className="space-y-4 animate-[fadeSlideUp_0.25s_ease-out]"
          >
            <InputField
              id="email"
              name="email"
              label="Admin Email"
              type="email"
              value={adminForm.email}
              onChange={handleAdminChange}
              error={adminErrors.email}
              placeholder="admin@medisync.com"
              autoComplete="email"
              required
            />

            <div>
              <InputField
                id="password"
                name="password"
                label="Password"
                type="password"
                value={adminForm.password}
                onChange={handleAdminChange}
                error={adminErrors.password}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <div className="mt-1.5 text-right">
                <Link
                  to="/auth/forgot-password"
                  className="cursor-pointer text-xs text-blue-600 rounded transition-colors hover:text-blue-800 hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 px-3.5 py-3">
              <ShieldIcon className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
              <p className="text-xs leading-relaxed text-blue-700">
                You'll verify a one-time code on the next step.
              </p>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={adminLoading}
              disabled={adminLoading}
            >
              {adminLoading ? "Continuing..." : "Continue to 2FA"}
            </Button>
          </form>
        )}

        <div className="pt-4 mt-6 border-t border-slate-100">
          <p className="text-xs text-center text-slate-500">
            Need help?{" "}
            <a
              href="mailto:support@medisync.com"
              className="cursor-pointer text-blue-600 transition-colors hover:text-blue-800 hover:underline underline-offset-2"
            >
              Contact support
            </a>
          </p>
        </div>

        <p className="mt-6 text-xs text-center text-slate-400">
          By signing in you agree to our{" "}
          <Link
            to="/terms-of-service"
            className="cursor-pointer underline underline-offset-2 hover:text-slate-600"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy-policy"
            className="cursor-pointer underline underline-offset-2 hover:text-slate-600"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <style>{`
          @keyframes fadeSlideDown {
            from { opacity: 0; transform: translateY(-6px); }
            to   { opacity: 1; transform: translateY(0);    }
          }
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0);   }
          }
        `}</style>
      </div>
    </FormCard>
  );
};

export default Login;
