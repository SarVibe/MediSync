import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Droplets,
  Heart,
  Image as ImageIcon,
  Info,
  Loader2,
  MapPin,
  Save,
  Trash2,
  User,
  X,
} from "lucide-react";
import { normalizeUpper } from "../../../utils/validation";

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOOD_GROUP_OPTIONS = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
];

const BLOOD_GROUP_LABELS = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A−",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B−",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB−",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O−",
};

const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER"];
const GENDER_LABELS = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other / Prefer not to say",
};

const HEALTH_INFO_MAX = 2000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls = (hasError) =>
  [
    "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-800",
    "placeholder:text-neutral-300 outline-none",
    "transition-all duration-150",
    "hover:border-neutral-300",
    "focus:border-primary focus:ring-2 focus:ring-primary/15",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-50",
    hasError
      ? "border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-red-100"
      : "border-neutral-200",
  ].join(" ");

function getInitials(name) {
  if (!name) return "P";
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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
        <p className="text-[11px] text-neutral-400 leading-relaxed">{hint}</p>
      )}
      {error && (
        <p
          role="alert"
          className="flex items-center gap-1 text-xs text-red-600 font-medium animate-[fadeIn_0.15s_ease]"
        >
          <AlertCircle size={11} className="flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

function SelectField({
  id,
  value,
  onChange,
  options,
  labelMap,
  placeholder,
  disabled,
  hasError,
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${inputCls(hasError)} appearance-none pr-10 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {labelMap?.[opt] ?? opt}
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

// ─── Avatar ───────────────────────────────────────────────────────────────────

function AvatarPreview({ url, name }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [url]);

  const initials = getInitials(name);

  return (
    <div className="relative flex-shrink-0 w-16 h-16" aria-hidden="true">
      {url && !imgError ? (
        <img
          src={url}
          alt={name || "Profile"}
          onError={() => setImgError(true)}
          className="object-cover w-16 h-16 border-2 border-white rounded-full shadow-sm"
        />
      ) : (
        <div className="flex items-center justify-center w-16 h-16 border-2 border-white rounded-full shadow-sm bg-primary/10">
          <span
            className="text-lg font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            {initials}
          </span>
        </div>
      )}
      {/* Online dot */}
      <span className="absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full bg-emerald-400" />
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

const SECTION_COLORS = {
  primary: "bg-primary/10 text-primary",
  violet: "bg-violet-100 text-violet-600",
  rose: "bg-rose-100 text-rose-600",
  amber: "bg-amber-100 text-amber-600",
};

function SectionHeader({ icon: Icon, label, color = "primary" }) {
  return (
    <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
      <span
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${SECTION_COLORS[color]}`}
        aria-hidden="true"
      >
        <Icon size={14} />
      </span>
      <h3 className="text-sm font-semibold text-neutral-700">{label}</h3>
    </div>
  );
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

function DeleteConfirmDialog({ onConfirm, onClose, isDeleting }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-[slideUp_0.2s_ease]">
        <div className="flex items-start justify-between p-5 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-xl bg-red-50"
              aria-hidden="true"
            >
              <Trash2 size={16} className="text-red-500" />
            </div>
            <div>
              <h3
                id="delete-dialog-title"
                className="text-sm font-semibold text-neutral-900"
              >
                Delete Profile
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                This action cannot be undone.
              </p>
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

        <div className="p-5">
          <p className="text-sm leading-relaxed text-neutral-600">
            Are you sure you want to permanently delete your profile? All
            personal information, health data, and settings will be removed and{" "}
            <strong className="text-neutral-900">cannot be recovered</strong>.
          </p>
        </div>

        <div className="flex justify-end gap-2 px-5 pb-5">
          <button
            type="button"
            className="cursor-pointer btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
          >
            {isDeleting ? (
              <Loader2 size={13} className="animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 size={13} aria-hidden="true" />
            )}
            {isDeleting ? "Deleting…" : "Delete Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile picture uploader ─────────────────────────────────────────────────

function ProfilePictureUploader({ form, onFieldChange, error, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (file?.type.startsWith("image/"))
      onFieldChange("profilePictureFile", file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const clear = (e) => {
    e.stopPropagation();
    onFieldChange("profilePictureFile", null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const fileName = form?.profilePictureFile?.name;

  return (
    <Field
      label="Profile Picture"
      htmlFor="profilePictureFile"
      icon={ImageIcon}
      error={error}
      hint="JPG, PNG, WebP · max 5 MB"
    >
      <input
        ref={inputRef}
        id="profilePictureFile"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
        disabled={disabled}
        aria-label="Upload profile picture"
      />

      <div
        role={disabled ? undefined : "button"}
        tabIndex={disabled ? -1 : 0}
        aria-label="Click or drag to upload profile picture"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) =>
          !disabled &&
          (e.key === "Enter" || e.key === " ") &&
          inputRef.current?.click()
        }
        onDragOver={(e) => {
          if (!disabled) {
            e.preventDefault();
            setDragging(true);
          }
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          "flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3.5 transition-all duration-200",
          disabled
            ? "opacity-50 cursor-not-allowed bg-neutral-50"
            : "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          dragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : error
              ? "border-red-300 bg-red-50/30"
              : "border-neutral-200 bg-neutral-50/60 hover:border-primary/40 hover:bg-primary/3",
        ].join(" ")}
      >
        <div
          className="flex items-center justify-center flex-shrink-0 rounded-lg w-9 h-9"
          style={{
            background: "color-mix(in srgb, var(--color-primary) 10%, white)",
          }}
          aria-hidden="true"
        >
          <ImageIcon size={16} style={{ color: "var(--color-primary)" }} />
        </div>
        <div className="flex-1 min-w-0">
          {fileName ? (
            <>
              <p className="text-xs font-semibold truncate text-neutral-700">
                {fileName}
              </p>
              <p className="text-[11px] text-neutral-400">Click to change</p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-neutral-700">
                Drop image here or{" "}
                <span style={{ color: "var(--color-primary)" }}>browse</span>
              </p>
              <p className="text-[11px] text-neutral-400">
                JPG, PNG, WebP · max 5 MB
              </p>
            </>
          )}
        </div>
        {fileName && !disabled && (
          <button
            type="button"
            onClick={clear}
            aria-label="Remove selected file"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer flex-shrink-0"
          >
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>
    </Field>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PatientProfileForm({
  headerTitle,
  headerDescription,
  headerActions,
  form,
  errors,
  user,
  profileMeta,
  isPatientFormLocked,
  profilePicturePreviewUrl,
  isSaving,
  isDeleting,
  patientSubmitLabel,
  onSubmit,
  onFieldChange,
  onDeleteProfile,
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const locked = isPatientFormLocked;
  const healthLen = form?.basicHealthInfo?.length ?? 0;
  const healthNearLimit = healthLen > 1900;

  const handleDeleteConfirm = async () => {
    await onDeleteProfile();
    setShowDeleteDialog(false);
  };

  return (
    <>
      {showDeleteDialog && (
        <DeleteConfirmDialog
          onConfirm={handleDeleteConfirm}
          onClose={() => setShowDeleteDialog(false)}
          isDeleting={isDeleting}
        />
      )}

      <div className="card">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center min-w-0 gap-3">
            <div
              className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <User size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold leading-tight text-neutral-900">
                {headerTitle || "Patient Profile"}
              </h2>
              {headerDescription && (
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  {headerDescription}
                </p>
              )}
            </div>
          </div>
          {headerActions && (
            <div className="flex flex-wrap items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        aria-label="Patient profile form"
        aria-disabled={locked}
        className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-neutral-50 transition-opacity duration-200 ${locked ? "opacity-75" : ""}`}
      >
        {/* ── Profile header ────────────────────────────────────────── */}
        <div className="flex items-center gap-4 px-6 py-5">
          <AvatarPreview
            url={profilePicturePreviewUrl || form?.profilePictureUrl}
            name={form?.fullName}
          />

          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold leading-tight truncate text-neutral-900">
              {form?.fullName || (
                <span className="font-normal text-neutral-400">
                  No name set
                </span>
              )}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5 truncate">
              {user?.email || "Patient account"}
            </p>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {form?.bloodGroup && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                  <Droplets size={10} aria-hidden="true" />
                  {BLOOD_GROUP_LABELS[form.bloodGroup]}
                </span>
              )}
              {form?.gender && (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                  {GENDER_LABELS[form.gender]}
                </span>
              )}
            </div>
          </div>

          {locked && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg flex-shrink-0">
              <Info size={12} aria-hidden="true" />
              <span>Locked</span>
            </div>
          )}
        </div>

        {/* ── Personal information ──────────────────────────────────── */}
        <div className="px-6 py-5 space-y-4">
          <SectionHeader
            icon={User}
            label="Personal information"
            color="primary"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Full name"
              htmlFor="fullName"
              icon={User}
              error={errors?.fullName}
              required
            >
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                value={form?.fullName ?? ""}
                onChange={(e) => onFieldChange("fullName", e.target.value)}
                placeholder="Jane Doe"
                disabled={locked}
                className={inputCls(!!errors?.fullName)}
                aria-invalid={!!errors?.fullName}
              />
            </Field>

            <Field
              label="Date of birth"
              htmlFor="dob"
              icon={Calendar}
              error={errors?.dob}
              required
            >
              <input
                id="dob"
                type="date"
                value={form?.dob ?? ""}
                onChange={(e) => onFieldChange("dob", e.target.value)}
                disabled={locked}
                className={inputCls(!!errors?.dob)}
                max={new Date().toISOString().split("T")[0]}
                aria-invalid={!!errors?.dob}
              />
            </Field>

            <Field label="Blood group" htmlFor="bloodGroup" icon={Droplets}>
              <SelectField
                id="bloodGroup"
                value={form?.bloodGroup ?? ""}
                onChange={(e) =>
                  onFieldChange("bloodGroup", normalizeUpper(e.target.value))
                }
                options={BLOOD_GROUP_OPTIONS}
                labelMap={BLOOD_GROUP_LABELS}
                placeholder="Select blood group"
                disabled={locked}
              />
            </Field>

            <Field label="Gender" htmlFor="gender" icon={User}>
              <SelectField
                id="gender"
                value={form?.gender ?? ""}
                onChange={(e) =>
                  onFieldChange("gender", normalizeUpper(e.target.value))
                }
                options={GENDER_OPTIONS}
                labelMap={GENDER_LABELS}
                placeholder="Select gender"
                disabled={locked}
              />
            </Field>
          </div>
        </div>

        {/* ── Contact & appearance ──────────────────────────────────── */}
        <div className="px-6 py-5 space-y-4">
          <SectionHeader
            icon={MapPin}
            label="Contact & appearance"
            color="violet"
          />

          <Field
            label="Address"
            htmlFor="address"
            icon={MapPin}
            error={errors?.address}
            hint="Street, city, and postal code."
          >
            <textarea
              id="address"
              rows={3}
              value={form?.address ?? ""}
              onChange={(e) => onFieldChange("address", e.target.value)}
              placeholder="123 Main St, Colombo 01, Sri Lanka"
              autoComplete="street-address"
              disabled={locked}
              className={`${inputCls(!!errors?.address)} resize-none leading-relaxed`}
              aria-invalid={!!errors?.address}
            />
          </Field>

          <ProfilePictureUploader
            form={form}
            onFieldChange={onFieldChange}
            error={errors?.profilePictureFile}
            disabled={locked}
          />
        </div>

        {/* ── Health information ────────────────────────────────────── */}
        <div className="px-6 py-5 space-y-4">
          <SectionHeader icon={Heart} label="Health information" color="rose" />

          <Field
            label="Basic health info"
            htmlFor="basicHealthInfo"
            icon={Heart}
            error={errors?.basicHealthInfo}
            hint="Allergies, chronic conditions, current medications, or important notes for your care team."
          >
            <textarea
              id="basicHealthInfo"
              rows={4}
              value={form?.basicHealthInfo ?? ""}
              onChange={(e) => onFieldChange("basicHealthInfo", e.target.value)}
              placeholder="e.g. Allergic to penicillin, Type 2 diabetes, currently taking metformin…"
              disabled={locked}
              maxLength={HEALTH_INFO_MAX}
              className={`${inputCls(!!errors?.basicHealthInfo)} resize-y leading-relaxed`}
              aria-invalid={!!errors?.basicHealthInfo}
              aria-describedby="health-counter"
            />
            <div className="flex justify-end">
              <span
                id="health-counter"
                aria-live="polite"
                className={`text-[11px] tabular-nums transition-colors duration-200 ${
                  healthNearLimit
                    ? "text-amber-500 font-semibold"
                    : "text-neutral-400"
                }`}
              >
                {healthLen} / {HEALTH_INFO_MAX}
              </span>
            </div>
          </Field>
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="flex flex-col-reverse items-start justify-between gap-3 px-6 py-4 sm:flex-row sm:items-center bg-neutral-50/60 rounded-b-2xl">
          <p className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Info size={13} aria-hidden="true" />
            Email is managed by the authentication service.
          </p>

          <div className="flex items-center w-full gap-2 sm:w-auto">
            {/* Delete */}
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isSaving || isDeleting || locked || !profileMeta}
              aria-label="Delete profile"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 sm:w-auto w-full justify-center"
            >
              {isDeleting ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Trash2 size={14} aria-hidden="true" />
              )}
              {isDeleting ? "Deleting…" : "Delete"}
            </button>

            {/* Save */}
            <button
              type="submit"
              disabled={isSaving || isDeleting || locked}
              aria-busy={isSaving}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-auto w-full"
              style={{ background: "var(--color-primary)" }}
              onMouseEnter={(e) => {
                if (!isSaving && !isDeleting && !locked)
                  e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {isSaving ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Save size={14} aria-hidden="true" />
              )}
              {isSaving ? "Saving…" : (patientSubmitLabel ?? "Save Profile")}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
