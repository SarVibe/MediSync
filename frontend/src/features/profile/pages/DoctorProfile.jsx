import {
  AlertCircle,
  CheckCircle2,
  BadgeCheck,
  ClipboardList,
} from "lucide-react";
import useDoctorProfileController from "../hooks/useDoctorProfile";
import DoctorUpgradeRequestForm from "../components/DoctorUpgradeRequestForm";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  NOT_SUBMITTED: {
    label: "Not Submitted",
    className: "bg-neutral-100 text-neutral-500 border border-neutral-200",
    dot: "bg-neutral-400",
  },
  PENDING: {
    label: "Pending Review",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500 animate-pulse",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function SkeletonField() {
  return (
    <div className="space-y-2">
      <div className="w-24 h-4 rounded bg-neutral-200 animate-pulse" />
      <div className="w-full h-10 rounded-lg bg-neutral-100 animate-pulse" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header card skeleton */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-neutral-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="w-48 h-6 rounded bg-neutral-200 animate-pulse" />
            <div className="h-4 rounded w-72 bg-neutral-100 animate-pulse" />
            <div className="h-5 mt-1 rounded-full w-28 bg-neutral-100 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Form card skeleton */}
      <div className="space-y-5 card">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
        </div>
        <SkeletonField />
        <SkeletonField />
        <div className="flex justify-end pt-2">
          <div className="w-40 h-10 rounded-lg bg-neutral-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DoctorProfile() {
  const {
    form,
    errors,
    doctorData,
    isLoading,
    isSaving,
    serverError,
    successMessage,
    isDoctorRole,
    handleSubmit,
    setField,
  } = useDoctorProfileController();

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) return <LoadingSkeleton />;

  // ── Derived ──────────────────────────────────────────────────────────────
  const approvalStatus = doctorData?.approvalStatus || "NOT_SUBMITTED";
  const statusCfg =
    STATUS_CONFIG[approvalStatus] ?? STATUS_CONFIG.NOT_SUBMITTED;

  const submitLabel = isDoctorRole
    ? "Update Profile"
    : doctorData
      ? "Update Application"
      : "Submit Application";

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Header Card ─────────────────────────────────────────────────── */}
      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* Icon badge */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDoctorRole
                ? "bg-primary/10 text-primary"
                : "bg-amber-50 text-amber-600"
            }`}
            aria-hidden="true"
          >
            {isDoctorRole ? (
              <BadgeCheck size={22} />
            ) : (
              <ClipboardList size={22} />
            )}
          </div>

          {/* Title & description */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold leading-tight text-neutral-900">
              {isDoctorRole ? "Doctor Profile" : "Doctor Upgrade Application"}
            </h1>
            <p className="mt-0.5 text-sm text-neutral-500">
              {isDoctorRole
                ? "Manage and update your approved doctor profile details."
                : "Submit or update your application to become a verified doctor."}
            </p>

            {/* Status pill */}
            <div className="mt-3">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg.className}`}
                aria-label={`Application status: ${statusCfg.label}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                  aria-hidden="true"
                />
                {statusCfg.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Server Error ────────────────────────────────────────────────── */}
      {serverError && (
        <div
          role="alert"
          className="alert-error flex items-start gap-3 animate-[fadeIn_0.2s_ease]"
        >
          <AlertCircle
            size={16}
            className="flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span>{serverError}</span>
        </div>
      )}

      {/* ── Success Message ─────────────────────────────────────────────── */}
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="alert-success flex items-start gap-3 animate-[fadeIn_0.2s_ease]"
        >
          <CheckCircle2
            size={16}
            className="flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span>{successMessage}</span>
        </div>
      )}

      <DoctorUpgradeRequestForm
        form={form}
        errors={errors}
        isSubmitting={isSaving}
        onFieldChange={setField}
        onSubmit={handleSubmit}
        disabled={false}
        formAriaLabel={
          isDoctorRole ? "Doctor profile form" : "Doctor application form"
        }
        showHeader={false}
        showCancel={false}
        submitLabel={submitLabel}
        submittingLabel="Saving…"
      />
    </div>
  );
}
