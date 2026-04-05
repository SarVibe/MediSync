import { useCallback, useEffect, useRef, useState } from "react";
import {
  approveDoctorByAdmin,
  blockUserByAdmin,
  createUserByAdmin,
  rejectDoctorByAdmin,
  unblockUserByAdmin,
} from "../../auth/services/authService";
import { getPendingDoctorRequests } from "../services/profileService";
import {
  normalizeUpper,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
  validateReason,
  validateRole,
  validateUserId,
} from "../../../utils/validation";
import { getApiErrorMessage } from "../../../utils/api";
import { notifyApiSuccess, notifyError } from "../../../utils/toast";
import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Shield,
  ShieldOff,
  ShieldX,
  Stethoscope,
  UserPlus,
  UserX,
  X,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = ["PATIENT", "DOCTOR", "ADMIN"];

const DEFAULT_CREATE_USER = {
  email: "",
  phone: "",
  name: "",
  role: "PATIENT",
  temporaryPassword: "",
};

const TABLE_HEADERS = [
  "User ID",
  "Name",
  "Specialization",
  "Experience",
  "Qualifications",
  "Actions",
];

// Action keys — used for per-button loading state
const ACTION = {
  BLOCK: "BLOCK",
  UNBLOCK: "UNBLOCK",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
};

// ─── Primitives ───────────────────────────────────────────────────────────────

function FormField({ label, htmlFor, icon: Icon, error, hint, children }) {
  return (
    <div className="space-y-1.5 group">
      <label
        className="flex items-center gap-1.5 text-sm font-medium text-neutral-700"
        htmlFor={htmlFor}
      >
        {Icon && (
          <Icon
            size={13}
            className="flex-shrink-0 transition-colors duration-200 text-neutral-400 group-focus-within:text-primary"
            aria-hidden="true"
          />
        )}
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
      {error && (
        <p
          role="alert"
          className="flex items-center gap-1 text-xs font-medium text-danger animate-[fadeIn_0.15s_ease]"
        >
          <AlertCircle size={11} className="flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  children,
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}
          aria-hidden="true"
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-tight text-neutral-900">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {[40, 80, 70, 50, 100, 90].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-3.5 rounded bg-neutral-100 animate-pulse"
            style={{ width: `${w}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="p-4 space-y-3 border rounded-xl border-neutral-100 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 rounded-full w-9 h-9 bg-neutral-100" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-neutral-200 rounded w-32" />
          <div className="w-20 h-3 rounded bg-neutral-100" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-8 rounded-lg bg-neutral-100" />
        <div className="flex-1 h-8 rounded-lg bg-neutral-100" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14">
      <div
        className="flex items-center justify-center w-12 h-12 mb-3 rounded-2xl bg-neutral-100"
        aria-hidden="true"
      >
        <ClipboardList size={22} className="text-neutral-400" />
      </div>
      <p className="text-sm font-medium text-neutral-600">
        No pending requests
      </p>
      <p className="mt-1 text-xs text-neutral-400">
        All doctor applications have been reviewed.
      </p>
    </div>
  );
}

function TableHead() {
  return (
    <thead>
      <tr className="border-b bg-neutral-50 border-neutral-100">
        {TABLE_HEADERS.map((h) => (
          <th
            key={h}
            className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-400 whitespace-nowrap"
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function useEscapeKey(fn) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") fn();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [fn]);
}

function ModalShell({ onClose, children }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[slideUp_0.2s_ease]">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  onClose,
}) {
  return (
    <div className="flex items-start justify-between p-5 border-b border-neutral-100">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
          aria-hidden="true"
        >
          <Icon size={18} className={iconColor} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
          {subtitle && (
            <p className="text-xs text-neutral-500 mt-0.5 font-mono">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

function RejectModal({ doctor, onConfirm, onClose, isSubmitting }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const ref = useRef(null);
  useEscapeKey(onClose);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  const submit = () => {
    const err = validateReason(reason, { requiredValue: true, max: 500 });
    if (err) {
      setError(err);
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader
        icon={ShieldX}
        iconBg="bg-red-50"
        iconColor="text-red-500"
        title="Reject Application"
        subtitle={`${doctor.fullName} · #${doctor.userId}`}
        onClose={onClose}
      />
      <div className="p-5">
        <FormField
          label="Rejection reason"
          htmlFor="rejectModalReason"
          icon={AlertTriangle}
          error={error}
        >
          <textarea
            id="rejectModalReason"
            ref={ref}
            rows={3}
            className={`input resize-none text-sm leading-relaxed ${error ? "input-error" : "focus:ring-2 focus:ring-primary/20"}`}
            placeholder="Explain why this application is being rejected…"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            aria-invalid={!!error}
            maxLength={500}
            onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && submit()}
          />
          <p className="text-right text-[11px] text-neutral-400 mt-1">
            {reason.length}/500 · Ctrl+Enter to submit
          </p>
        </FormField>
      </div>
      <div className="flex justify-end gap-2 px-5 pb-5">
        <button
          className="btn btn-secondary cursor-pointer"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          className="btn btn-danger flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={submit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 size={13} className="animate-spin" aria-hidden="true" />
          ) : (
            <ShieldX size={13} aria-hidden="true" />
          )}
          Reject
        </button>
      </div>
    </ModalShell>
  );
}

