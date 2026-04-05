import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormCard from "../components/FormCard";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../../../utils/api";
import { validatePhone } from "../../../utils/validation";
import { notifyApiSuccess, notifyError } from "../../../utils/toast";
import {
  AlertCircle as AlertCircleIcon,
  ArrowLeft as ArrowLeftIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  ShieldCheck as ShieldCheckIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

/* ─────────────────────────────────────────────
   Alert Banner
───────────────────────────────────────────── */
const AlertBanner = ({ type = "error", message }) => {
  if (!message) return null;

  const styles = {
    error: "bg-red-50   border-red-200   text-red-700",
    success: "bg-green-50 border-green-200 text-green-700",
  };
  const Icon = type === "error" ? AlertCircleIcon : CheckCircleIcon;
  const iconColor = type === "error" ? "text-red-500" : "text-green-500";

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm
        animate-[fadeSlideDown_0.2s_ease-out]
        ${styles[type]}
      `}
    >
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
      <span>{message}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Individual OTP digit cell
───────────────────────────────────────────── */
const OtpCell = ({
  index,
  value,
  inputRef,
  onChange,
  onKeyDown,
  onPaste,
  hasError,
  isComplete,
}) => (
  <input
    ref={inputRef}
    id={`otp-${index}`}
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
      w-full aspect-square max-w-[52px] text-center text-xl font-bold
      rounded-xl border-2 bg-white outline-none
      transition-all duration-150 ease-out
      caret-slate-500 focus:caret-blue-600 cursor-text
      ${
        hasError
          ? "border-red-400 bg-red-50 text-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-200"
          : isComplete
            ? "border-green-400 bg-green-50 text-green-700"
            : value
              ? "border-blue-500 bg-blue-50 text-blue-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              : "border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-slate-300"
      }
    `}
  />
);

