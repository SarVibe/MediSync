import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormCard from "../components/FormCard";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import {
  validateConfirmPassword,
  validatePassword,
} from "../../../utils/validation";
import { getApiErrorMessage } from "../../../utils/api";
import { notifyError, notifySuccess } from "../../../utils/toast";
import {
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  Check as CheckIcon,
  LogOut as LogOutIcon,
  Shield as ShieldIcon,
  X as XIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Password strength
───────────────────────────────────────────── */
const RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "number", label: "One number", test: (p) => /[0-9]/.test(p) },
  {
    id: "special",
    label: "One special character",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

const getScore = (pw) => (pw ? RULES.filter((r) => r.test(pw)).length : 0);

const SCORE_META = [
  {
    label: "Too weak",
    bar: "w-1/4",
    segColor: "bg-red-400",
    text: "text-red-500",
  },
  {
    label: "Weak",
    bar: "w-2/4",
    segColor: "bg-orange-400",
    text: "text-orange-500",
  },
  {
    label: "Fair",
    bar: "w-3/4",
    segColor: "bg-yellow-400",
    text: "text-yellow-600",
  },
  {
    label: "Strong",
    bar: "w-full",
    segColor: "bg-green-500",
    text: "text-green-600",
  },
];

const PasswordRules = ({ password, visible }) => {
  if (!visible) return null;
  const score = getScore(password);
  const meta = SCORE_META[score - 1] ?? SCORE_META[0];

  return (
    <div className="mt-2 space-y-2.5 animate-[fadeSlideDown_0.2s_ease-out]">
      {/* segmented bar */}
      <div
        className="flex gap-1"
        role="meter"
        aria-label="Password strength"
        aria-valuenow={score}
        aria-valuemax={4}
      >
        {SCORE_META.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? meta.segColor : "bg-slate-100"}`}
          />
        ))}
      </div>
      {score > 0 && (
        <p className={`text-[11px] font-semibold ${meta.text}`}>{meta.label}</p>
      )}

      {/* rule checklist */}
      <ul className="space-y-1" aria-label="Password requirements">
        {RULES.map((rule) => {
          const passed = password ? rule.test(password) : false;
          return (
            <li key={rule.id} className="flex items-center gap-2">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${passed ? "bg-green-100" : "bg-slate-100"}`}
              >
                {passed ? (
                  <CheckIcon className="w-2.5 h-2.5 text-green-600" />
                ) : (
                  <XIcon className="w-2.5 h-2.5 text-slate-400" />
                )}
              </span>
              <span
                className={`text-xs transition-colors duration-200 ${passed ? "text-green-700" : "text-slate-500"}`}
              >
                {rule.label}
              </span>
            </li>
          );
        })}
      </ul>
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
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm animate-[fadeSlideDown_0.2s_ease-out] ${
        isError
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-green-50 border-green-200 text-green-700"
      }`}
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
   Security tip pill
───────────────────────────────────────────── */
const SecurityTip = ({ text }) => (
  <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 px-3.5 py-3">
    <ShieldIcon className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
    <p className="text-xs text-blue-700 leading-relaxed">{text}</p>
  </div>
);

/* ─────────────────────────────────────────────
   Success screen
───────────────────────────────────────────── */
const SuccessScreen = () => (
  <div className="flex flex-col items-center gap-5 py-6 text-center animate-[fadeSlideUp_0.3s_ease-out]">
    <div className="relative">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircleIcon className="w-10 h-10 text-green-600" />
      </div>
      <span className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping opacity-25" />
    </div>
    <div className="space-y-1">
      <p className="text-base font-semibold text-slate-800">
        Password changed!
      </p>
      <p className="text-sm text-slate-500">
        Signing you out and redirecting to login…
      </p>
    </div>
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <LogOutIcon className="w-3.5 h-3.5" />
      <span>All active sessions will be terminated for security.</span>
    </div>
    <div className="w-40 h-1 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full bg-green-500 animate-[progressBar_0.9s_linear_forwards]" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function ChangePassword() {
  const navigate = useNavigate();
  const { changePassword, logout } = useAuth();

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPwFocused, setNewPwFocused] = useState(false);

  /* ── handlers ── */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setServerError("");
  }, []);

  const validate = useCallback(() => {
    const errs = {
      oldPassword: validatePassword(form.oldPassword, { minLength: 1 }),
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
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      setServerError("");
      await changePassword(form);
      setSuccessMessage("Password changed successfully.");
      notifySuccess("Password changed successfully. Please login again.");
      await logout();
      setTimeout(() => navigate("/auth/login", { replace: true }), 900);
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to change password.");
      setServerError(message);
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSuccess = !!successMessage;
  const allFilled =
    form.oldPassword && form.newPassword && form.confirmPassword;

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────────── */
  return (
    <FormCard
      title="Change Password"
      subtitle="Keep your account secure with a strong, unique password."
      badge="Security"
      leftTitle={"Update your\npassword."}
      leftSubtitle="Keep your account protected by setting a stronger credential aligned with security best practices."
    >
      {isSuccess ? (
        <SuccessScreen />
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 animate-[fadeSlideUp_0.25s_ease-out]"
        >
          {/* alerts */}
          <AlertBanner type="error" message={serverError} />
          <AlertBanner type="success" message={successMessage} />

          {/* current password */}
          <InputField
            id="oldPassword"
            name="oldPassword"
            label="Current Password"
            type="password"
            value={form.oldPassword}
            onChange={handleChange}
            error={errors.oldPassword}
            autoComplete="current-password"
            placeholder="Enter your current password"
            required
          />

          {/* divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              New credentials
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* new password + inline rules */}
          <div>
            <InputField
              id="newPassword"
              name="newPassword"
              label="New Password"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              required
              onFocus={() => setNewPwFocused(true)}
              onBlur={() => setNewPwFocused(false)}
            />
            <PasswordRules
              password={form.newPassword}
              visible={newPwFocused || !!form.newPassword}
            />
          </div>

          {/* confirm */}
          <InputField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
            placeholder="Repeat your new password"
            required
          />

          {/* security tip */}
          <SecurityTip text="After changing your password you will be signed out of all active sessions and redirected to login." />

          {/* submit */}
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting || !allFilled}
          >
            {isSubmitting ? "Updating password…" : "Change Password"}
          </Button>
        </form>
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
