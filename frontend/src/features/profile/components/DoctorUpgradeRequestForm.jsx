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
import { normalizeUpper } from "../../../utils/validation";
import { useEffect, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER"];
const GENDER_LABELS = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other / Prefer not to say",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls = (hasError) =>
  [
    "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-800",
    "placeholder:text-neutral-300 outline-none",
    "transition-all duration-200",
    "hover:border-neutral-300",
    "focus:border-primary focus:ring-2 focus:ring-primary/15",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    hasError
      ? "border-red-400 bg-red-50/40 focus:ring-red-100"
      : "border-neutral-200",
  ].join(" ");

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  icon: Icon,
  error,
  required,
  hint,
  children,
}) {
  return (
    <div className="space-y-1.5 group">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-sm font-medium text-neutral-700"
      >
        {Icon && (
          <Icon
            size={13}
            className="flex-shrink-0 transition-colors duration-200 text-neutral-400 group-focus-within:text-primary"
            aria-hidden="true"
          />
        )}
        {label}
        {required && (
          <span
            className="text-[10px] text-red-400 font-bold"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      {children}

      {hint && !error && (
        <p className="text-xs leading-relaxed text-neutral-400">{hint}</p>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-center gap-1 text-xs text-red-600 font-medium animate-[fadeIn_0.2s_ease]"
        >
          <AlertCircle size={11} className="flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Select field ─────────────────────────────────────────────────────────────

function GenderSelect({ id, value, onChange, hasError, disabled }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${inputCls(hasError)} appearance-none pr-10 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <option value="">Select gender</option>
        {GENDER_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {GENDER_LABELS[opt]}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="absolute -translate-y-1/2 pointer-events-none right-3 top-1/2 text-neutral-400"
        aria-hidden="true"
      />
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonField({ wide }) {
  return (
    <div className={`space-y-1.5 ${wide ? "md:col-span-2" : ""}`}>
      <div className="w-24 h-4 rounded bg-neutral-200 animate-pulse" />
      <div className="w-full h-10 bg-neutral-100 rounded-xl animate-pulse" />
    </div>
  );
}

// ─── Profile picture uploader ─────────────────────────────────────────────────

function ProfilePictureUploader({ form, onFieldChange, error, disabled }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const hasExisting = Boolean(String(form?.profilePictureUrl || "").trim());

  useEffect(() => {
    if (!form?.profilePictureFile) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(form.profilePictureFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form?.profilePictureFile]);

  const handleFile = (file) => {
    if (disabled) return;
    if (file && file.type.startsWith("image/"))
      onFieldChange("profilePictureFile", file);
  };

  const handleDrop = (e) => {
    if (disabled) return;
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const clear = (e) => {
    if (disabled) return;
    e.stopPropagation();
    onFieldChange("profilePictureFile", null);
    setPreviewUrl("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayUrl =
    previewUrl || (hasExisting ? form.profilePictureUrl : null);

  return (
    <Field
      label="Profile Picture"
      htmlFor="profilePictureFile"
      icon={ImagePlus}
      required={!hasExisting}
      error={error}
      hint="JPEG or PNG, max 5 MB"
    >
      {/* Hidden native file input */}
      <input
        ref={inputRef}
        id="profilePictureFile"
        type="file"
        accept="image/*"
        disabled={disabled}
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
        aria-label="Upload profile picture"
      />

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        aria-label="Click or drag to upload profile picture"
        onClick={() => {
          if (!disabled) inputRef.current?.click();
        }}
        onKeyDown={(e) =>
          !disabled &&
          (e.key === "Enter" || e.key === " ") &&
          inputRef.current?.click()
        }
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => {
          if (!disabled) setDragging(false);
        }}
        onDrop={handleDrop}
        className={[
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-6 transition-all duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          disabled ? "opacity-60 cursor-not-allowed" : "",
          dragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : error
              ? "border-red-300 bg-red-50/30 hover:border-red-400"
              : "border-neutral-200 bg-neutral-50/60 hover:border-primary/40 hover:bg-primary/3",
        ].join(" ")}
      >
        {displayUrl ? (
          /* Preview */
          <div className="flex items-center w-full gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={displayUrl}
                alt="Profile preview"
                className="object-cover border-2 border-white rounded-full shadow-sm w-14 h-14"
              />
              {previewUrl && (
                <button
                  type="button"
                  onClick={clear}
                  disabled={disabled}
                  aria-label="Remove selected image"
                  className="absolute flex items-center justify-center w-5 h-5 text-white transition-colors bg-red-500 rounded-full shadow-sm cursor-pointer -top-1 -right-1 hover:bg-red-600"
                >
                  <X size={10} aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate text-neutral-700">
                {form?.profilePictureFile?.name ?? "Current profile image"}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {previewUrl
                  ? "Click to change image"
                  : "Upload new image to replace"}
              </p>
            </div>
          </div>
        ) : (
          /* Empty state */
          <>
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{
                background:
                  "color-mix(in srgb, var(--color-primary) 10%, white)",
              }}
              aria-hidden="true"
            >
              <ImagePlus size={18} style={{ color: "var(--color-primary)" }} />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-neutral-700">
                Drop image here or{" "}
                <span style={{ color: "var(--color-primary)" }}>browse</span>
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                JPEG, PNG · max 5 MB
              </p>
            </div>
          </>
        )}
      </div>
    </Field>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DoctorUpgradeRequestForm({
  form,
  errors,
  isSubmitting,
  onFieldChange,
  onSubmit,
  onCancel,
  disabled = false,
  formAriaLabel = "Doctor upgrade request form",
  showHeader = true,
  showCancel = true,
  submitLabel = "Submit Request",
  submittingLabel = "Submitting…",
  disabledSubmitLabel = "Under Review",
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    onSubmit(e);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label={formAriaLabel}
      className="overflow-hidden bg-white border shadow-sm rounded-2xl border-neutral-150"
    >
      {/* ── Form header ───────────────────────────────────────────────── */}
      {showHeader && (
        <div className="flex items-center justify-between px-6 py-4 border-b sm:px-8 border-neutral-100 bg-neutral-50/50">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-md"
              aria-label="Back to patient profile"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Back to Patient Profile
            </button>
          ) : (
            <span className="text-sm text-neutral-500">Doctor details</span>
          )}
        </div>
      )}

      {/* ── Form body ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:px-8 md:grid-cols-2">
        {isSubmitting ? (
          <>
            <SkeletonField />
            <SkeletonField />
            <SkeletonField />
            <SkeletonField />
            <SkeletonField wide />
            <SkeletonField wide />
          </>
        ) : (
          <>
            {/* Full Name */}
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
                disabled={disabled}
                className={inputCls(!!errors?.fullName)}
                placeholder="Dr. Jane Smith"
                aria-invalid={!!errors?.fullName}
              />
            </Field>

            {/* Gender */}
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
                disabled={disabled}
                hasError={!!errors?.gender}
              />
            </Field>

            {/* Specialization */}
            <Field
              label="Specialization"
              htmlFor="specialization"
              icon={Stethoscope}
              required
              error={errors?.specialization}
              hint="e.g. Cardiology, Pediatrics"
            >
              <input
                id="specialization"
                type="text"
                value={form.specialization}
                onChange={(e) =>
                  onFieldChange("specialization", e.target.value)
                }
                disabled={disabled}
                className={inputCls(!!errors?.specialization)}
                placeholder="Cardiology"
                aria-invalid={!!errors?.specialization}
              />
            </Field>

            {/* Experience Years */}
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
                disabled={disabled}
                className={inputCls(!!errors?.experienceYears)}
                placeholder="5"
                aria-invalid={!!errors?.experienceYears}
              />
            </Field>

            {/* Qualifications — full width */}
            <div className="md:col-span-2">
              <Field
                label="Qualifications"
                htmlFor="qualifications"
                icon={Award}
                required
                error={errors?.qualifications}
                hint="List your degrees, certifications, and notable training"
              >
                <textarea
                  id="qualifications"
                  rows={3}
                  value={form.qualifications}
                  onChange={(e) =>
                    onFieldChange("qualifications", e.target.value)
                  }
                  disabled={disabled}
                  className={`${inputCls(!!errors?.qualifications)} resize-none leading-relaxed`}
                  placeholder="MBBS, MD (Cardiology), FRCP…"
                  aria-invalid={!!errors?.qualifications}
                />
              </Field>
            </div>

            {/* Profile picture — full width */}
            <div className="md:col-span-2">
              <ProfilePictureUploader
                form={form}
                onFieldChange={onFieldChange}
                error={errors?.profilePictureFile}
                disabled={disabled}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div className="flex flex-col-reverse justify-end gap-3 px-6 py-4 border-t sm:flex-row sm:px-8 bg-neutral-50/60 border-neutral-100">
        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || disabled}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting || disabled}
          aria-busy={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 min-w-[10rem]"
          style={{ background: "var(--color-primary)" }}
          onMouseEnter={(e) =>
            !isSubmitting &&
            !disabled &&
            (e.currentTarget.style.opacity = "0.9")
          }
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              {submittingLabel}
            </>
          ) : disabled ? (
            <>
              <Loader2 size={15} aria-hidden="true" />
              {disabledSubmitLabel}
            </>
          ) : (
            <>
              <Save size={15} aria-hidden="true" />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