function ApproveModal({ doctor, onConfirm, onClose, isSubmitting }) {
  const btnRef = useRef(null);
  useEscapeKey(onClose);
  useEffect(() => {
    btnRef.current?.focus();
  }, []);

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader
        icon={BadgeCheck}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        title="Approve Application"
        subtitle={`${doctor.fullName} · #${doctor.userId}`}
        onClose={onClose}
      />
      <div className="p-5 space-y-3">
        <p className="text-sm leading-relaxed text-neutral-600">
          You're about to approve{" "}
          <strong className="text-neutral-900">{doctor.fullName}</strong> as a
          verified doctor. This grants full doctor access on the platform.
        </p>
        <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3.5 space-y-2 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Stethoscope size={12} aria-hidden="true" />
            <span>{doctor.specialization}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} aria-hidden="true" />
            <span>
              {doctor.experienceYears} year
              {doctor.experienceYears !== 1 ? "s" : ""} of experience
            </span>
          </div>
          {doctor.qualifications && (
            <p className="truncate pl-[20px]">{doctor.qualifications}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 px-5 pb-5">
        <button
          className="btn btn-secondary cursor-pointer"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          ref={btnRef}
          className="btn btn-primary flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 size={13} className="animate-spin" aria-hidden="true" />
          ) : (
            <BadgeCheck size={13} aria-hidden="true" />
          )}
          Confirm Approval
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Doctor card (mobile) ─────────────────────────────────────────────────────

