/* eslint-disable no-unused-vars */
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  UserPlus,
  Users,
  Stethoscope,
  Clock,
  Shield,
  Mail,
  Phone,
  Eye,
  EyeOff,
  User,
  Loader2,
  AlertCircle,
  Inbox,
  ChevronRight,
} from "lucide-react";

import { createUserByAdmin } from "../../auth/services/authService";
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
  validateRole,
  normalizeUpper,
} from "../../../utils/validation";
import { getApiErrorMessage } from "../../../utils/api";
import { notifyApiSuccess, notifyError } from "../../../utils/toast";

import PatientsManagement from "../components/admin/PatientsManagement";
import DoctorsManagement from "../components/admin/DoctorsManagement";
import PendingDoctorRequests from "../components/admin/PendingDoctorRequests";

const ROLE_OPTIONS = ["PATIENT", "DOCTOR", "ADMIN"];

const DEFAULT_CREATE_USER = {
  email: "",
  phone: "",
  name: "",
  role: "PATIENT",
  temporaryPassword: "",
};

function SectionCard({ title, subtitle, icon: Icon, children, action }) {
  return (
    <section className="overflow-hidden bg-white rounded-3xl border shadow-sm transition-all duration-300 border-slate-200 hover:shadow-md">
      <div className="flex flex-col gap-4 px-5 py-4 via-white border-b bg-linear-to-r border-slate-100 from-slate-50 to-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex gap-3 items-start">
          <div className="flex justify-center items-center w-11 h-11 rounded-2xl shadow-sm shrink-0 bg-primary/10 text-primary">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
            ) : null}
          </div>
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function FieldError({ message }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
    >
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </p>
  );
}

function InputShell({ label, htmlFor, icon: Icon, error, children }) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
      >
        {label}
      </label>

      <div
        className={[
          "group relative overflow-hidden rounded-2xl border bg-white transition-all duration-200",
          error
            ? "border-red-300 ring-1 ring-red-100"
            : "border-slate-200 hover:border-slate-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10",
        ].join(" ")}
      >
        <div className="flex absolute inset-y-0 left-0 items-center pl-4 transition-colors duration-200 pointer-events-none text-slate-400 group-focus-within:text-primary">
          <Icon className="w-4 h-4" />
        </div>
        {children}
      </div>

      <FieldError message={error} />
    </div>
  );
}

function TabButton({ icon: Icon, label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group inline-flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold outline-none transition-all duration-200",
        "focus-visible:ring-4 focus-visible:ring-primary/15",
        isActive
          ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
          : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
      ].join(" ")}
      aria-pressed={isActive}
    >
      <Icon
        className={[
          "h-4 w-4 transition-transform duration-200",
          isActive ? "scale-100" : "group-hover:scale-110",
        ].join(" ")}
      />
      <span>{label}</span>
    </button>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200">
        <div className="w-48 h-6 rounded-lg bg-slate-200" />
        <div className="mt-3 w-80 max-w-full h-4 rounded-lg bg-slate-100" />
      </div>

      <div className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="w-24 h-4 rounded bg-slate-200" />
              <div className="h-12 rounded-2xl bg-slate-100" />
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200">
        <div className="h-72 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

function EmptyState({
  title = "No content available",
  description = "There is nothing to display right now.",
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center">
      <div className="flex justify-center items-center w-14 h-14 bg-white rounded-2xl shadow-sm text-slate-500">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function InlineErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/60 px-6 py-10 text-center">
      <div className="flex justify-center items-center w-14 h-14 text-red-500 bg-white rounded-2xl shadow-sm">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        Something went wrong
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
      >
        Try again
      </button>
    </div>
  );
}

