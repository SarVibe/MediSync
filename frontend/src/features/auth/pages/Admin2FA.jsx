import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormCard from "../components/FormCard";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../../../utils/api";
import { notifyApiSuccess, notifyError } from "../../../utils/toast";
import {
  AlertCircle as AlertCircleIcon,
  ArrowLeft as ArrowLeftIcon,
  CheckCircle as CheckCircleIcon,
  Check as CheckIcon,
  Clock as ClockIcon,
  Lock as LockIcon,
  Mail as MailIcon,
  Shield as ShieldIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const OTP_LENGTH = 6;

/* ─────────────────────────────────────────────
   Alert Banner
───────────────────────────────────────────── */
const AlertBanner = ({ type = "error", message }) => {
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
            : "bg-amber-50 border-amber-200 text-amber-700"
        }
      `}
    >
      {isError ? (
        <AlertCircleIcon className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
      ) : (
        <AlertCircleIcon className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
      )}
      <span>{message}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Admin email chip (read-only)
───────────────────────────────────────────── */
const EmailChip = ({ email }) => (
  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5">
    <MailIcon className="w-4 h-4 text-slate-400 shrink-0" />
    <span className="flex-1 text-sm truncate text-slate-600">
      {email || "your admin email"}
    </span>
    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
      <ShieldIcon className="w-2.5 h-2.5" />
      Admin
    </span>
  </div>
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
  isComplete,
}) => (
  <input
    ref={inputRef}
    id={`otp-admin-${index}`}
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
      transition-all duration-150 ease-out caret-transparent focus:caret-blue-600 cursor-text
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
   Countdown ring
───────────────────────────────────────────── */
const COUNTDOWN_TOTAL = 300; // 5 min

const CountdownBadge = ({ seconds }) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pct = (seconds / COUNTDOWN_TOTAL) * 100;
  const isLow = seconds <= 60;

  return (
    <div
      className={`
      inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold
      transition-colors duration-300
      ${
        isLow
          ? "bg-red-50 border border-red-200 text-red-600"
          : "bg-slate-50 border border-slate-200 text-slate-500"
      }
    `}
    >
      <ClockIcon
        className={`w-3.5 h-3.5 ${isLow ? "text-red-500" : "text-slate-400"}`}
      />
      {mins}:{String(secs).padStart(2, "0")} remaining
    </div>
  );
};

/* ─────────────────────────────────────────────
   Security info row
───────────────────────────────────────────── */
const SecurityRow = ({ icon: Icon, label }) => (
  <li className="flex items-center gap-2">
    <span className="flex items-center justify-center w-4 h-4 bg-blue-100 rounded-full shrink-0">
      <Icon className="w-2.5 h-2.5 text-blue-600" />
    </span>
    <span className="text-xs text-slate-500">{label}</span>
  </li>
);

/* ─────────────────────────────────────────────
   Success screen
───────────────────────────────────────────── */
const SuccessScreen = () => (
  <div className="flex flex-col items-center gap-5 py-6 text-center animate-[fadeSlideUp_0.3s_ease-out]">
    <div className="relative">
      <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
        <CheckCircleIcon className="w-10 h-10 text-green-600" />
      </div>
      <span className="absolute inset-0 border-2 border-green-300 rounded-full opacity-25 animate-ping" />
    </div>
    <div className="space-y-1">
      <p className="text-base font-semibold text-slate-800">
        Identity verified!
      </p>
      <p className="text-sm text-slate-500">Loading your admin dashboard…</p>
    </div>
    <div className="w-40 h-1 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full bg-green-500 animate-[progressBar_1s_linear_forwards]" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function Admin2FA() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyAdminSecondFactor, resolvePostLoginRoute } = useAuth();

  const challengeToken = location.state?.challengeToken || "";
  const email = location.state?.email || "";

  /* ── state ── */
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_TOTAL);

  const mapLoginErrorMessage = useCallback((error, fallbackMessage) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      return "Invalid credentials or OTP. Please try again.";
    }
    if (status >= 500) {
      return "Server error while completing sign in. Please try again.";
    }
    return getApiErrorMessage(error, fallbackMessage);
  }, []);

  const inputRefs = useRef(Array.from({ length: OTP_LENGTH }, () => null));
  const timerRef = useRef(null);

  /* ── countdown ── */
  useEffect(() => {
    timerRef.current = setInterval(
      () =>
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return c - 1;
        }),
      1000,
    );
    return () => clearInterval(timerRef.current);
  }, []);

  /* ── auto-focus first cell ── */
  useEffect(() => {
    setTimeout(() => {
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, 120);
  }, []);

  /* ── helpers ── */
  const focusCell = (i) => {
    const el = inputRefs.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  };
  const clearErrors = useCallback(() => {
    setOtpError("");
    setServerError("");
  }, []);
  const otp = digits.join("");
  const isFilled = otp.length === OTP_LENGTH;
  const isAllComplete = isFilled && !otpError;

  /* ── digit handlers ── */
  const handleChange = useCallback(
    (e, idx) => {
      const raw = e.target.value.replace(/\D/g, "").slice(-1);
      clearErrors();
      setDigits((p) => {
        const n = [...p];
        n[idx] = raw;
        return n;
      });
      if (raw && idx < OTP_LENGTH - 1) focusCell(idx + 1);
    },
    [clearErrors],
  );

  const handleKeyDown = useCallback(
    (e, idx) => {
      if (e.key === "Backspace") {
        clearErrors();
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
    [digits, clearErrors],
  );

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
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!challengeToken) {
      setServerError("Missing challenge token. Please restart login.");
      return;
    }
    if (!isFilled) {
      setOtpError("Please enter all 6 digits.");
      focusCell(digits.findIndex((d) => !d));
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError("");
      const response = await verifyAdminSecondFactor(
        challengeToken,
        otp.trim(),
      );

      const payload = response?.data || {};
      const accessToken = payload?.accessToken || payload?.token;
      const role = payload?.role || payload?.user?.role;

      if (!accessToken) {
        throw new Error("Login succeeded but no access token was returned.");
      }

      notifyApiSuccess(response, "Admin login successful.");
      setIsSuccess(true);
      clearInterval(timerRef.current);

      const nextRoute = resolvePostLoginRoute({ isNewUser: false, role });
      if (nextRoute === "/auth/login") {
        throw new Error("Unable to determine user role. Please sign in again.");
      }

      setTimeout(() => navigate(nextRoute, { replace: true }), 1000);
    } catch (apiError) {
      const message = mapLoginErrorMessage(
        apiError,
        "Unable to verify 2FA OTP.",
      );
      setServerError(message);
      setOtpError(" "); // marks cells red without duplicate text
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────────── */
  return (
    <FormCard
      title="Two-Factor Verification"
      subtitle={`Enter the 6-digit admin code sent to ${email || "your admin email"}.`}
      badge="Admin 2FA"
      leftTitle={"Admin 2FA\nverification."}
      leftSubtitle="Use your one-time admin code to finish sign-in and unlock privileged operations safely."
      footer={
        !isSuccess && (
          <Link
            to="/auth/login"
            className="inline-flex cursor-pointer items-center gap-1 text-blue-600 transition-colors hover:text-blue-800 hover:underline underline-offset-2"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        )
      }
    >
      {isSuccess ? (
        <SuccessScreen />
      ) : (
        <div className="space-y-5 animate-[fadeSlideUp_0.25s_ease-out]">
          {/* admin email chip */}
          {email && <EmailChip email={email} />}

          {/* countdown */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Code expires in:</p>
            <CountdownBadge seconds={countdown} />
          </div>

          {/* expired warning */}
          {countdown === 0 && (
            <AlertBanner
              type="warning"
              message="Your OTP has expired. Please go back and sign in again to receive a new code."
            />
          )}

          {/* server error */}
          <AlertBanner type="error" message={serverError} />

          {/* OTP form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* digit cells */}
            <fieldset>
              <legend className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1.5">
                <ShieldIcon className="w-4 h-4 text-blue-500" />
                Admin one-time code
              </legend>

              <div
                className="grid gap-2.5"
                style={{
                  gridTemplateColumns: `repeat(${OTP_LENGTH}, minmax(0, 1fr))`,
                }}
                role="group"
                aria-label="2FA digit inputs"
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
                    isComplete={isAllComplete}
                  />
                ))}
              </div>

              {/* cell-level error */}
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

            {/* submit */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting || !isFilled || countdown === 0}
              variant={isAllComplete ? "success" : "primary"}
            >
              {isSubmitting ? "Verifying…" : "Verify & Sign In"}
            </Button>
          </form>

          {/* security info */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3.5">
            <p className="text-xs font-semibold text-blue-700 mb-2.5 flex items-center gap-1.5">
              <LockIcon className="w-3.5 h-3.5" />
              Session security
            </p>
            <ul className="space-y-1.5">
              <SecurityRow
                icon={ShieldIcon}
                label="This code is valid for one use only."
              />
              <SecurityRow
                icon={ClockIcon}
                label="Code expires after 5 minutes."
              />
              <SecurityRow
                icon={CheckIcon}
                label="Successful verification grants admin privileges."
              />
            </ul>
          </div>
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
        @keyframes progressBar {
          from { width: 0%;   }
          to   { width: 100%; }
        }
      `}</style>
    </FormCard>
  );
}
