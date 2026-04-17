/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useRef, useState } from "react";
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
  ShieldCheck,
  FileText,
  Sparkles,
} from "lucide-react";
import {
  normalizeUpper,
  validateProfilePictureFile,
} from "../../../utils/validation";

const PROFILE_IMAGE_BASE_URL = (
  import.meta.env.VITE_PROFILE_IMAGE_BASE_URL || "http://localhost:8083"
).replace(/\/$/, "");

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const inputCls = (hasError = false) =>
  [
    "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-800 shadow-sm",
    "placeholder:text-slate-400 outline-none",
    "transition-all duration-200",
    "hover:border-slate-300",
    "focus:border-primary focus:ring-4 focus:ring-primary/10",
    "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-70",
    hasError
      ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200",
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

function getInitials(name) {
  if (!name) return "P";

  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getCompletionStats(form) {
  const fields = [
    form?.fullName,
    form?.dob,
    form?.bloodGroup,
    form?.gender,
    form?.address,
    form?.basicHealthInfo,
    form?.profilePictureUrl || form?.profilePictureFile,
  ];

  const completed = fields.filter(Boolean).length;
  const total = fields.length;
  const percent = Math.round((completed / total) * 100);

  return { completed, total, percent };
}

// ─────────────────────────────────────────────────────────────────────────────
// Small UI pieces
// ─────────────────────────────────────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="overflow-hidden bg-white rounded-3xl border shadow-sm border-slate-200">
      <div className="p-6 space-y-6 animate-pulse">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-3">
            <div className="w-40 h-4 rounded bg-slate-200" />
            <div className="w-64 h-3 rounded bg-slate-100" />
            <div className="w-28 h-5 rounded-full bg-slate-100" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="w-24 h-3 rounded bg-slate-200" />
              <div className="h-12 rounded-2xl bg-slate-100" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="w-28 h-3 rounded bg-slate-200" />
          <div className="h-24 rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title = "No profile data available",
  description = "Start filling in the patient profile to keep records complete and accurate.",
}) {
  return (
    <div className="p-8 text-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/80">
      <div className="flex justify-center items-center mx-auto w-14 h-14 bg-white rounded-2xl shadow-sm">
        <FileText className="w-6 h-6 text-slate-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function InlineErrorState({ message }) {
  return (
    <div className="p-5 rounded-3xl border border-red-200 bg-red-50/70">
      <div className="flex gap-3 items-start">
        <div className="flex justify-center items-center w-10 h-10 text-red-500 bg-white rounded-2xl shadow-sm shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-red-700">Something went wrong</h3>
          <p className="mt-1 text-sm leading-6 text-red-600">{message}</p>
        </div>
      </div>
    </div>
  );
}

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
    <div className="space-y-2 group">
      <label
        htmlFor={htmlFor}
        className="flex gap-2 items-center text-sm font-semibold text-slate-700"
      >
        {Icon ? (
          <Icon
            size={14}
            className="transition-colors duration-200 shrink-0 text-slate-400 group-focus-within:text-primary"
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
        <p className="text-xs leading-5 text-slate-400">{hint}</p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-red-600"
        >
          <AlertCircle size={12} className="shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  id,
  value,
  onChange,
  onBlur,
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
        onBlur={onBlur}
        disabled={disabled}
        className={`${inputCls(hasError)} appearance-none pr-11 ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {labelMap?.[opt] ?? opt}
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

function AvatarPreview({ url, name, onPreview }) {
  const [failedUrl, setFailedUrl] = useState("");

  const initials = getInitials(name);
  const hasValidImage = Boolean(url) && failedUrl !== url;

  return (
    <div className="relative w-20 h-20 shrink-0">
      {hasValidImage ? (
        <button
          type="button"
          onClick={onPreview}
          className="cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
          aria-label="View profile image"
        >
          <img
            src={resolveProfileImageUrl(url)}
            alt={name || "Profile"}
            onError={() => setFailedUrl(url)}
            className="object-cover w-20 h-20 rounded-full border-4 border-white shadow-md transition-transform duration-200 hover:scale-[1.03]"
          />
        </button>
      ) : (
        <div
          className="flex justify-center items-center w-20 h-20 rounded-full border-4 border-white shadow-md bg-primary/10"
          aria-hidden="true"
        >
          <span
            className="text-xl font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            {initials}
          </span>
        </div>
      )}

      <span className="absolute right-1 bottom-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
    </div>
  );
}

const SECTION_COLORS = {
  primary: "bg-primary/10 text-primary",
  violet: "bg-violet-100 text-violet-600",
  rose: "bg-rose-100 text-rose-600",
  amber: "bg-amber-100 text-amber-600",
};

function SectionHeader({ icon: Icon, label, color = "primary", description }) {
  return (
    <div className="flex gap-3 items-start pb-4 border-b border-slate-100">
      <span
        className={`flex justify-center items-center w-10 h-10 rounded-2xl shrink-0 ${SECTION_COLORS[color]}`}
        aria-hidden="true"
      >
        <Icon size={18} />
      </span>

      <div>
        <h3 className="text-base font-semibold text-slate-800">{label}</h3>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete dialog
// ─────────────────────────────────────────────────────────────────────────────

function DeleteConfirmDialog({ onConfirm, onClose, isDeleting }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/45"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white rounded-3xl border shadow-2xl transition-all duration-200 border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-start p-5 border-b border-slate-100">
          <div className="flex gap-3 items-start">
            <div className="flex justify-center items-center w-11 h-11 text-red-500 bg-red-50 rounded-2xl">
              <Trash2 size={18} />
            </div>
            <div>
              <h3
                id="delete-dialog-title"
                className="text-base font-semibold text-slate-900"
              >
                Delete Profile
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer p-2 rounded-xl transition text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm leading-7 text-slate-600">
            You are about to permanently delete this patient profile. Personal
            information, health details, and profile settings will be removed.
            That data will not come back.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 px-5 pb-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="inline-flex cursor-pointer justify-center items-center px-4 h-11 text-sm font-semibold bg-white rounded-2xl border transition border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex cursor-pointer gap-2 justify-center items-center px-4 h-11 text-sm font-semibold text-white bg-red-500 rounded-2xl transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? (
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 size={15} aria-hidden="true" />
            )}
            {isDeleting ? "Deleting..." : "Delete Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile picture uploader
// ─────────────────────────────────────────────────────────────────────────────

function ProfilePictureUploader({
  form,
  onFieldChange,
  onFieldBlur,
  error,
  disabled,
}) {
  const inputRef = useRef(null);
  const objectUrlRef = useRef("");
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  const hasExisting = Boolean(String(form?.profilePictureUrl || "").trim());
  const hasSelectedFile = form?.profilePictureFile instanceof File;
  const displayUrl = hasSelectedFile
    ? previewUrl
    : hasExisting
      ? form.profilePictureUrl
      : "";
  const hasImage = Boolean(displayUrl);

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
    }
  }, [form?.profilePictureFile]);

  const handleFile = (file) => {
    if (!file) return;

    const fileError = validateProfilePictureFile(file, {
      requiredValue: true,
      maxSizeMB: 5,
    });
    if (fileError) {
      if (inputRef.current) inputRef.current.value = "";
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
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const clear = (event) => {
    event.stopPropagation();
    onFieldChange("profilePictureFile", null);
    onFieldBlur?.("profilePictureFile", null);
    if (inputRef.current) inputRef.current.value = "";
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }
    setPreviewUrl("");
  };

  const fileName = form?.profilePictureFile?.name || "Current profile image";

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
      icon={ImageIcon}
      error={error}
      hint="JPG, JPEG, or PNG · maximum 5 MB."
    >
      <input
        ref={inputRef}
        id="profilePictureFile"
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="sr-only"
        onChange={(event) => handleFile(event.target.files?.[0])}
        onBlur={() => onFieldBlur?.("profilePictureFile")}
        disabled={disabled}
        aria-label="Upload profile picture"
      />

      <div
        role={disabled ? undefined : "button"}
        tabIndex={disabled ? -1 : 0}
        aria-label="Click or drag to upload profile picture"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          if (disabled) return;
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          "flex items-center gap-4 rounded-2xl border-2 border-dashed px-4 py-4 transition-all duration-200",
          disabled
            ? "cursor-not-allowed bg-slate-50 opacity-60"
            : "cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10",
          dragging
            ? "scale-[1.01] border-primary bg-primary/5"
            : error
              ? "border-red-300 bg-red-50/30"
              : "border-slate-200 bg-slate-50/70 hover:border-primary/40 hover:bg-primary/5",
        ].join(" ")}
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

              {hasSelectedFile && !disabled ? (
                <button
                  type="button"
                  onClick={clear}
                  aria-label="Remove selected file"
                  className="cursor-pointer absolute -top-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                >
                  <X size={11} aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-800">
                {fileName}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Click the image to enlarge it. Click elsewhere to replace it.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div
              className="flex justify-center items-center w-11 h-11 rounded-2xl shrink-0"
              style={{
                background: "color-mix(in srgb, var(--color-primary) 10%, white)",
              }}
            >
              <ImageIcon size={18} style={{ color: "var(--color-primary)" }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                Drop image here or{" "}
                <span style={{ color: "var(--color-primary)" }}>browse</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                JPG, JPEG, or PNG · maximum 5 MB
              </p>
            </div>
          </>
        )}
      </div>
    </Field>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

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
  onFieldBlur,
  isFormValid = true,
  onDeleteProfile,
  isLoading = false,
  loadError = "",
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  const locked = isPatientFormLocked;
  const healthLen = form?.basicHealthInfo?.length ?? 0;
  const healthNearLimit = healthLen > 1900;
  const displayProfileImageUrl =
    profilePicturePreviewUrl || form?.profilePictureUrl || "";

  const completionStats = useMemo(() => getCompletionStats(form), [form]);

  const hasAnyData = useMemo(() => {
    return Boolean(
      form?.fullName ||
        form?.dob ||
        form?.bloodGroup ||
        form?.gender ||
        form?.address ||
        form?.basicHealthInfo ||
        form?.profilePictureUrl ||
        form?.profilePictureFile
    );
  }, [form]);

  const handleDeleteConfirm = async () => {
    await onDeleteProfile();
    setShowDeleteDialog(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (locked || isSaving || isDeleting || !isFormValid) return;
    await onSubmit(event);
  };

  if (isLoading) {
    return <FormSkeleton />;
  }

  if (loadError) {
    return <InlineErrorState message={loadError} />;
  }

  if (!hasAnyData && !profileMeta && !user) {
    return <EmptyState />;
  }

  return (
    <>
      {showDeleteDialog ? (
        <DeleteConfirmDialog
          onConfirm={handleDeleteConfirm}
          onClose={() => setShowDeleteDialog(false)}
          isDeleting={isDeleting}
        />
      ) : null}

      {isImagePreviewOpen ? (
        <ImagePreviewDialog
          imageUrl={displayProfileImageUrl}
          alt={form?.fullName || "Profile"}
          onClose={() => setIsImagePreviewOpen(false)}
        />
      ) : null}

      <div className="space-y-6">
        

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Patient profile form"
          aria-disabled={locked}
          className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-opacity duration-200 ${
            locked ? "opacity-80" : ""}`}
        >
          {/* Profile header */}
          <div className="flex flex-col gap-4 justify-between px-5 py-6 to-white border-b bg-linear-to-r border-slate-100 from-slate-50 lg:flex-row lg:items-center sm:px-6">
  <div className="flex flex-col gap-5 min-w-0 sm:flex-row sm:items-center">
    <AvatarPreview
      url={displayProfileImageUrl}
      name={form?.fullName}
      onPreview={
        displayProfileImageUrl ? () => setIsImagePreviewOpen(true) : undefined
      }
    />

    <div className="flex-1 min-w-0">
      <p className="text-lg font-semibold truncate text-slate-900 sm:text-xl">
        {form?.fullName || (
          <span className="font-normal text-slate-400">No name set</span>
        )}
      </p>

      <p className="mt-1 text-sm truncate text-slate-500">
        {user?.email || "Patient account"}
      </p>

      <div className="flex flex-wrap gap-2 mt-3">
        {form?.bloodGroup ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
            <Droplets size={12} aria-hidden="true" />
            {BLOOD_GROUP_LABELS[form.bloodGroup]}
          </span>
        ) : null}

        {form?.gender ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {GENDER_LABELS[form.gender]}
          </span>
        ) : null}

        {profileMeta ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Profile Available
          </span>
        ) : null}
      </div>
    </div>
  </div>

  <div className="flex flex-col gap-3 items-start lg:items-end">
    <div className="flex flex-wrap gap-3 items-center lg:justify-end">
      <div className="px-4 py-3 rounded-2xl border shadow-sm border-slate-200 bg-white/90">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Completion
        </p>
        <div className="flex gap-3 items-center mt-2">
          <div className="overflow-hidden w-28 h-2 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${completionStats.percent}%`,
                background: "var(--color-primary)",
              }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-800">
            {completionStats.percent}%
          </span>
        </div>
      </div>

      {locked ? (
        <div className="inline-flex gap-2 items-center px-4 py-3 text-sm font-semibold text-amber-700 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm">
          <Info size={16} />
          Form Locked
        </div>
      ) : (
        <div className="inline-flex gap-2 items-center px-4 py-3 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-sm">
          <ShieldCheck size={16} />
          Editable
        </div>
      )}
    </div>

    <div className="flex flex-wrap gap-3 justify-start items-center lg:justify-end">
      {headerActions ? (
        <div className="flex flex-wrap gap-2 items-center">
          {headerActions}
        </div>
      ) : null}
    </div>
  </div>
