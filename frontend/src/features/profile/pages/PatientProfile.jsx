/* eslint-disable no-unused-vars */
import { memo } from "react";
import {
  Info,
  Stethoscope,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  XCircle,
  FileText,
} from "lucide-react";
import DoctorUpgradeRequestForm from "../components/DoctorUpgradeRequestForm";
import PatientProfileForm from "../components/PatientProfileForm";
import usePatientProfileController, {
  PATIENT_PROFILE_VIEW_MODE,
} from "../hooks/usePatientProfile";

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

const Bone = memo(function Bone({ className = "" }) {
  return (
    <div
      className={`rounded-xl animate-pulse bg-slate-200/70 ${className}`}
      aria-hidden="true"
    />
  );
});

const ProfileSkeleton = memo(function ProfileSkeleton() {
  return (
    <div className="pb-12 mx-auto mt-4 space-y-6 max-w-5xl">
      <div className="overflow-hidden bg-white rounded-3xl border shadow-sm border-slate-200">
        <div className="flex gap-4 items-center p-5 sm:p-6">
          <Bone className="w-12 h-12 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Bone className="w-44 h-5" />
            <Bone className="h-3.5 w-72 max-w-full" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-3xl border shadow-sm border-slate-200">
        <div className="p-5 space-y-6 sm:p-6">
          <div className="flex gap-4 items-center">
            <Bone className="w-16 h-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Bone className="w-40 h-4" />
              <Bone className="w-56 max-w-full h-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Bone className="h-3.5 w-24" />
                <Bone className="w-full h-11" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Bone className="h-3.5 w-32" />
            <Bone className="w-full h-24" />
          </div>

          <div className="space-y-2">
            <Bone className="h-3.5 w-36" />
            <Bone className="w-full h-28" />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <Bone className="w-28 h-11 rounded-2xl" />
            <Bone className="w-36 h-11 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Alert Banner
// ─────────────────────────────────────────────────────────────────────────────

const ALERT_STYLES = {
  error: {
    wrap:
      "border-red-200 bg-red-50/90 text-red-800 shadow-sm shadow-red-100/60",
    Icon: AlertCircle,
    iconCls: "text-red-500",
  },
  success: {
    wrap:
      "border-emerald-200 bg-emerald-50/90 text-emerald-800 shadow-sm shadow-emerald-100/60",
    Icon: CheckCircle2,
    iconCls: "text-emerald-500",
  },
  info: {
    wrap:
      "border-blue-200 bg-blue-50/90 text-blue-800 shadow-sm shadow-blue-100/60",
    Icon: Info,
    iconCls: "text-blue-500",
  },
  warning: {
    wrap:
      "border-amber-200 bg-amber-50/90 text-amber-800 shadow-sm shadow-amber-100/60",
    Icon: AlertCircle,
    iconCls: "text-amber-500",
  },
};

const AlertBanner = memo(function AlertBanner({
  type = "info",
  message,
  onDismiss,
}) {
  if (!message) return null;

  const { wrap, Icon, iconCls } = ALERT_STYLES[type] ?? ALERT_STYLES.info;

  return (
    <div
      role="alert"
      className={`animate-[fadeIn_0.25s_ease] rounded-2xl border px-4 py-3 sm:px-5 ${wrap}`}
    >
      <div className="flex gap-3 items-start">
        <div className="mt-0.5 shrink-0">
          <Icon size={18} className={iconCls} aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm leading-6">{message}</p>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className="inline-flex justify-center items-center w-8 h-8 text-current rounded-xl opacity-60 transition cursor-pointer hover:bg-white/60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40"
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Status Pills
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_PILLS = {
  active: {
    icon: CheckCircle2,
    label: "Profile Active",
    cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-400",
  },
  pending: {
    icon: Clock,
    label: "Upgrade Under Review",
    cls: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-400 animate-pulse",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected - You Can Resubmit",
    cls: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-400",
  },
};

const StatusPill = memo(function StatusPill({ variant }) {
  const cfg = STATUS_PILLS[variant];
  if (!cfg) return null;

  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide ${cfg.cls}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${cfg.dot}`}
        aria-hidden="true"
      />
      <Icon size={13} aria-hidden="true" />
      {cfg.label}
    </span>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────────────────────────────────────

const SectionHeader = memo(function SectionHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  children,
}) {
  return (
    <div className="overflow-hidden bg-white rounded-3xl border shadow-sm transition-all duration-300 border-slate-200 hover:shadow-md">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex gap-4 items-start min-w-0">
          <div
            className={`flex justify-center items-center w-12 h-12 rounded-2xl shrink-0 ${iconBg} ${iconColor}`}
            aria-hidden="true"
          >
            <Icon size={22} />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {children ? (
          <div className="flex flex-wrap gap-2 items-center">{children}</div>
        ) : null}
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────

const EmptyState = memo(function EmptyState({
  title = "No data available",
  description = "Nothing is available to display right now.",
}) {
  return (
    <div className="px-6 py-12 text-center rounded-3xl border border-dashed shadow-sm border-slate-300 bg-slate-50/80">
      <div className="flex justify-center items-center mx-auto w-14 h-14 bg-white rounded-2xl shadow-sm text-slate-500">
        <FileText size={24} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Rejection Reason Card
// ─────────────────────────────────────────────────────────────────────────────

const RejectionReasonCard = memo(function RejectionReasonCard({ reason }) {
  if (!reason) return null;

  return (
    <div className="p-4 rounded-2xl border border-red-200 shadow-sm bg-red-50/90">
      <div className="flex gap-3 items-start">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm">
          <AlertCircle size={16} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-red-800">
            Rejection Reason
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700">{reason}</p>
        </div>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PatientProfile({
  viewMode = PATIENT_PROFILE_VIEW_MODE.PROFILE,
}) {
  const {
    user,
    form,
    errors,
    isLoading,
    isSaving,
    isDeleting,
    serverError,
    successMessage,
    profileMeta,
    doctorApplication,
    doctorUpgradeForm,
    doctorUpgradeErrors,
    isSubmittingDoctorUpgrade,
    doctorUpgradeError,
    doctorUpgradeSuccess,
    profilePicturePreviewUrl,
    isDoctorRequestPending,
    isDoctorRequestRejected,
    isPatientFormLocked,
    isDoctorUpgradeDisabled,
    doctorUpgradeButtonLabel,
    canShowDoctorUpgrade,
    isProfileView,
    showDoctorUpgradeForm,
    shouldShowPatientForm,
    shouldShowDoctorUpgradeSection,
    patientFormTitle,
    patientDescription,
    patientSubmitLabel,
    doctorSectionDescription,
    updateField,
    handleFieldBlur,
    isFormValid,
    updateDoctorUpgradeField,
    handleDoctorUpgradeFieldBlur,
    isDoctorUpgradeFormValid,
    handleSubmit,
    handleDoctorUpgradeSubmit,
    handleDeleteProfile,
    setServerError,
    setSuccessMessage,
    setDoctorUpgradeError,
    setDoctorUpgradeSuccess,
    setShowDoctorUpgradeForm,
  } = usePatientProfileController({ viewMode });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const hasNoProfileContent =
    !shouldShowPatientForm && !shouldShowDoctorUpgradeSection;

  return (
    <div className="mx-auto mt-4 max-w-5xl space-y-5 pb-12 animate-[fadeIn_0.3s_ease]">
      {/* Global alerts */}
      <div className="space-y-3">
        {isDoctorRequestPending && (
          <AlertBanner
            type="warning"
            message="Your doctor request is under review. To make changes, use Update Doctor Profile below."
          />
        )}

        {isDoctorRequestRejected && (
          <AlertBanner
            type="error"
            message="Your doctor request was rejected. Check the reason, update your details, and submit again."
          />
        )}

        <AlertBanner
          type="error"
          message={serverError}
          onDismiss={() => setServerError("")}
        />

        <AlertBanner
          type="success"
          message={successMessage}
          onDismiss={() => setSuccessMessage("")}
        />
      </div>

      {/* Empty state */}
      {hasNoProfileContent && (
        <EmptyState
          title="Nothing to show right now"
          description="We could not load your profile details right now."
        />
      )}

      {/* Patient profile section */}
      {shouldShowPatientForm && (
        <div className="space-y-4">
          <SectionHeader
            icon={Stethoscope}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            title={patientFormTitle}
            description={patientDescription}
          >
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[320px] sm:items-end">
              <div className="flex flex-wrap gap-2 items-center sm:justify-end">
                {profileMeta && <StatusPill variant="active" />}
                {isDoctorRequestPending && <StatusPill variant="pending" />}
                {isDoctorRequestRejected && <StatusPill variant="rejected" />}

                {canShowDoctorUpgrade && isProfileView && !showDoctorUpgradeForm && (
                  <button
                    type="button"
                    disabled={isDoctorUpgradeDisabled}
                    onClick={() => {
                      if (isDoctorUpgradeDisabled) return;
                      setShowDoctorUpgradeForm(true);
                      setDoctorUpgradeError("");
                      setDoctorUpgradeSuccess("");
                    }}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                      isDoctorUpgradeDisabled
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                        : "cursor-pointer border-blue-200 bg-blue-50 text-blue-700 hover:-translate-y-0.5 hover:bg-blue-100"
                    }`}
                  >
                    <UserPlus size={15} aria-hidden="true" />
                    {doctorUpgradeButtonLabel}
                  </button>
                )}
              </div>

              {canShowDoctorUpgrade &&
                isProfileView &&
                !showDoctorUpgradeForm &&
                isDoctorUpgradeDisabled &&
                !isDoctorRequestPending && (
                  <p className="text-xs font-medium text-slate-500 sm:max-w-md sm:text-right">
                    Doctor upgrade is not available right now.
                  </p>
                )}

              {canShowDoctorUpgrade &&
                isProfileView &&
                !showDoctorUpgradeForm &&
                !isDoctorUpgradeDisabled &&
                !isDoctorRequestPending &&
                !isDoctorRequestRejected && (
                  <p className="text-xs font-medium text-slate-500 sm:max-w-md sm:text-right">
                   Use this account to apply as a doctor. Once you complete your patient profile, this phone number cannot be used for another doctor request.
                  </p>
                )}
            </div>
          </SectionHeader>

          <div className="overflow-hidden bg-white rounded-3xl border shadow-sm transition-all duration-300 border-slate-200 hover:shadow-md">
            <div className="p-4 sm:p-6">
              <PatientProfileForm
                headerTitle={patientFormTitle}
                headerDescription={patientDescription}
                headerActions={null}
                form={form}
                errors={errors}
                user={user}
                profileMeta={profileMeta}
                isPatientFormLocked={isPatientFormLocked}
                profilePicturePreviewUrl={profilePicturePreviewUrl}
                isSaving={isSaving}
                isDeleting={isDeleting}
                patientSubmitLabel={patientSubmitLabel}
                onSubmit={handleSubmit}
                onFieldChange={updateField}
                onFieldBlur={handleFieldBlur}
                isFormValid={isFormValid}
                onDeleteProfile={handleDeleteProfile}
              />
            </div>
          </div>
        </div>
      )}

      {/* Doctor upgrade section */}
      {shouldShowDoctorUpgradeSection && (
        <section
          className="space-y-4"
          aria-labelledby="doctor-upgrade-heading"
        >
          <SectionHeader
            icon={isDoctorRequestPending ? Stethoscope : UserPlus}
            iconBg={
              isDoctorRequestPending
                ? "bg-amber-50"
                : isDoctorRequestRejected
                  ? "bg-red-50"
                  : "bg-emerald-50"
            }
            iconColor={
              isDoctorRequestPending
                ? "text-amber-600"
                : isDoctorRequestRejected
                  ? "text-red-600"
                  : "text-emerald-600"
            }
            title="Doctor Upgrade Request"
            description={doctorSectionDescription}
          >
            {isDoctorRequestPending && <StatusPill variant="pending" />}
            {isDoctorRequestRejected && <StatusPill variant="rejected" />}
          </SectionHeader>

          {isDoctorRequestRejected && (
            <RejectionReasonCard reason={doctorApplication?.rejectionReason} />
          )}

          <div className="space-y-3">
            <AlertBanner
              type="error"
              message={doctorUpgradeError}
              onDismiss={() => setDoctorUpgradeError("")}
            />

            <AlertBanner
              type="success"
              message={doctorUpgradeSuccess}
              onDismiss={() => setDoctorUpgradeSuccess("")}
            />
          </div>

          <div className="overflow-hidden bg-white rounded-3xl border shadow-sm transition-all duration-300 border-slate-200 hover:shadow-md">
            <div className="p-4 sm:p-6">
              <DoctorUpgradeRequestForm
                form={doctorUpgradeForm}
                errors={doctorUpgradeErrors}
                isSubmitting={isSubmittingDoctorUpgrade}
                onFieldChange={updateDoctorUpgradeField}
                onFieldBlur={handleDoctorUpgradeFieldBlur}
                isFormValid={isDoctorUpgradeFormValid}
                onSubmit={handleDoctorUpgradeSubmit}
                onCancel={
                  isProfileView && showDoctorUpgradeForm
                    ? () => {
                        setShowDoctorUpgradeForm(false);
                        setDoctorUpgradeError("");
                        setDoctorUpgradeSuccess("");
                      }
                    : undefined
                }
                disabled={false}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