function DoctorCard({ doctor, onApprove, onReject, isSubmitting }) {
  return (
    <article className="p-4 transition-shadow duration-200 bg-white border rounded-xl border-neutral-100 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex items-center justify-center flex-shrink-0 rounded-full w-9 h-9 bg-violet-50"
            aria-hidden="true"
          >
            <Stethoscope size={15} className="text-violet-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-neutral-900">
              {doctor.fullName}
            </p>
            <p className="text-[11px] text-neutral-400 font-mono">
              #{doctor.userId}
            </p>
          </div>
        </div>
        <span className="text-xs text-neutral-400 flex items-center gap-1 flex-shrink-0 pt-0.5">
          <Clock size={11} aria-hidden="true" />
          {doctor.experienceYears}y
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        <span className="inline-flex items-center gap-1 text-xs text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
          <Stethoscope size={10} aria-hidden="true" />
          {doctor.specialization}
        </span>
      </div>

      {doctor.qualifications && (
        <p className="mb-3 text-xs truncate text-neutral-400">
          {doctor.qualifications}
        </p>
      )}

      <div className="flex gap-2 pt-3 border-t border-neutral-50">
        <button
          className="btn btn-primary flex-1 flex items-center justify-center gap-1.5 text-xs py-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => onApprove(doctor)}
          disabled={isSubmitting}
          aria-label={`Approve ${doctor.fullName}`}
        >
          <BadgeCheck size={13} aria-hidden="true" /> Approve
        </button>
        <button
          className="btn btn-danger flex-1 flex items-center justify-center gap-1.5 text-xs py-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => onReject(doctor)}
          disabled={isSubmitting}
          aria-label={`Reject ${doctor.fullName}`}
        >
          <ShieldX size={13} aria-hidden="true" /> Reject
        </button>
      </div>
    </article>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminUserManagement() {
  const [createForm, setCreateForm] = useState(DEFAULT_CREATE_USER);
  const [createErrors, setCreateErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [actionUserId, setActionUserId] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [activeAction, setActiveAction] = useState(null); // per-button tracking
  const [isCreating, setIsCreating] = useState(false);

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [rejectTarget, setRejectTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);

  const isAnySubmitting = !!activeAction || isCreating;

  // Auto-dismiss
  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(""), 6000);
    return () => clearTimeout(t);
  }, [successMessage]);

  // ── Load pending ─────────────────────────────────────────────────────────
  const loadPendingDoctors = useCallback(async () => {
    try {
      setIsLoadingPending(true);
      const res = await getPendingDoctorRequests();
      setPendingDoctors(res?.data || []);
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Unable to load pending doctor requests.",
      );
      setServerError(msg);
      notifyError(msg);
    } finally {
      setIsLoadingPending(false);
    }
  }, []);

  useEffect(() => {
    loadPendingDoctors();
  }, [loadPendingDoctors]);

  // ── Shared runner ─────────────────────────────────────────────────────────
  const runAction = useCallback(
    async (operation, actionKey) => {
      try {
        setActiveAction(actionKey);
        setServerError("");
        setSuccessMessage("");
        const res = await operation();
        setSuccessMessage(res?.message || "Action completed successfully.");
        notifyApiSuccess(res, "Action completed successfully.");
        await loadPendingDoctors();
      } catch (err) {
        const msg = getApiErrorMessage(err, "Action failed.");
        setServerError(msg);
        notifyError(msg);
      } finally {
        setActiveAction(null);
      }
    },
    [loadPendingDoctors],
  );

  // ── Create user ───────────────────────────────────────────────────────────
  const validateCreateUser = () => {
    const errs = {
      email: validateEmail(createForm.email),
      phone: validatePhone(createForm.phone),
      name: validateName(createForm.name, "Name", 2, 120),
      role: validateRole(createForm.role),
      temporaryPassword: validatePassword(createForm.temporaryPassword, {
        minLength: 8,
      }),
    };
    setCreateErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const createUser = async (e) => {
    e.preventDefault();
    if (!validateCreateUser()) return;
    try {
      setIsCreating(true);
      setServerError("");
      setSuccessMessage("");
      const res = await createUserByAdmin({
        ...createForm,
        role: normalizeUpper(createForm.role),
      });
      setSuccessMessage(res?.message || "User created successfully.");
      notifyApiSuccess(res, "User created successfully.");
      setCreateForm(DEFAULT_CREATE_USER);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Unable to create user.");
      setServerError(msg);
      notifyError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const setCreateField = (f, v) => {
    setCreateForm((p) => ({ ...p, [f]: v }));
    setCreateErrors((p) => ({ ...p, [f]: "" }));
  };

  // ── Action panel ──────────────────────────────────────────────────────────
  const getValidatedId = () => {
    const err = validateUserId(actionUserId);
    if (err) {
      setServerError(err);
      return null;
    }
    return Number(actionUserId);
  };

  const handleBlock = () => {
    const id = getValidatedId();
    if (id) runAction(() => blockUserByAdmin(id), ACTION.BLOCK);
  };
  const handleUnblock = () => {
    const id = getValidatedId();
    if (id) runAction(() => unblockUserByAdmin(id), ACTION.UNBLOCK);
  };
  const handleApprove = () => {
    const id = getValidatedId();
    if (id) runAction(() => approveDoctorByAdmin(id), ACTION.APPROVE);
  };
  const handleReject = () => {
    const id = getValidatedId();
    if (!id) return;
    const err = validateReason(rejectReason, { requiredValue: true, max: 500 });
    if (err) {
      setServerError(err);
      return;
    }
    runAction(
      () => rejectDoctorByAdmin(id, rejectReason.trim()),
      ACTION.REJECT,
    );
  };

  // ── Table modals ──────────────────────────────────────────────────────────
  const handleModalApprove = () => {
    if (!approveTarget) return;
    runAction(() => approveDoctorByAdmin(approveTarget.userId), ACTION.APPROVE);
    setApproveTarget(null);
  };

  const handleModalReject = (reason) => {
    if (!rejectTarget) return;
    runAction(
      () => rejectDoctorByAdmin(rejectTarget.userId, reason),
      ACTION.REJECT,
    );
    setRejectTarget(null);
  };

  // ── Action buttons config ─────────────────────────────────────────────────
  const ACTION_BUTTONS = [
    {
      key: ACTION.BLOCK,
      label: "Block User",
      Icon: ShieldOff,
      cls: "btn-danger",
      fn: handleBlock,
    },
    {
      key: ACTION.UNBLOCK,
      label: "Unblock User",
      Icon: Shield,
      cls: "btn-secondary",
      fn: handleUnblock,
    },
    {
      key: ACTION.APPROVE,
      label: "Approve Doctor",
      Icon: BadgeCheck,
      cls: "btn-primary",
      fn: handleApprove,
    },
    {
      key: ACTION.REJECT,
      label: "Reject Doctor",
      Icon: UserX,
      cls: "btn-secondary",
      fn: handleReject,
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {rejectTarget && (
        <RejectModal
          doctor={rejectTarget}
          onConfirm={handleModalReject}
          onClose={() => setRejectTarget(null)}
          isSubmitting={activeAction === ACTION.REJECT}
        />
      )}
      {approveTarget && (
        <ApproveModal
          doctor={approveTarget}
          onConfirm={handleModalApprove}
          onClose={() => setApproveTarget(null)}
          isSubmitting={activeAction === ACTION.APPROVE}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-5">
        {/* ── Page header ────────────────────────────────────────────── */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div
              className="flex items-center justify-center flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <Shield size={22} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">
                Admin User Management
              </h1>
              <p className="mt-0.5 text-sm text-neutral-500">
                Create users and manage block, unblock, and doctor approval
                actions.
              </p>
            </div>
          </div>
        </div>

        {/* ── Alerts ─────────────────────────────────────────────────── */}
        {serverError && (
          <div
            role="alert"
            className="alert-error flex items-start gap-3 animate-[fadeIn_0.2s_ease]"
          >
            <AlertCircle
              size={15}
              className="flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span>{serverError}</span>
          </div>
        )}
        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="alert-success flex items-start gap-3 animate-[fadeIn_0.2s_ease]"
          >
            <CheckCircle2
              size={15}
              className="flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ── Create user ────────────────────────────────────────────── */}
        <section className="card" aria-labelledby="create-user-heading">
          <SectionHeader
            icon={UserPlus}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            title="Create User"
          />

          <form
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
            onSubmit={createUser}
            noValidate
            aria-label="Create user form"
          >
            <FormField
              label="Email address"
              htmlFor="createEmail"
              icon={Mail}
              error={createErrors.email}
            >
              <input
                id="createEmail"
                type="email"
                autoComplete="email"
                className={`input ${createErrors.email ? "input-error" : "focus:ring-2 focus:ring-primary/20"}`}
                placeholder="user@example.com"
                value={createForm.email}
                onChange={(e) => setCreateField("email", e.target.value)}
                aria-invalid={!!createErrors.email}
              />
            </FormField>

            <FormField
              label="Phone number"
              htmlFor="createPhone"
              icon={Phone}
              error={createErrors.phone}
            >
              <input
                id="createPhone"
                type="tel"
                autoComplete="tel"
                className={`input ${createErrors.phone ? "input-error" : "focus:ring-2 focus:ring-primary/20"}`}
                placeholder="+94770000000"
                value={createForm.phone}
                onChange={(e) => setCreateField("phone", e.target.value)}
                aria-invalid={!!createErrors.phone}
              />
            </FormField>

            <FormField
              label="Full name"
              htmlFor="createName"
              error={createErrors.name}
            >
              <input
                id="createName"
                type="text"
                autoComplete="name"
                className={`input ${createErrors.name ? "input-error" : "focus:ring-2 focus:ring-primary/20"}`}
                placeholder="Jane Smith"
                value={createForm.name}
                onChange={(e) => setCreateField("name", e.target.value)}
                aria-invalid={!!createErrors.name}
              />
            </FormField>

            <FormField
              label="Role"
              htmlFor="createRole"
              icon={Shield}
              error={createErrors.role}
            >
              <div className="relative">
                <select
                  id="createRole"
                  className={`input appearance-none pr-9 cursor-pointer ${createErrors.role ? "input-error" : "focus:ring-2 focus:ring-primary/20"}`}
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateField("role", normalizeUpper(e.target.value))
                  }
                  aria-invalid={!!createErrors.role}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute -translate-y-1/2 pointer-events-none right-3 top-1/2 text-neutral-400"
                  aria-hidden="true"
                />
              </div>
            </FormField>

            <div className="md:col-span-2">
              <FormField
                label="Temporary password"
                htmlFor="createTempPassword"
                icon={Lock}
                error={createErrors.temporaryPassword}
                hint="Minimum 8 characters"
              >
                <div className="relative">
                  <input
                    id="createTempPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={`input pr-10 ${createErrors.temporaryPassword ? "input-error" : "focus:ring-2 focus:ring-primary/20"}`}
                    placeholder="Min. 8 characters"
                    value={createForm.temporaryPassword}
                    onChange={(e) =>
                      setCreateField("temporaryPassword", e.target.value)
                    }
                    aria-invalid={!!createErrors.temporaryPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute transition-colors -translate-y-1/2 rounded cursor-pointer right-3 top-1/2 text-neutral-400 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={15} aria-hidden="true" />
                    ) : (
                      <Eye size={15} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </FormField>
            </div>

            <div className="flex justify-end pt-2 border-t md:col-span-2 border-neutral-100">
              <button
                type="submit"
                className="flex items-center gap-2 btn btn-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isCreating || isAnySubmitting}
                aria-busy={isCreating}
              >
                {isCreating ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <UserPlus size={14} aria-hidden="true" />
                )}
                {isCreating ? "Creating…" : "Create User"}
              </button>
            </div>
          </form>
        </section>

        {/* ── Action panel ───────────────────────────────────────────── */}
        <section
          className="space-y-5 card"
          aria-labelledby="action-panel-heading"
        >
          <SectionHeader
            icon={ClipboardList}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            title="Manage User by ID"
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="User ID" htmlFor="actionUserId">
              <input
                id="actionUserId"
                type="number"
                min="1"
                className="input focus:ring-2 focus:ring-primary/20"
                value={actionUserId}
                onChange={(e) => {
                  setActionUserId(e.target.value);
                  setServerError("");
                }}
                placeholder="Enter numeric user ID"
              />
            </FormField>

            <FormField
              label="Rejection reason"
              htmlFor="rejectReason"
              icon={AlertTriangle}
              hint="Required only when rejecting a doctor"
            >
              <input
                id="rejectReason"
                className="input focus:ring-2 focus:ring-primary/20"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection"
              />
            </FormField>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-100">
            {ACTION_BUTTONS.map(({ key, label, Icon, cls, fn }) => {
              const busy = activeAction === key;
              return (
                <button
                  key={key}
                  className={`btn ${cls} flex items-center gap-1.5 text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all`}
                  onClick={fn}
                  disabled={isAnySubmitting || isCreating}
                  aria-label={label}
                  aria-busy={busy}
                >
                  {busy ? (
                    <Loader2
                      size={13}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Icon size={13} aria-hidden="true" />
                  )}
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Pending doctors ─────────────────────────────────────────── */}
        <section className="card" aria-labelledby="pending-heading">
          <SectionHeader
            icon={Stethoscope}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            title="Pending Doctor Requests"
            subtitle={
              !isLoadingPending && pendingDoctors.length > 0
                ? `${pendingDoctors.length} awaiting review`
                : undefined
            }
          >
            <button
              className="btn btn-secondary flex items-center gap-1.5 disabled:opacity-60 cursor-pointer text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              onClick={loadPendingDoctors}
              disabled={isLoadingPending}
              aria-label="Refresh pending requests"
            >
              <RefreshCw
                size={13}
                className={isLoadingPending ? "animate-spin" : ""}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </SectionHeader>

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {isLoadingPending ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : pendingDoctors.length === 0 ? (
              <EmptyState />
            ) : (
              pendingDoctors.map((d) => (
                <DoctorCard
                  key={d.id}
                  doctor={d}
                  onApprove={setApproveTarget}
                  onReject={setRejectTarget}
                  isSubmitting={isAnySubmitting}
                />
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block">
            {isLoadingPending ? (
              <div className="overflow-auto border rounded-xl border-neutral-100">
                <table
                  className="w-full text-sm"
                  aria-label="Loading pending doctor requests"
                >
                  <TableHead />
                  <tbody>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </tbody>
                </table>
              </div>
            ) : pendingDoctors.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-auto border rounded-xl border-neutral-100">
                <table
                  className="w-full text-sm"
                  aria-label="Pending doctor requests"
                >
                  <TableHead />
                  <tbody className="divide-y divide-neutral-50">
                    {pendingDoctors.map((d) => (
                      <tr
                        key={d.id}
                        className="transition-colors hover:bg-neutral-50/60 group"
                      >
                        <td className="px-4 py-3.5 text-neutral-400 font-mono text-xs">
                          #{d.userId}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-neutral-900 whitespace-nowrap">
                          {d.fullName}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 text-xs text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
                            <Stethoscope size={10} aria-hidden="true" />
                            {d.specialization}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                            <Clock
                              size={11}
                              className="text-neutral-400"
                              aria-hidden="true"
                            />
                            {d.experienceYears}yr
                            {d.experienceYears !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-neutral-400 max-w-[160px] truncate text-xs">
                          {d.qualifications || "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 transition-opacity duration-150 opacity-70 group-hover:opacity-100">
                            <button
                              className="btn btn-primary flex items-center gap-1 text-xs px-3 py-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() => setApproveTarget(d)}
                              disabled={isAnySubmitting}
                              aria-label={`Approve ${d.fullName}`}
                            >
                              <BadgeCheck size={12} aria-hidden="true" />{" "}
                              Approve
                            </button>
                            <button
                              className="btn btn-danger flex items-center gap-1 text-xs px-3 py-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() => setRejectTarget(d)}
                              disabled={isAnySubmitting}
                              aria-label={`Reject ${d.fullName}`}
                            >
                              <ShieldX size={12} aria-hidden="true" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