</div>

          <div className="divide-y divide-slate-100">
            {/* Personal information */}
            <section className="px-5 py-6 space-y-5 sm:px-6">
              <SectionHeader
                icon={User}
                label="Personal Information"
                color="primary"
                description="Maintain accurate personal details for appointments, identification, and patient records."
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                    onChange={(event) => onFieldChange("fullName", event.target.value)}
                    onBlur={() => onFieldBlur?.("fullName")}
                    placeholder="Jane Doe"
                    disabled={locked}
                    className={inputCls(Boolean(errors?.fullName))}
                    aria-invalid={Boolean(errors?.fullName)}
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
                    onChange={(event) => onFieldChange("dob", event.target.value)}
                    onBlur={() => onFieldBlur?.("dob")}
                    disabled={locked}
                    className={inputCls(Boolean(errors?.dob))}
                    max={new Date().toISOString().split("T")[0]}
                    aria-invalid={Boolean(errors?.dob)}
                  />
                </Field>

                <Field
                  label="Blood group"
                  htmlFor="bloodGroup"
                  icon={Droplets}
                  error={errors?.bloodGroup}
                >
                  <SelectField
                    id="bloodGroup"
                    value={form?.bloodGroup ?? ""}
                    onChange={(event) =>
                      onFieldChange("bloodGroup", normalizeUpper(event.target.value))
                    }
                    onBlur={() => onFieldBlur?.("bloodGroup")}
                    options={BLOOD_GROUP_OPTIONS}
                    labelMap={BLOOD_GROUP_LABELS}
                    placeholder="Select blood group"
                    disabled={locked}
                    hasError={Boolean(errors?.bloodGroup)}
                  />
                </Field>

                <Field
                  label="Gender"
                  htmlFor="gender"
                  icon={User}
                  error={errors?.gender}
                >
                  <SelectField
                    id="gender"
                    value={form?.gender ?? ""}
                    onChange={(event) =>
                      onFieldChange("gender", normalizeUpper(event.target.value))
                    }
                    onBlur={() => onFieldBlur?.("gender")}
                    options={GENDER_OPTIONS}
                    labelMap={GENDER_LABELS}
                    placeholder="Select gender"
                    disabled={locked}
                    hasError={Boolean(errors?.gender)}
                  />
                </Field>
              </div>
            </section>

            {/* Contact and appearance */}
            <section className="px-5 py-6 space-y-5 sm:px-6">
              <SectionHeader
                icon={MapPin}
                label="Contact & Appearance"
                color="violet"
                description="Keep address and profile image up to date so the account stays complete and recognizable."
              />

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr,1fr]">
                <Field
                  label="Address"
                  htmlFor="address"
                  icon={MapPin}
                  error={errors?.address}
                  hint="Street, city, and postal code."
                >
                  <textarea
                    id="address"
                    rows={5}
                    value={form?.address ?? ""}
                    onChange={(event) => onFieldChange("address", event.target.value)}
                    onBlur={() => onFieldBlur?.("address")}
                    placeholder="123 Main St, Colombo 01, Sri Lanka"
                    autoComplete="street-address"
                    disabled={locked}
                    className={`${inputCls(Boolean(errors?.address))} resize-none leading-7`}
                    aria-invalid={Boolean(errors?.address)}
                  />
                </Field>

                <ProfilePictureUploader
                  form={form}
                  onFieldChange={onFieldChange}
                  onFieldBlur={onFieldBlur}
                  error={errors?.profilePictureFile}
                  disabled={locked}
                />
              </div>
            </section>

            {/* Health information */}
            <section className="px-5 py-6 space-y-5 sm:px-6">
              <SectionHeader
                icon={Heart}
                label="Health Information"
                color="rose"
                description="Record only essential patient health notes that help the care team respond correctly."
              />

              <Field
                label="Basic health info"
                htmlFor="basicHealthInfo"
                icon={Heart}
                error={errors?.basicHealthInfo}
                hint="Allergies, chronic conditions, current medications, and other key medical notes."
              >
                <textarea
                  id="basicHealthInfo"
                  rows={6}
                  value={form?.basicHealthInfo ?? ""}
                  onChange={(event) =>
                    onFieldChange("basicHealthInfo", event.target.value)
                  }
                  onBlur={() => onFieldBlur?.("basicHealthInfo")}
                  placeholder="e.g. Allergic to penicillin, Type 2 diabetes, currently taking metformin..."
                  disabled={locked}
                  maxLength={HEALTH_INFO_MAX}
                  className={`${inputCls(Boolean(errors?.basicHealthInfo))} resize-y leading-7`}
                  aria-invalid={Boolean(errors?.basicHealthInfo)}
                  aria-describedby="health-counter"
                />

                <div className="flex gap-3 justify-between items-center mt-2">
                  <p className="text-xs text-slate-400">
                    Keep this concise and medically relevant.
                  </p>

                  <span
                    id="health-counter"
                    aria-live="polite"
                    className={`text-xs tabular-nums transition-colors duration-200 ${
                      healthNearLimit
                        ? "font-semibold text-amber-600"
                        : "text-slate-400"
                    }`}
                  >
                    {healthLen} / {HEALTH_INFO_MAX}
                  </span>
                </div>
              </Field>
            </section>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-4 px-5 py-4 border-t border-slate-100 bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="flex gap-2 items-center text-xs leading-5 text-slate-500">
              <Info size={14} aria-hidden="true" />
              Email is managed by the authentication service and cannot be edited here.
            </p>

            <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isSaving || isDeleting || locked || !profileMeta}
                aria-label="Delete profile"
                className="inline-flex cursor-pointer gap-2 justify-center items-center px-4 w-full h-11 text-sm font-semibold text-red-600 bg-white rounded-2xl border border-red-200 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isDeleting ? (
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 size={15} aria-hidden="true" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>

              <button
                type="submit"
                disabled={isSaving || isDeleting || locked || !isFormValid}
                aria-busy={isSaving}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 sm:w-auto"
                style={{
                  background: "var(--color-primary)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                }}
              >
                {isSaving ? (
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Save size={15} aria-hidden="true" />
                )}
                {isSaving ? "Saving..." : patientSubmitLabel ?? "Save Profile"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
