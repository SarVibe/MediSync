import {
  AlertCircle,
  ArrowLeft,
  Award,
  Calendar,
  ChevronDown,
  ImagePlus,
  Loader2,
  Save,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  normalizeUpper,
  validateProfilePictureFile,
} from "../../../utils/validation";
import { notifyApiSuccess, notifyError } from "../../../utils/toast";
 
const PROFILE_IMAGE_BASE_URL = (
  import.meta.env.VITE_PROFILE_IMAGE_BASE_URL || "http://localhost:8083"
).replace(/\/$/, "");
 
// ─── Constants ────────────────────────────────────────────────────────────────
 
const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER"];
 
const QUALIFICATION_OPTIONS = [
  "MBBS - General Physician",
  "MD - Medicine",
  "MS - Surgery",
  "DM / MCh - Super Specialist",
  "BDS - Dentist",
];
 
const SPECIALIZATION_OPTIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Gynecologist",
  "Urologist",
  "ENT Specialist",
  "Ophthalmologist",
];
 
const GENDER_LABELS = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other / Prefer not to say",
};
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
 
const getInputClasses = (hasError = false) =>
  [
    "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm",
    "placeholder:text-slate-400",
    "outline-none transition-all duration-200",
    "hover:border-slate-300",
    "focus:border-primary focus:ring-4 focus:ring-primary/10",
    "disabled:cursor-not-allowed disabled:opacity-60",
    hasError
      ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200",
  ].join(" ");
 
const getDropZoneClasses = ({ disabled, dragging, error, hasImage }) =>
  [
    "relative flex w-full cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10",
    disabled ? "cursor-not-allowed opacity-60" : "",
    dragging
      ? "scale-[1.01] border-primary bg-primary/5"
      : error
        ? "border-red-300 bg-red-50/30 hover:border-red-400"
        : hasImage
          ? "border-slate-200 bg-slate-50 hover:border-primary/40 hover:bg-primary/5"
          : "border-slate-200 bg-slate-50/80 hover:border-primary/40 hover:bg-primary/5",
  ].join(" ");
 
const resolveProfileImageUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    /^https?:\/\//i.test(url)
  ) {
    return url;
  }
 
  return `${PROFILE_IMAGE_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};
 
// ─── Field wrapper ────────────────────────────────────────────────────────────
 
function Field({
  label,
  htmlFor,
  icon: Icon,
  error,
  required = false,
  hint,
  children,
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="flex gap-2 items-center text-sm font-semibold text-slate-700"
      >
        {Icon ? (
          <Icon
            size={14}
            className="shrink-0 text-slate-400"
            aria-hidden="true"
          />
        ) : null}
 
        <span>{label}</span>
 
        {required ? (
          <span className="text-xs font-bold text-red-500" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
 
      {children}
 
      {hint && !error ? (
        <p className="text-xs leading-5 text-slate-500">{hint}</p>
      ) : null}
 
      {error ? (
        <p
          role="alert"
          className="flex items-start gap-1.5 text-xs font-medium text-red-600"
        >
          <AlertCircle
            size={12}
            className="mt-px shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
 
// ─── Status blocks ────────────────────────────────────────────────────────────
 
function InlineStatus({ type = "info", message }) {
  if (!message) return null;
 
  const variants = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-slate-200 bg-slate-50 text-slate-700",
  };
 
  return (
    <div
      className={`px-4 py-3 text-sm font-medium rounded-2xl border ${variants[type]}`}
      role={type === "error" ? "alert" : "status"}
    >
      <div className="flex gap-2 items-start">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
}
 
// ─── Select field ─────────────────────────────────────────────────────────────
 
function GenderSelect({ id, value, onChange, onBlur, hasError, disabled }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`${getInputClasses(hasError)} appearance-none pr-11 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        aria-invalid={hasError}
      >
        <option value="">Select gender</option>
        {GENDER_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {GENDER_LABELS[option]}
          </option>
        ))}
      </select>
 
      <ChevronDown
        size={16}
        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
        aria-hidden="true"
      />
    </div>
  );
}
 