/* ─────────────────────────────────────────────
   Countdown / Resend row
───────────────────────────────────────────── */
const ResendRow = ({ cooldown, isResending, onResend }) => (
  <div className="flex items-center justify-between text-sm pt-1">
    {/* resend button */}
    <button
      type="button"
      onClick={onResend}
      disabled={isResending || cooldown > 0}
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-md
        transition-all duration-200 focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
        px-1 py-0.5 -mx-1
        ${
          cooldown > 0 || isResending
            ? "text-slate-400 cursor-not-allowed"
            : "text-blue-600 hover:text-blue-800 cursor-pointer hover:underline underline-offset-2"
        }
      `}
    >
      {isResending ? (
        <>
          <svg
            className="w-3.5 h-3.5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="3"
              className="opacity-25"
            />
            <path
              d="M21 12a9 9 0 00-9-9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          Sending…
        </>
      ) : cooldown > 0 ? (
        <>
          <ClockIcon className="w-3.5 h-3.5" />
          Resend in {cooldown}s
        </>
      ) : (
        "Resend OTP"
      )}
    </button>

    {/* back to login */}
    <Link
      to="/auth/login"
      className="
        inline-flex items-center gap-1 text-slate-500 hover:text-slate-700
        transition-colors focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-slate-400 focus-visible:ring-offset-1
        rounded px-1 py-0.5 -mx-1
      "
    >
      <ArrowLeftIcon className="w-3.5 h-3.5" />
      Back to login
    </Link>
  </div>
);

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function OtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyPhoneLoginOtp, phoneAuthenticate, resolvePostLoginRoute } =
    useAuth();

  const seededPhone = useMemo(
    () =>
      location.state?.phone || sessionStorage.getItem("pendingOtpPhone") || "",
    [location.state],
  );

  const initialCooldown = location.state?.resendAfterSeconds ?? RESEND_COOLDOWN;

  /* ── state ── */
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverMsg, setServerMsg] = useState("");
  const [cooldown, setCooldown] = useState(initialCooldown);

  const mapLoginErrorMessage = useCallback((error, fallbackMessage) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      return "Invalid or expired OTP. Please try again.";
    }
    if (status >= 500) {
      return "Server error while verifying OTP. Please try again.";
    }
    return getApiErrorMessage(error, fallbackMessage);
  }, []);

  /* ── refs ── */
  const inputRefs = useRef(Array.from({ length: OTP_LENGTH }, () => null));
  const timerRef = useRef(null);

  /* ── persist phone ── */
  useEffect(() => {
    if (location.state?.phone)
      sessionStorage.setItem("pendingOtpPhone", location.state.phone);
  }, [location.state]);

  /* ── countdown ── */
  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setInterval(
      () =>
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return c - 1;
        }),
      1000,
    );
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  /* ── helpers ── */
  const maskPhone = (v) => (!v ? "your phone" : `••••••${v.slice(-4)}`);

  const otp = digits.join("");
  const isFilled = otp.length === OTP_LENGTH;
  const isComplete = isFilled && !otpError;

  const clearErrors = useCallback(() => {
    setOtpError("");
    setServerError("");
  }, []);

  const focusCell = (index) => {
    const el = inputRefs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  /* ── digit input handler ── */
  const handleChange = useCallback(
    (e, index) => {
      const raw = e.target.value.replace(/\D/g, "").slice(-1);
      clearErrors();
      setDigits((prev) => {
        const next = [...prev];
        next[index] = raw;
        return next;
      });
      if (raw && index < OTP_LENGTH - 1) focusCell(index + 1);
    },
    [clearErrors],
  );

  /* ── keyboard nav ── */
  const handleKeyDown = useCallback(
    (e, index) => {
      if (e.key === "Backspace") {
        clearErrors();
        if (digits[index]) {
          setDigits((p) => {
            const n = [...p];
            n[index] = "";
            return n;
          });
        } else if (index > 0) {
          setDigits((p) => {
            const n = [...p];
            n[index - 1] = "";
            return n;
          });
          focusCell(index - 1);
        }
      } else if (e.key === "ArrowLeft" && index > 0) focusCell(index - 1);
      else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1)
        focusCell(index + 1);
    },
    [digits, clearErrors],
  );

  /* ── paste ── */
  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, OTP_LENGTH);
      if (!pasted) return;
      clearErrors();
      const next = Array(OTP_LENGTH).fill("");
      [...pasted].forEach((ch, i) => {
        next[i] = ch;
      });
      setDigits(next);
      focusCell(Math.min(pasted.length, OTP_LENGTH - 1));
    },
    [clearErrors],
  );

  /* ── submit ── */
  const handleVerify = async (e) => {
    e.preventDefault();
    const phone = seededPhone.trim();

    if (!phone) {
      setServerError(
        "Missing phone context. Please request a new OTP from login.",
      );
      return;
    }
    if (otp.length < OTP_LENGTH) {
      setOtpError("Please enter all 6 digits.");
      focusCell(digits.findIndex((d) => !d));
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError("");
      const response = await verifyPhoneLoginOtp(phone, otp.trim());

      const payload = response?.data || {};
      const { isNewUser = false } = payload;
      const effectiveIsNewUser =
        payload?.isNewUser ?? location.state?.isNewUser ?? false;
      const accessToken = payload?.accessToken || payload?.token;
      const role = payload?.role || payload?.user?.role;
      const isProfileCompleted =
        payload?.isProfileCompleted ?? payload?.user?.isProfileCompleted;
      const approval_status =
        payload?.approval_status ??
        payload?.user?.approval_status ??
        payload?.approvalStatus ??
        payload?.user?.approvalStatus;

      if (!accessToken) {
        throw new Error("Login succeeded but no access token was returned.");
      }

      notifyApiSuccess(response, "Login successful.");
      sessionStorage.removeItem("pendingOtpPhone");

      const nextRoute = resolvePostLoginRoute({
        isNewUser: effectiveIsNewUser ?? isNewUser,
        role,
        isProfileCompleted,
        approval_status,
      });

      if (nextRoute === "/auth/login") {
        throw new Error("Unable to determine user role. Please sign in again.");
      }

      navigate(nextRoute, { replace: true });
    } catch (error) {
      const message = mapLoginErrorMessage(error, "Unable to verify OTP.");
      setServerError(message);
      setOtpError(" "); // marks cells red without a second message
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── resend ── */
  const handleResend = async () => {
    const phone = seededPhone.trim();
    if (validatePhone(phone)) {
      setServerError(
        "Missing phone context. Please request a new OTP from login.",
      );
      return;
    }
    try {
      setIsResending(true);
      setServerError("");
      setServerMsg("");
      setDigits(Array(OTP_LENGTH).fill(""));
      setOtpError("");
      const response = await phoneAuthenticate(phone);
      setServerMsg(response?.message || "A new OTP has been sent.");
      notifyApiSuccess(response, "OTP sent again.");
      setCooldown(RESEND_COOLDOWN);
      setTimeout(() => focusCell(0), 50);
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to resend OTP.");
      setServerError(message);
      notifyError(message);
    } finally {
      setIsResending(false);
    }
  };

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────────── */
  return (
    <FormCard
      title="Verify Identity"
      subtitle={`Enter the 6-digit code sent to ${maskPhone(seededPhone)}.`}
      badge="OTP Verification"
      leftTitle={"Verify OTP\nsecurely."}
      leftSubtitle="Confirm your one-time passcode to complete a protected sign-in and continue to your dashboard."
      footer={
        <span>
          Need help?{" "}
          <a
            href="mailto:support@medisync.com"
            className="text-blue-600 hover:text-blue-800 hover:underline underline-offset-2 transition-colors"
          >
            Contact support
          </a>
        </span>
      }
    >
      <form onSubmit={handleVerify} noValidate className="space-y-5">
        {/* ── alerts ── */}
        <div className="space-y-2.5">
          <AlertBanner type="error" message={serverError} />
          <AlertBanner type="success" message={serverMsg} />
        </div>

        {/* ── OTP cells ── */}
        <fieldset>
          <legend className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1.5">
            <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
            One-Time Passcode
          </legend>

          <div
            className="grid gap-2.5"
            style={{
              gridTemplateColumns: `repeat(${OTP_LENGTH}, minmax(0, 1fr))`,
            }}
            role="group"
            aria-label="OTP digit inputs"
          >
            {digits.map((digit, i) => (
              <OtpCell
                key={i}
                index={i}
                value={digit}
                inputRef={(el) => (inputRefs.current[i] = el)}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                hasError={!!otpError}
                isComplete={isComplete}
              />
            ))}
          </div>

          {/* field-level error */}
          {otpError && otpError.trim() && (
            <p
              role="alert"
              className="mt-2 flex items-center gap-1.5 text-xs text-red-600 animate-[fadeSlideDown_0.15s_ease-out]"
            >
              <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
              {otpError}
            </p>
          )}
        </fieldset>

        {/* ── submit ── */}
        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting || !isFilled}
          variant={isComplete ? "success" : "primary"}
        >
          {isSubmitting ? "Verifying…" : "Verify & Sign In"}
        </Button>

        {/* ── resend + back ── */}
        <ResendRow
          cooldown={cooldown}
          isResending={isResending}
          onResend={handleResend}
        />
      </form>

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </FormCard>
  );
}
