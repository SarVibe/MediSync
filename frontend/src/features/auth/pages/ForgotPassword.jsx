import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import FormCard from "../components/FormCard";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import {
  validateConfirmPassword,
  validateEmail,
  validateOtp,
  validatePassword,
} from "../../../utils/validation";
import { getApiErrorMessage } from "../../../utils/api";
import { notifyApiSuccess, notifyError } from "../../../utils/toast";
import {
  AlertCircle as AlertCircleIcon,
  ArrowLeft as ArrowLeftIcon,
  CheckCircle as CheckCircleIcon,
  Check as CheckIcon,
  LockOpen as LockOpenIcon,
  Mail as MailIcon,
  Shield as ShieldIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const OTP_LENGTH = 6;

const STEPS = [
  { id: 1, label: "Email", short: "Verify email" },
  { id: 2, label: "Reset", short: "Set new password" },
  { id: 3, label: "Done", short: "Complete" },
];

/* ─────────────────────────────────────────────
   Password strength
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
  { label: "Too short", color: "bg-red-400", text: "text-red-500" },
  { label: "Weak", color: "bg-orange-400", text: "text-orange-500" },
  { label: "Fair", color: "bg-yellow-400", text: "text-yellow-600" },
  { label: "Strong", color: "bg-green-500", text: "text-green-600" },
];

const PasswordStrength = ({ password }) => {
  const level = getStrength(password);
  if (!password) return null;
  const meta = STRENGTH_META[level - 1] ?? STRENGTH_META[0];
  return (
    <div className="mt-1.5 space-y-1" aria-live="polite">
      <div className="flex gap-1">
        {STRENGTH_META.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < level ? meta.color : "bg-slate-100"}`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-medium ${meta.text}`}>{meta.label}</p>
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
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm animate-[fadeSlideDown_0.2s_ease-out] ${isError ? "bg-red-50 border-red-200 text-red-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}
    >
      {isError ? (
        <AlertCircleIcon className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
      ) : (
        <MailIcon className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
      )}
      <span>{message}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Step Tracker
───────────────────────────────────────────── */
const StepTracker = ({ currentStep }) => (
  <nav aria-label="Progress" className="mb-6">
    <ol className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const done = currentStep > step.id;
        const active = currentStep === step.id;
        const isLast = idx === STEPS.length - 1;

        return (
          <li
            key={step.id}
            className={`flex items-center ${isLast ? "" : "flex-1"}`}
          >
            {/* circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                transition-all duration-300 border-2
                ${
                  done
                    ? "bg-blue-600 border-blue-600 text-white"
                    : active
                      ? "bg-white border-blue-600 text-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                      : "bg-white border-slate-200 text-slate-400"
                }
              `}
              >
                {done ? <CheckIcon className="w-3.5 h-3.5" /> : step.id}
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap transition-colors duration-200 ${active ? "text-blue-600" : done ? "text-slate-500" : "text-slate-300"}`}
              >
                {step.label}
              </span>
            </div>

            {/* connector */}
            {!isLast && (
              <div className="flex-1 mx-2 mb-4">
                <div className="h-0.5 w-full bg-slate-100 relative overflow-hidden rounded-full">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full bg-blue-500 transition-all duration-500 ${done ? "w-full" : "w-0"}`}
                  />
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

/* ─────────────────────────────────────────────
   OTP digit cell
───────────────────────────────────────────── */
const OtpCell = ({
  index,
  value,
  inputRef,
  onChange,
  onKeyDown,
  onPaste,
  hasError,
}) => (
  <input
    ref={inputRef}
    id={`otp-cell-${index}`}
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    maxLength={1}
    value={value}
    autoComplete={index === 0 ? "one-time-code" : "off"}
    aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
    onChange={(e) => onChange(e, index)}
    onKeyDown={(e) => onKeyDown(e, index)}
    onPaste={onPaste}
    onFocus={(e) => e.target.select()}
    className={`
      w-full aspect-square max-w-[48px] text-center text-xl font-bold
      rounded-xl border-2 bg-white outline-none
      transition-all duration-150 ease-out caret-transparent cursor-text
      ${
        hasError
          ? "border-red-400 bg-red-50 text-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-200"
          : value
            ? "border-blue-500 bg-blue-50 text-blue-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            : "border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-slate-300"
      }
    `}
  />
);

/* ─────────────────────────────────────────────
   OTP Input group (6-cell)
───────────────────────────────────────────── */
const OtpInput = ({
  digits,
  onChange,
  onKeyDown,
  onPaste,
  inputRefs,
  hasError,
  error,
}) => (
  <fieldset>
    <legend className="text-sm font-medium text-slate-700 mb-2.5 flex items-center gap-1.5">
      <ShieldIcon className="w-4 h-4 text-blue-500" />
      One-Time Passcode
    </legend>
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${OTP_LENGTH}, minmax(0, 1fr))` }}
      role="group"
      aria-label="OTP digit inputs"
    >
      {digits.map((digit, i) => (
        <OtpCell
          key={i}
          index={i}
          value={digit}
          inputRef={(el) => (inputRefs.current[i] = el)}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          hasError={hasError}
        />
      ))}
    </div>
    {error && error.trim() && (
      <p
        role="alert"
        className="mt-2 flex items-center gap-1.5 text-xs text-red-600 animate-[fadeSlideDown_0.15s_ease-out]"
      >
        <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
        {error}
      </p>
    )}
  </fieldset>
);

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
const ForgotPassword = () => {
  const { requestForgotPasswordOtp, resetPassword } = useAuth();

  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef(Array.from({ length: OTP_LENGTH }, () => null));

  /* ── field update ── */
  const updateField = useCallback((name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setServerError("");
    setServerMessage("");
  }, []);

  const clearAlerts = () => {
    setServerError("");
    setServerMessage("");
  };

  /* ── OTP cell handlers ── */
  const focusCell = (i) => {
    const el = inputRefs.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleDigitChange = useCallback((e, idx) => {
    const raw = e.target.value.replace(/\D/g, "").slice(-1);
    setDigits((p) => {
      const n = [...p];
      n[idx] = raw;
      return n;
    });
    setErrors((p) => ({ ...p, otp: "" }));
    setServerError("");
    if (raw && idx < OTP_LENGTH - 1) focusCell(idx + 1);
  }, []);

  const handleDigitKeyDown = useCallback(
    (e, idx) => {
      if (e.key === "Backspace") {
        if (digits[idx]) {
          setDigits((p) => {
            const n = [...p];
            n[idx] = "";
            return n;
          });
        } else if (idx > 0) {
          setDigits((p) => {
            const n = [...p];
            n[idx - 1] = "";
            return n;
          });
          focusCell(idx - 1);
        }
      } else if (e.key === "ArrowLeft" && idx > 0) focusCell(idx - 1);
      else if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1)
        focusCell(idx + 1);
    },
    [digits],
  );

  const handleDigitPaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    [...pasted].forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    focusCell(Math.min(pasted.length, OTP_LENGTH - 1));
  }, []);

  /* ── validations ── */
  const validateStep1 = () => {
    const errs = { email: validateEmail(form.email) };
    setErrors(errs);
    return !errs.email;
  };

  const validateStep2 = () => {
    const otpValue = digits.join("");
    const errs = {
      email: validateEmail(form.email),
      otp: validateOtp(otpValue),
      newPassword: validatePassword(form.newPassword, {
        minLength: 8,
        enforceComplexity: true,
      }),
      confirmPassword: validateConfirmPassword(
        form.confirmPassword,
        form.newPassword,
      ),
    };
    setErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  /* ── Step 1: request OTP ── */
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;
    try {
      setLoading(true);
      clearAlerts();
      const res = await requestForgotPasswordOtp(form.email.trim());
      setServerMessage(
        res?.message || "If this account exists, an OTP has been sent.",
      );
      notifyApiSuccess(res, "Password reset OTP sent.");
      setStep(2);
      setTimeout(() => focusCell(0), 100);
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Unable to request password reset OTP.",
      );
      setServerError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: reset password ── */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    try {
      setLoading(true);
      clearAlerts();
      const res = await resetPassword({
        email: form.email.trim(),
        otp: digits.join("").trim(),
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setServerMessage(res?.message || "Password reset successful.");
      notifyApiSuccess(res, "Password reset successful.");
      setStep(3);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Unable to reset password.");
      setServerError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────────── */
  return (
    <FormCard
      title={
        step === 1
          ? "Forgot Password?"
          : step === 2
            ? "Reset Password"
            : "Password Updated"
      }
      subtitle={
        step === 1
          ? "Enter your admin email and we'll send a one-time code."
          : step === 2
            ? `Enter the code sent to ${form.email || "your email"} and choose a new password.`
            : "Your password has been changed successfully."
      }
      badge={`Step ${Math.min(step, 3)} of 3`}
      leftTitle={"Reset password\nwith confidence."}
      leftSubtitle="Recover your admin access in a secure, guided flow with OTP verification and policy-compliant password updates."
      footer={
        step < 3 && (
          <Link
            to="/auth/login"
            className="inline-flex cursor-pointer items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline underline-offset-2 transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        )
      }
    >
      {/* step tracker */}
      <StepTracker currentStep={step} />

      {/* alerts */}
      <div className="space-y-2.5 mb-4">
        <AlertBanner type="error" message={serverError} />
        <AlertBanner type="info" message={serverMessage} />
      </div>

      {/* ── Step 1: Email ── */}
      {step === 1 && (
        <form
          key="step1"
          onSubmit={handleRequestOtp}
          noValidate
          className="space-y-4 animate-[fadeSlideUp_0.25s_ease-out]"
        >
          <InputField
            id="email"
            name="email"
            label="Admin Email"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            error={errors.email}
            placeholder="admin@medisync.com"
            autoComplete="email"
            required
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
            size="lg"
          >
            {loading ? "Sending OTP…" : "Send Reset Code"}
          </Button>
        </form>
      )}

      {/* ── Step 2: OTP + new password ── */}
      {step === 2 && (
        <form
          key="step2"
          onSubmit={handleResetPassword}
          noValidate
          className="space-y-4 animate-[fadeSlideUp_0.25s_ease-out]"
        >
          {/* email (read-only display) */}
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5">
            <MailIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-sm text-slate-600 truncate">
              {form.email}
            </span>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                clearAlerts();
              }}
              className="ml-auto cursor-pointer text-xs text-blue-600 hover:text-blue-800 hover:underline underline-offset-2 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              Change
            </button>
          </div>

          {/* OTP cells */}
          <OtpInput
            digits={digits}
            onChange={handleDigitChange}
            onKeyDown={handleDigitKeyDown}
            onPaste={handleDigitPaste}
            inputRefs={inputRefs}
            hasError={!!errors.otp}
            error={errors.otp}
          />

          {/* new password */}
          <div>
            <InputField
              id="newPassword"
              name="newPassword"
              label="New Password"
              type="password"
              value={form.newPassword}
              onChange={(e) => updateField("newPassword", e.target.value)}
              error={errors.newPassword}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
            />
            <PasswordStrength password={form.newPassword} />
          </div>

          <InputField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
            placeholder="Repeat new password"
            autoComplete="new-password"
            required
          />

          {/* action row */}
          <div className="flex gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep(1);
                clearAlerts();
              }}
              iconLeft={<ArrowLeftIcon className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading || digits.join("").length < OTP_LENGTH}
              size="lg"
            >
              {loading ? "Resetting…" : "Reset Password"}
            </Button>
          </div>
        </form>
      )}

      {/* ── Step 3: Success ── */}
      {step === 3 && (
        <div className="flex flex-col items-center gap-5 py-6 text-center animate-[fadeSlideUp_0.3s_ease-out]">
          {/* animated check */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <span className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping opacity-30" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-800">
              Password updated!
            </p>
            <p className="text-sm text-slate-500 max-w-xs">
              Your admin password has been reset. You can now sign in with your
              new credentials.
            </p>
          </div>

          {/* tip box */}
          <div className="w-full flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-left">
            <ShieldIcon className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
            <p className="text-xs text-blue-700 leading-relaxed">
              For security, all active sessions have been invalidated. Please
              sign in again.
            </p>
          </div>

          <Link to="/auth/login" className="w-full cursor-pointer">
            <Button
              fullWidth
              variant="primary"
              size="lg"
              iconLeft={<LockOpenIcon className="w-4 h-4" />}
            >
              Go to Sign In
            </Button>
          </Link>
        </div>
      )}

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
    </FormCard>
  );
};

export default ForgotPassword;
