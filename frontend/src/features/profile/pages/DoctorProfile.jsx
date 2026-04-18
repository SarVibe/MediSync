/* eslint-disable no-unused-vars */
import { useMemo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  BadgeCheck,
  ClipboardList,
  FileText,
  ShieldCheck,
  Sparkles,
  RefreshCcw,
} from "lucide-react";
import useDoctorProfileController from "../hooks/useDoctorProfile";
import DoctorUpgradeRequestForm from "../components/DoctorUpgradeRequestForm";
import { resolveProfileImageUrl } from "../utils/profileUtils";

const STATUS_CONFIG = {
  NOT_SUBMITTED: {
    label: "Not Submitted",
    badgeClass:
      "border border-slate-200 bg-slate-50 text-slate-600",
    dotClass: "bg-slate-400",
    icon: FileText,
    panelClass:
      "border-slate-200 bg-slate-50/80 text-slate-700",
    title: "Application not submitted yet",
    description:
      "Complete the required details and submit your request to begin the doctor verification process.",
  },
  PENDING: {
    label: "Pending Review",
    badgeClass:
      "border border-amber-200 bg-amber-50 text-amber-700",
    dotClass: "bg-amber-500 animate-pulse",
    icon: Sparkles,
    panelClass:
      "border-amber-200 bg-amber-50/80 text-amber-800",
    title: "Your application is under review",
    description:
      "Your submitted details are currently being reviewed by the admin team. You can still update your application if needed.",
  },
  APPROVED: {
    label: "Approved",
    badgeClass:
      "border border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
    icon: ShieldCheck,
    panelClass:
      "border-emerald-200 bg-emerald-50/80 text-emerald-800",
    title: "You are an approved doctor",
    description:
      "Your doctor profile is verified. Keep your information accurate and up to date.",
  },
  REJECTED: {
    label: "Rejected",
    badgeClass:
      "border border-red-200 bg-red-50 text-red-700",
    dotClass: "bg-red-500",
    icon: AlertCircle,
    panelClass:
      "border-red-200 bg-red-50/80 text-red-800",
    title: "Application needs correction",
    description:
      "Your previous application was rejected. Review your details carefully, fix the issues, and resubmit properly.",
  },
};

function SkeletonBlock({ className = "" }) {
  return <div className={`rounded-xl animate-pulse bg-slate-200 ${className}`} />;
}

