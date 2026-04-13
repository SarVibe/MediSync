import { useState, useEffect } from "react";
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
  CheckCircle2,
  AlertCircle,
  Loader2,
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

// Import new modular components
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

export default function AdminUserManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "patients";
  
  const [createForm, setCreateForm] = useState(DEFAULT_CREATE_USER);
  const [createErrors, setCreateErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateCreateUser()) return;
    try {
      setIsCreating(true);
      setServerError("");
      const res = await createUserByAdmin({
        ...createForm,
        role: normalizeUpper(createForm.role),
      });
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

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const TABS = [
    { id: "patients", label: "Patients", icon: Users },
    { id: "doctors", label: "Approved Doctors", icon: Stethoscope },
    { id: "pending", label: "Pending Requests", icon: Clock },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-br from-white to-neutral-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/5">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Admin User Management</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Comprehensive control over platform users and medical credentials.</p>
          </div>
        </div>
      </div>

      {/* Create User Section (Collapsible or just as is) */}
      <section className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-emerald-500" />
            <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Quick Create User</h2>
          </div>
        </div>
        <div className="p-6">
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" onSubmit={handleCreateUser}>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  className={`input pl-10 ${createErrors.name ? "input-error" : ""}`}
                  placeholder="John Doe"
                  value={createForm.name}
                  onChange={(e) => setCreateField("name", e.target.value)}
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              </div>
              {createErrors.name && <p className="text-[10px] text-red-500 font-medium ml-1">{createErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  className={`input pl-10 ${createErrors.email ? "input-error" : ""}`}
                  placeholder="john@example.com"
                  value={createForm.email}
                  onChange={(e) => setCreateField("email", e.target.value)}
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              </div>
              {createErrors.email && <p className="text-[10px] text-red-500 font-medium ml-1">{createErrors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Phone</label>
              <div className="relative">
                <input
                  type="tel"
                  className={`input pl-10 ${createErrors.phone ? "input-error" : ""}`}
                  placeholder="+94770000000"
                  value={createForm.phone}
                  onChange={(e) => setCreateField("phone", e.target.value)}
                />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              </div>
              {createErrors.phone && <p className="text-[10px] text-red-500 font-medium ml-1">{createErrors.phone}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Initial Role</label>
              <select
                className={`input ${createErrors.role ? "input-error" : ""}`}
                value={createForm.role}
                onChange={(e) => setCreateField("role", e.target.value)}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Temporary Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input pl-10 pr-10 ${createErrors.temporaryPassword ? "input-error" : ""}`}
                  placeholder="••••••••"
                  value={createForm.temporaryPassword}
                  onChange={(e) => setCreateField("temporaryPassword", e.target.value)}
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Shield size={16} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {createErrors.temporaryPassword && <p className="text-[10px] text-red-500 font-medium ml-1">{createErrors.temporaryPassword}</p>}
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isCreating}
                className="btn btn-primary w-full h-[42px] flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus size={18} />}
                {isCreating ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Tabs / Content Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-neutral-100/50 rounded-2xl w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-white/50"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-[400px]">
          {activeTab === "patients" && <PatientsManagement />}
          {activeTab === "doctors" && <DoctorsManagement />}
          {activeTab === "pending" && <PendingDoctorRequests />}
        </div>
      </div>
    </div>
  );
}
