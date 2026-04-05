import { Info, Stethoscope, UserPlus } from "lucide-react";
import { AlertCircle, CheckCircle2, Clock, X, XCircle } from "lucide-react";
import DoctorUpgradeRequestForm from "../components/DoctorUpgradeRequestForm";
import PatientProfileForm from "../components/PatientProfileForm";
import usePatientProfileController, {
  PATIENT_PROFILE_VIEW_MODE,
} from "../hooks/usePatientProfile";

// ─── Constants ────────────────────────────────────────────────────────────────

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Bone({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-lg bg-neutral-100 ${className}`} />
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Page header skeleton */}
      <div className="card">
        <div className="flex items-center gap-3">
          <Bone className="flex-shrink-0 w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Bone className="w-40 h-5" />
            <Bone className="w-64 h-3" />
          </div>
        </div>
      </div>

      {/* Form skeleton */}
      <div className="space-y-5 card">
        <div className="flex items-center gap-4">
          <Bone className="flex-shrink-0 w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Bone className="h-4 w-36" />
            <Bone className="h-3 w-52" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Bone className="h-3.5 w-20" />
              <Bone className="w-full h-10" />
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <Bone className="h-3.5 w-24" />
          <Bone className="w-full h-20" />
        </div>
        <div className="space-y-1.5">
          <Bone className="h-3.5 w-28" />
          <Bone className="w-full h-24" />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
          <Bone className="w-24 h-10 rounded-xl" />
          <Bone className="w-32 h-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Alert banner ─────────────────────────────────────────────────────────────

const ALERT_STYLES = {
  error: {
    wrap: "bg-red-50 border-red-200 text-red-700",
    Icon: AlertCircle,
    iconCls: "text-red-500",
  },
  success: {
    wrap: "bg-emerald-50 border-emerald-200 text-emerald-700",
    Icon: CheckCircle2,
    iconCls: "text-emerald-500",
  },
  info: {
    wrap: "bg-sky-50 border-sky-200 text-sky-700",
    Icon: Info,
    iconCls: "text-sky-500",
  },
  warning: {
    wrap: "bg-amber-50 border-amber-200 text-amber-700",
    Icon: AlertCircle,
    iconCls: "text-amber-500",
  },
};

function AlertBanner({ type = "info", message, onDismiss }) {
  if (!message) return null;
  const { wrap, Icon, iconCls } = ALERT_STYLES[type] ?? ALERT_STYLES.info;
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm animate-[fadeIn_0.2s_ease] ${wrap}`}
    >
      <Icon
        size={15}
        className={`mt-0.5 flex-shrink-0 ${iconCls}`}
        aria-hidden="true"
      />
      <span className="flex-1 leading-relaxed">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 transition-opacity rounded opacity-50 cursor-pointer hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS_PILLS = {
  active: {
    icon: CheckCircle2,
    label: "Profile active",
    cls: "bg-emerald-50 border-emerald-200 text-emerald-700",
    dot: "bg-emerald-400",
  },
  pending: {
    icon: Clock,
    label: "Upgrade under review",
    cls: "bg-amber-50 border-amber-200 text-amber-700",
    dot: "bg-amber-400 animate-pulse",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected — can resubmit",
    cls: "bg-red-50 border-red-200 text-red-700",
    dot: "bg-red-400",
  },
};

function StatusPill({ variant }) {
  const cfg = STATUS_PILLS[variant];
  if (!cfg) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${cfg.cls}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`}
        aria-hidden="true"
      />
      {cfg.label}
    </span>
  );
}

// ─── Section card header ──────────────────────────────────────────────────────

function PageSectionHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  children,
}) {
  return (
    <div className="card">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center min-w-0 gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}
            aria-hidden="true"
          >
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold leading-tight text-neutral-900">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
        {children && (
          <div className="flex flex-wrap items-center gap-2">{children}</div>
        )}
      </div>
    </div>
  );
}

// ─── Rejection reason card ────────────────────────────────────────────────────

function RejectionReasonCard({ reason }) {
  if (!reason) return null;
  return (
    <div className="flex items-start gap-3 px-4 py-3 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50">
      <AlertCircle
        size={14}
        className="flex-shrink-0 mt-0.5 text-red-500"
        aria-hidden="true"
      />
      <div>
        <p className="font-semibold text-xs mb-0.5 text-red-800">
          Rejection reason
        </p>
        <p className="text-xs leading-relaxed">{reason}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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
    updateDoctorUpgradeField,
    handleSubmit,
    handleDoctorUpgradeSubmit,
    handleDeleteProfile,
    setServerError,
    setSuccessMessage,
    setDoctorUpgradeError,
    setDoctorUpgradeSuccess,
    setShowDoctorUpgradeForm,
  } = usePatientProfileController({ viewMode });

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) return <ProfileSkeleton />;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-5 mt-4 pb-12 animate-[fadeIn_0.3s_ease]">
      {/* ── Patient alerts ────────────────────────────────────────────── */}
      {isDoctorRequestPending && (
        <AlertBanner
          type="warning"
          message="Your doctor upgrade request is under review. You can continue updating your doctor application details while it is pending."
        />
      )}
      {isDoctorRequestRejected && (
        <AlertBanner
          type="error"
          message="Your doctor upgrade request was rejected. You can update and resubmit your application below."
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

      {/* ── Patient profile form ──────────────────────────────────────── */}
      {shouldShowPatientForm && (
        <PatientProfileForm
          headerTitle={patientFormTitle}
          headerDescription={patientDescription}
          headerActions={
            <>
              {profileMeta && <StatusPill variant="active" />}
              {isDoctorRequestPending && <StatusPill variant="pending" />}
              {isDoctorRequestRejected && <StatusPill variant="rejected" />}
              {canShowDoctorUpgrade &&
                isProfileView &&
                !showDoctorUpgradeForm && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDoctorUpgradeForm(true);
                      setDoctorUpgradeError("");
                      setDoctorUpgradeSuccess("");
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary text-sm font-medium transition-colors cursor-pointer hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <UserPlus size={14} aria-hidden="true" />
                    Upgrade as Doctor
                  </button>
                )}
            </>
          }
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
          onDeleteProfile={handleDeleteProfile}
        />
      )}

      {/* ── Doctor upgrade section ────────────────────────────────────── */}
      {shouldShowDoctorUpgradeSection && (
        <section className="space-y-4" aria-labelledby="doctor-upgrade-heading">
          {/* Section header */}
          <PageSectionHeader
            icon={isDoctorRequestPending ? Stethoscope : UserPlus}
            iconBg={
              isDoctorRequestPending
                ? "bg-amber-50"
                : isDoctorRequestRejected
                  ? "bg-red-50"
                  : "bg-primary/10"
            }
            iconColor={
              isDoctorRequestPending
                ? "text-amber-600"
                : isDoctorRequestRejected
                  ? "text-red-600"
                  : "text-primary"
            }
            title="Doctor Upgrade Request"
            description={doctorSectionDescription}
          >
            {isDoctorRequestPending && <StatusPill variant="pending" />}
            {isDoctorRequestRejected && <StatusPill variant="rejected" />}
          </PageSectionHeader>

          {/* Rejection reason */}
          {isDoctorRequestRejected && (
            <RejectionReasonCard reason={doctorApplication?.rejectionReason} />
          )}

          {/* Doctor upgrade alerts */}
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

          {/* Doctor upgrade form */}
          <DoctorUpgradeRequestForm
            form={doctorUpgradeForm}
            errors={doctorUpgradeErrors}
            isSubmitting={isSubmittingDoctorUpgrade}
            onFieldChange={updateDoctorUpgradeField}
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
        </section>
      )}
    </div>
  );
}