function SelectField({
  id,
  value,
  onChange,
  onBlur,
  hasError,
  disabled,
  placeholder,
  options,
}) {
  const normalizedOptions = value && !options.includes(value)
    ? [value, ...options]
    : options;
 
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`${getInputClasses(hasError)} appearance-none pr-11 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        aria-invalid={hasError}
      >
        <option value="">{placeholder}</option>
        {normalizedOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
 
      <ChevronDown
        size={16}
        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
        aria-hidden="true"
      />
    </div>
  );
}
 
// ─── Skeleton ─────────────────────────────────────────────────────────────────
 
function SkeletonField({ wide = false, tall = false }) {
  return (
    <div className={`space-y-2 ${wide ? "md:col-span-2" : ""}`}>
      <div className="w-28 h-4 rounded animate-pulse bg-slate-200" />
      <div
        className={`w-full animate-pulse rounded-2xl bg-slate-100 ${
          tall ? "h-28" : "h-12"
        }`}
      />
    </div>
  );
}
 
// ─── Empty state ──────────────────────────────────────────────────────────────
 
function EmptyState({ onReset, disabled }) {
  return (
    <div className="md:col-span-2">
      <div className="px-6 py-10 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
        <div className="flex justify-center items-center mx-auto w-12 h-12 bg-white rounded-2xl shadow-sm">
          <Stethoscope className="w-5 h-5 text-slate-400" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">
          No doctor details yet
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Start filling the form to submit your doctor upgrade request.
        </p>
 
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            disabled={disabled}
            className="inline-flex justify-center items-center px-4 py-2 mt-5 text-sm font-semibold bg-white rounded-xl border transition cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset Form
          </button>
        ) : null}
      </div>
    </div>
  );
}
 
// ─── Profile picture uploader ─────────────────────────────────────────────────
 
function ImagePreviewDialog({ imageUrl, alt, onClose }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
 
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);
 
  if (!imageUrl) return null;
 
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-4xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image preview"
          className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
        >
          <X size={18} aria-hidden="true" />
        </button>
 
        <img
          src={resolveProfileImageUrl(imageUrl)}
          alt={alt || "Preview image"}
          className="max-h-[80vh] w-full rounded-3xl bg-white object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}
 
function ProfilePictureUploader({
  form,
  onFieldChange,
  onFieldBlur,
  error,
  disabled,
}) {
  const inputRef = useRef(null);
  const objectUrlRef = useRef("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
 
  const hasExisting = Boolean(String(form?.profilePictureUrl || "").trim());
 
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);
 
  useEffect(() => {
    if (!form?.profilePictureFile && objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
      setPreviewUrl("");
    }
  }, [form?.profilePictureFile]);
 
  const hasSelectedFile = form?.profilePictureFile instanceof File;
  const displayUrl = hasSelectedFile
    ? previewUrl
    : hasExisting
      ? form.profilePictureUrl
      : "";
  const hasImage = Boolean(displayUrl);
 
  const handleFile = (file) => {
    if (disabled || !file) return;
 
    const fileError = validateProfilePictureFile(file, {
      requiredValue: true,
      maxSizeMB: 5,
    });
    if (fileError) {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      onFieldChange("profilePictureFile", null);
      onFieldBlur?.("profilePictureFile", file);
      return;
    }
 
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
 
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    onFieldChange("profilePictureFile", file);
    onFieldBlur?.("profilePictureFile", file);
  };
 
  const handleDrop = (event) => {
    if (disabled) return;
 
    event.preventDefault();
    setDragging(false);
 
    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  };
 
  const handleKeyDown = (event) => {
    if (disabled) return;
 
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  };
 
  const handleClear = (event) => {
    if (disabled) return;
 
    event.stopPropagation();
    onFieldChange("profilePictureFile", null);
    onFieldBlur?.("profilePictureFile", null);
 
    if (inputRef.current) {
      inputRef.current.value = "";
    }
 
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }
 
    setPreviewUrl("");
  };
 
  return (
    <>
      {isImagePreviewOpen ? (
        <ImagePreviewDialog
          imageUrl={displayUrl}
          alt="Profile preview"
          onClose={() => setIsImagePreviewOpen(false)}
        />
      ) : null}
 
      <Field
      label="Profile Picture"
      htmlFor="profilePictureFile"
      icon={ImagePlus}
      required={!hasExisting}
      error={error}
      hint="JPEG or PNG, maximum size 5 MB"
    >
      <input
        ref={inputRef}
        id="profilePictureFile"
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        disabled={disabled}
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
        onBlur={() => onFieldBlur?.("profilePictureFile")}
        aria-label="Upload profile picture"
      />
 
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label="Click or drag to upload profile picture"
        onClick={() => {
          if (!disabled) inputRef.current?.click();
        }}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => {
          if (disabled) return;
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => {
          if (!disabled) setDragging(false);
        }}
        onDrop={handleDrop}
        className={getDropZoneClasses({
          disabled,
          dragging,
          error,
          hasImage,
        })}
      >
        {hasImage ? (
          <div className="flex gap-4 items-center w-full text-left">
            <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsImagePreviewOpen(true);
                  }}
                  className="cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
                  aria-label="View profile image"
                >
                <img
                  src={resolveProfileImageUrl(displayUrl)}
                  alt="Profile preview"
                  className="object-cover w-16 h-16 rounded-full border-2 border-white shadow-sm transition-transform duration-200 hover:scale-[1.03]"
                />
              </button>
 
              {previewUrl ? (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={disabled}
                  aria-label="Remove selected image"
                  className="inline-flex absolute -top-1 -right-1 justify-center items-center w-6 h-6 text-white bg-red-500 rounded-full shadow-sm transition cursor-pointer hover:bg-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-not-allowed"
                >
                  <X size={11} aria-hidden="true" />
                </button>
              ) : null}
            </div>
 
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-800">
                {form?.profilePictureFile?.name || "Current profile image"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Click the image to enlarge it. Click elsewhere to replace it.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center items-center w-12 h-12 rounded-2xl shadow-sm bg-primary/10 text-primary">
              <ImagePlus size={18} aria-hidden="true" />
            </div>
 
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Drop image here or{" "}
                <span className="underline text-primary underline-offset-2">
                  browse
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                JPEG or PNG · maximum 5 MB
              </p>
            </div>
          </>
        )}
      </div>
    </Field>
    </>
  );
}
 
// ─── Main component ───────────────────────────────────────────────────────────
 
export default function DoctorUpgradeRequestForm({
  form,
  errors,
  isSubmitting,
  onFieldChange,
  onFieldBlur,
  isFormValid = true,
  onSubmit,
  onCancel,
  disabled = false,
  formAriaLabel = "Doctor upgrade request form",
  showHeader = true,
  showCancel = true,
  submitLabel = "Submit Request",
  submittingLabel = "Submitting...",
  disabledSubmitLabel = "Under Review",
}) {
  const [submitError, setSubmitError] = useState("");
  const [localSuccessMessage, setLocalSuccessMessage] = useState("");
 
  const isFormEmpty = useMemo(() => {
    return !(
      form?.fullName ||
      form?.gender ||
      form?.specialization ||
      form?.experienceYears ||
      form?.qualifications ||
      form?.profilePictureFile ||
      form?.profilePictureUrl
    );
  }, [form]);
 
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (disabled || isSubmitting || !isFormValid) return;
 
    try {
      setSubmitError("");
      setLocalSuccessMessage("");
 
      const result = await onSubmit(event);
 
      if (result?.successMessage) {
        setLocalSuccessMessage(result.successMessage);
        notifyApiSuccess(result, result.successMessage);
      }
    } catch (error) {
      const message =
        error?.message || "Unable to submit the doctor upgrade request.";
      setSubmitError(message);
      notifyError(message);
    }
  };
 
  const handleReset = () => {
    if (disabled || isSubmitting) return;
 
    onFieldChange("fullName", "");
    onFieldChange("gender", "");
    onFieldChange("specialization", "");
    onFieldChange("experienceYears", "");
    onFieldChange("qualifications", "");
    onFieldChange("profilePictureFile", null);
  };
 
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label={formAriaLabel}
      className="overflow-hidden bg-white rounded-3xl border shadow-sm border-slate-200"
    >
      {showHeader ? (
        <div className="px-5 py-4 via-white border-b bg-linear-to-r border-slate-100 from-slate-50 to-slate-50 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
                aria-label="Back to patient profile"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back to Patient Profile
              </button>
            ) : (
              <span className="text-sm font-medium text-slate-500">
                Doctor details
              </span>
            )}
 
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
              Doctor Upgrade Form
            </div>
          </div>
        </div>
      ) : null}
 
      <div className="px-5 py-6 space-y-5 sm:px-6 lg:px-8">
        <div className="p-4 rounded-2xl bg-slate-50/80">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Professional Information
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Provide accurate medical and professional details. Weak or incomplete
            information will only slow down approval.
          </p>
        </div>
 
        <InlineStatus type="error" message={submitError} />
        <InlineStatus type="success" message={localSuccessMessage} />
 
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {isSubmitting ? (
            <>
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <SkeletonField wide tall />
              <SkeletonField wide tall />
            </>
          ) : isFormEmpty ? (
            <EmptyState onReset={handleReset} disabled={disabled} />
          ) : (
            <>
              <Field
                label="Full Name"
                htmlFor="fullName"
                icon={User}
                required
                error={errors?.fullName}
                hint='Always prefixed with "Dr."'
              >
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => onFieldChange("fullName", e.target.value)}
                  onBlur={() => onFieldBlur?.("fullName")}
                  disabled={disabled}
                  className={getInputClasses(!!errors?.fullName)}
                  placeholder="Dr. Jane Smith"
                  aria-invalid={!!errors?.fullName}
                />
              </Field>
 
              <Field
                label="Gender"
                htmlFor="gender"
                icon={User}
                required
                error={errors?.gender}
              >
                <GenderSelect
                  id="gender"
                  value={form.gender}
                  onChange={(e) =>
                    onFieldChange("gender", normalizeUpper(e.target.value))
                  }
                  onBlur={() => onFieldBlur?.("gender")}
                  disabled={disabled}
                  hasError={!!errors?.gender}
                />
              </Field>
 
              <Field
                label="Specialization"
                htmlFor="specialization"
                icon={Stethoscope}
                required
                error={errors?.specialization}
                hint="Choose the closest matching specialty"
              >
                <SelectField
                  id="specialization"
                  value={form.specialization}
                  onChange={(e) => onFieldChange("specialization", e.target.value)}
                  onBlur={() => onFieldBlur?.("specialization")}
                  disabled={disabled}
                  hasError={!!errors?.specialization}
                  placeholder="Select Specialization"
                  options={SPECIALIZATION_OPTIONS}
                />
              </Field>
 
              <Field
                label="Years of Experience"
                htmlFor="experienceYears"
                icon={Calendar}
                required
                error={errors?.experienceYears}
                hint="Total years of medical practice"
              >
                <input
                  id="experienceYears"
                  type="number"
                  min="1"
                  max="70"
                  value={form.experienceYears}
                  onChange={(e) =>
                    onFieldChange("experienceYears", e.target.value)
                  }
                  onBlur={() => onFieldBlur?.("experienceYears")}
                  disabled={disabled}
                  className={getInputClasses(!!errors?.experienceYears)}
                  placeholder="5"
                  aria-invalid={!!errors?.experienceYears}
                />
              </Field>
 
              <div className="md:col-span-2">
                <Field
                  label="Qualifications"
                  htmlFor="qualifications"
                  icon={Award}
                  required
                  error={errors?.qualifications}
                  hint="Choose the primary medical qualification"
                >
                  <SelectField
                    id="qualifications"
                    value={form.qualifications}
                    onChange={(e) => onFieldChange("qualifications", e.target.value)}
                    onBlur={() => onFieldBlur?.("qualifications")}
                    disabled={disabled}
                    hasError={!!errors?.qualifications}
                    placeholder="Select Qualification"
                    options={QUALIFICATION_OPTIONS}
                  />
                </Field>
              </div>
 
              <div className="md:col-span-2">
                <ProfilePictureUploader
                  form={form}
                  onFieldChange={onFieldChange}
                  onFieldBlur={onFieldBlur}
                  error={errors?.profilePictureFile}
                  disabled={disabled}
                />
              </div>
            </>
          )}
        </div>
      </div>
 
      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/80 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {showCancel && onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || disabled}
              className="inline-flex justify-center items-center px-5 py-3 text-sm font-semibold bg-white rounded-2xl border transition cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          ) : null}
 
          <button
            type="submit"
            disabled={isSubmitting || disabled || !isFormValid}
            aria-busy={isSubmitting}
            className="inline-flex min-w-44 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-xl hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                {submittingLabel}
              </>
            ) : disabled ? (
              <>
                <Loader2 size={16} aria-hidden="true" />
                {disabledSubmitLabel}
              </>
            ) : (
              <>
                <Save size={16} aria-hidden="true" />
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}