function SkeletonField() {
  return (
    <div className="space-y-2">
      <SkeletonBlock className="w-28 h-4" />
      <SkeletonBlock className="w-full h-12" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto space-y-6 max-w-5xl">
      <div className="overflow-hidden bg-white rounded-3xl border shadow-sm border-slate-200">
        <div className="flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-1 gap-4 items-start">
            <SkeletonBlock className="w-14 h-14 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <SkeletonBlock className="w-52 h-7" />
              <SkeletonBlock className="w-full max-w-xl h-4" />
              <SkeletonBlock className="w-72 h-4" />
              <SkeletonBlock className="w-32 h-7 rounded-full" />
            </div>
          </div>
          <SkeletonBlock className="w-full h-24 rounded-2xl md:w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SkeletonBlock className="w-full h-28 rounded-2xl" />
        <SkeletonBlock className="w-full h-28 rounded-2xl" />
        <SkeletonBlock className="w-full h-28 rounded-2xl" />
      </div>

      <div className="overflow-hidden bg-white rounded-3xl border shadow-sm border-slate-200">
        <div className="p-5 space-y-6 sm:p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <SkeletonField />
            <SkeletonField />
            <SkeletonField />
            <SkeletonField />
          </div>
          <SkeletonField />
          <SkeletonField />
          <div className="flex justify-end">
            <SkeletonBlock className="w-40 h-12 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ isDoctorRole }) {
  return (
    <div className="px-6 py-14 text-center bg-white rounded-3xl border border-dashed shadow-sm border-slate-300">
      <div className="flex justify-center items-center mx-auto w-16 h-16 rounded-2xl bg-slate-100 text-slate-500">
        <ClipboardList className="w-7 h-7" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-slate-900">
        No profile data available
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {isDoctorRole
          ? "Your doctor profile data could not be loaded right now. Refresh and try again."
          : "Your application data is not available yet. Start by filling in the doctor upgrade form below."}
      </p>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value, accent = "default" }) {
  const accentStyles = {
    default: "bg-slate-50 text-slate-700 border-slate-200",
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${accentStyles[accent]}`}
    >
      <div className="flex gap-3 justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-80">
            {title}
          </p>
          <p className="mt-2 text-base font-semibold leading-6">{value}</p>
        </div>
        <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-sm bg-white/80">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

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
    isFormValid,
    handleSubmit,
    setField,
    handleFieldBlur,
  } = useDoctorProfileController();

  const approvalStatus = doctorData?.approvalStatus || "NOT_SUBMITTED";
  const statusCfg =
    STATUS_CONFIG[approvalStatus] ?? STATUS_CONFIG.NOT_SUBMITTED;

  const submitLabel = isDoctorRole
    ? "Update Profile"
    : doctorData
      ? "Update Application"
      : "Submit Application";

  const StatusIcon = statusCfg.icon;

  const infoCards = useMemo(
    () => [
      {
        id: "role",
        title: "Current Mode",
        value: isDoctorRole ? "Approved Doctor Profile" : "Doctor Upgrade Request",
        icon: isDoctorRole ? BadgeCheck : ClipboardList,
        accent: isDoctorRole ? "success" : "primary",
      },
      {
        id: "status",
        title: "Approval Status",
        value: statusCfg.label,
        icon: StatusIcon,
        accent:
          approvalStatus === "APPROVED"
            ? "success"
            : approvalStatus === "PENDING"
              ? "warning"
              : approvalStatus === "REJECTED"
                ? "primary"
                : "default",
      },
      {
        id: "action",
        title: "Next Action",
        value: isDoctorRole
          ? "Keep profile details updated"
          : approvalStatus === "PENDING"
            ? "Wait or edit your request"
            : approvalStatus === "REJECTED"
              ? "Fix issues and resubmit"
              : "Complete and submit form",
        icon: RefreshCcw,
        accent: "default",
      },
    ],
    [approvalStatus, isDoctorRole, statusCfg.label, StatusIcon]
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const hasVisibleData = Boolean(doctorData || form);

  return (
    <div className="mx-auto space-y-6 max-w-5xl">
      <section className="overflow-hidden relative bg-white rounded-3xl border shadow-sm border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.08),transparent_28%)]" />
        <div className="flex relative flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-1 gap-4 items-start">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-md overflow-hidden ${
                isDoctorRole
                  ? "bg-primary/10 text-primary"
                  : "text-amber-600 bg-amber-50"
              }`}
              aria-hidden="true"
            >
              {(doctorData?.profilePictureUrl || doctorData?.profileImageUrl) ? (
                <img
                  src={resolveProfileImageUrl(doctorData.profilePictureUrl || doctorData.profileImageUrl)}
                  alt={doctorData?.fullName || "Doctor"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/unknown.jpg";
                  }}
                />
              ) : isDoctorRole ? (
                <BadgeCheck className="w-8 h-8" />
              ) : (
                <ClipboardList className="w-8 h-8" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                MediSync Professional Verification
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {isDoctorRole ? "Doctor Profile" : "Doctor Upgrade Application"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                {isDoctorRole
                  ? "Manage your verified medical profile details and keep your professional information accurate."
                  : "Submit or update your doctor verification request with complete and correct professional details."}
              </p>

              <div className="mt-4">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${statusCfg.badgeClass}`}
                  aria-label={`Application status: ${statusCfg.label}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${statusCfg.dotClass}`}
                    aria-hidden="true"
                  />
                  {statusCfg.label}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`w-full rounded-2xl border p-4 md:max-w-sm ${statusCfg.panelClass}`}
          >
            <div className="flex gap-3 items-start">
              <div className="flex justify-center items-center w-11 h-11 rounded-xl shadow-sm shrink-0 bg-white/80">
                <StatusIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">{statusCfg.title}</h2>
                <p className="mt-1 text-sm leading-6 opacity-90">
                  {statusCfg.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 shadow-sm animate-[fadeIn_0.2s_ease]"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="font-semibold">Unable to save details</p>
            <p className="mt-1 leading-6">{serverError}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700 shadow-sm animate-[fadeIn_0.2s_ease]"
        >
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="font-semibold">Saved successfully</p>
            <p className="mt-1 leading-6">{successMessage}</p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {infoCards.map((card) => (
          <InfoCard
            key={card.id}
            icon={card.icon}
            title={card.title}
            value={card.value}
            accent={card.accent}
          />
        ))}
      </section>

      {!hasVisibleData ? (
        <EmptyState isDoctorRole={isDoctorRole} />
      ) : (
        <section className="overflow-hidden bg-white rounded-3xl border shadow-sm border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 sm:px-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {isDoctorRole ? "Professional Details" : "Application Details"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Fill in every field carefully. Sloppy data gets rejected.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <DoctorUpgradeRequestForm
              form={form}
              errors={errors}
              isSubmitting={isSaving}
              onFieldChange={setField}
              onFieldBlur={handleFieldBlur}
              isFormValid={isFormValid}
              onSubmit={handleSubmit}
              disabled={false}
              formAriaLabel={
                isDoctorRole ? "Doctor profile form" : "Doctor application form"
              }
              showHeader={false}
              showCancel={false}
              submitLabel={submitLabel}
              submittingLabel="Saving..."
            />
          </div>
        </section>
      )}
    </div>
  );
}