export default function AdminUserManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "patients";

  const [createForm, setCreateForm] = useState(DEFAULT_CREATE_USER);
  const [createErrors, setCreateErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [serverError, setServerError] = useState("");
  const [pageError, setPageError] = useState("");

  const tabs = useMemo(
    () => [
      { id: "patients", label: "Patients", icon: Users },
      { id: "doctors", label: "Approved Doctors", icon: Stethoscope },
      { id: "pending", label: "Pending Requests", icon: Clock },
    ],
    []
  );

  const activeTab = tabs.some((tab) => tab.id === currentTab)
    ? currentTab
    : "patients";

  const validateCreateUser = () => {
    const errors = {
      email: validateEmail(createForm.email),
      phone: validatePhone(createForm.phone),
      name: validateName(createForm.name, "Name", 2, 120),
      role: validateRole(createForm.role),
      temporaryPassword: validatePassword(createForm.temporaryPassword, {
        minLength: 8,
      }),
    };

    setCreateErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const setCreateField = (field, value) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
    setCreateErrors((prev) => ({ ...prev, [field]: "" }));
    setServerError("");
  };

  const resetCreateForm = () => {
    setCreateForm(DEFAULT_CREATE_USER);
    setCreateErrors({});
    setShowPassword(false);
    setServerError("");
  };

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    if (!validateCreateUser()) {
      notifyError("Please fix the highlighted fields and try again.");
      return;
    }

    try {
      setIsCreating(true);
      setServerError("");

      const response = await createUserByAdmin({
        ...createForm,
        role: normalizeUpper(createForm.role),
      });

      notifyApiSuccess(response, "User created successfully.");
      resetCreateForm();
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to create user.");
      setServerError(message);
      notifyError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const renderActiveContent = () => {
    try {
      switch (activeTab) {
        case "patients":
          return <PatientsManagement />;
        case "doctors":
          return <DoctorsManagement />;
        case "pending":
          return <PendingDoctorRequests />;
        default:
          return (
            <EmptyState
              title="Unknown section"
              description="The selected tab could not be loaded."
            />
          );
      }
    } catch (error) {
      return (
        <InlineErrorState
          message="The selected management section failed to render."
          onRetry={() => setActiveTab("patients")}
        />
      );
    }
  };

  if (pageError) {
    return (
      <div className="pb-20 mx-auto max-w-7xl">
        <InlineErrorState
          message={pageError}
          onRetry={() => setPageError("")}
        />
      </div>
    );
  }

  const isPageLoading = false;

  if (isPageLoading) {
    return (
      <div className="pb-20 mx-auto max-w-7xl">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="pb-20 mx-auto space-y-6 max-w-7xl">
      <section className="overflow-hidden relative bg-white rounded-3xl border shadow-sm border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.08),transparent_24%)]" />
        <div className="flex relative flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4 items-start">
            <div className="flex justify-center items-center w-14 h-14 rounded-2xl shadow-sm shrink-0 bg-primary/10 text-primary">
              <Shield className="w-6 h-6" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                Admin Console
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                User Management
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Manage patients, doctors, and pending doctor approvals from one
                clean dashboard with strong validation and accessible controls.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/70">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Sections
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">{tabs.length}</p>
            </div>
            <div className="px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/70">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Active View
              </p>
              <p className="mt-1 text-lg font-bold capitalize text-slate-900">
                {activeTab}
              </p>
            </div>
            <div className="px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/70">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Status
              </p>
              <p className="mt-1 text-lg font-bold text-emerald-600">Ready</p>
            </div>
          </div>
        </div>
      </section>

      <SectionCard
        title="Quick Create User"
    subtitle="Create a patient, doctor, or admin account with immediate validation and clear feedback."
        icon={UserPlus}
        action={
          <button
            type="button"
            onClick={resetCreateForm}
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
          >
            Reset
          </button>
        }
      >
        <form
          onSubmit={handleCreateUser}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
          noValidate
        >
          <InputShell
            label="Full Name"
            htmlFor="name"
            icon={User}
            error={createErrors.name}
          >
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              value={createForm.name}
              onChange={(e) => setCreateField("name", e.target.value)}
              className="pr-4 pl-11 w-full h-12 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
              aria-invalid={Boolean(createErrors.name)}
              aria-describedby={createErrors.name ? "name-error" : undefined}
            />
          </InputShell>

          <InputShell
            label="Email"
            htmlFor="email"
            icon={Mail}
            error={createErrors.email}
          >
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="john@example.com"
              value={createForm.email}
              onChange={(e) => setCreateField("email", e.target.value)}
              className="pr-4 pl-11 w-full h-12 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
              aria-invalid={Boolean(createErrors.email)}
              aria-describedby={createErrors.email ? "email-error" : undefined}
            />
          </InputShell>

          <InputShell
            label="Phone"
            htmlFor="phone"
            icon={Phone}
            error={createErrors.phone}
          >
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+94770000000"
              value={createForm.phone}
              onChange={(e) => setCreateField("phone", e.target.value)}
              className="pr-4 pl-11 w-full h-12 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
              aria-invalid={Boolean(createErrors.phone)}
              aria-describedby={createErrors.phone ? "phone-error" : undefined}
            />
          </InputShell>

          <div className="space-y-2">
            <label
              htmlFor="role"
              className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
            >
              Initial Role
            </label>

            <div className="overflow-hidden relative bg-white rounded-2xl border transition-all duration-200 border-slate-200 hover:border-slate-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
              <select
                id="role"
                name="role"
                value={createForm.role}
                onChange={(e) => setCreateField("role", e.target.value)}
                className="px-4 pr-12 w-full h-12 text-sm font-medium bg-transparent appearance-none cursor-pointer text-slate-900 focus:outline-none"
                aria-invalid={Boolean(createErrors.role)}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <ChevronRight className="absolute right-4 top-1/2 w-4 h-4 rotate-90 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>

            <FieldError message={createErrors.role} />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="temporaryPassword"
              className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
            >
              Temporary Password
            </label>

            <div
              className={[
                "group relative overflow-hidden rounded-2xl border bg-white transition-all duration-200",
                createErrors.temporaryPassword
                  ? "border-red-300 ring-1 ring-red-100"
                  : "border-slate-200 hover:border-slate-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10",
              ].join(" ")}
            >
              <div className="flex absolute inset-y-0 left-0 items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-primary">
                <Shield className="w-4 h-4" />
              </div>

              <input
                id="temporaryPassword"
                name="temporaryPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter a secure temporary password"
                value={createForm.temporaryPassword}
                onChange={(e) =>
                  setCreateField("temporaryPassword", e.target.value)
                }
                className="pr-12 pl-11 w-full h-12 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                aria-invalid={Boolean(createErrors.temporaryPassword)}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="inline-flex absolute right-3 top-1/2 justify-center items-center w-8 h-8 rounded-xl transition -translate-y-1/2 cursor-pointer text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <FieldError message={createErrors.temporaryPassword} />
          </div>

          <div className="flex flex-col gap-3 justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating user...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create User
                </>
              )}
            </button>

            <p className="text-xs leading-5 text-slate-500">
              Success and failure feedback are shown through your global toaster.
            </p>
          </div>
        </form>

        {serverError ? (
          <div className="px-4 py-3 mt-5 text-sm text-red-700 bg-red-50 rounded-2xl border border-red-200">
            <div className="flex gap-2 items-start">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="User Directories"
        subtitle="Switch between user segments and manage records using responsive, keyboard-friendly navigation."
        icon={Users}
      >
        <div className="space-y-5">
          <div className="inline-flex flex-wrap gap-2 p-2 w-full rounded-3xl border border-slate-200 bg-slate-50">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          <div className="min-h-[420px] rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
            {renderActiveContent() || (
              <EmptyState
                title="Nothing to show"
                description="No management content is available for this section yet."
              />
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}