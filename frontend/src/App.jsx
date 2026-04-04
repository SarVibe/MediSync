import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ── Auth pages ────────────────────────────────────────────────────────────
import LoginPage from "./features/auth/pages/Login";
// import SignupPage from "./features/auth/pages/Signup";
import ForgotPasswordPage from "./features/auth/pages/ForgotPassword";
import OtpVerificationPage from "./features/auth/pages/OtpVerification";
import Admin2FAPage from "./features/auth/pages/Admin2FA";
import ChangePasswordPage from "./features/auth/pages/ChangePassword";
import TermsPage from "./features/auth/pages/TermsOfCondition";
import PrivacyPage from "./features/auth/pages/PrivacyPolicy";
import { AuthProvider } from "./features/auth/context/AuthContext";
import AuthGuard from "./features/auth/components/AuthGuard";

// ── Appointment context ───────────────────────────────────────────────────
import { AppointmentProvider } from "./features/appointment/AppointmentContext";
import { MedicalProvider } from "./features/records/MedicalContext";

// ── Patient pages ─────────────────────────────────────────────────────────
import DoctorSearchPage from "./features/appointment/pages/DoctorSearchPage";
import BookAppointmentPage from "./features/appointment/pages/BookAppointmentPage";
import PatientAppointmentsPage from "./features/appointment/pages/PatientAppointmentsPage";
import PatientRecordsPage from "./features/records/pages/PatientRecordsPage";
import PatientPrescriptionsPage from "./features/records/pages/PatientPrescriptionsPage";
import UploadRecordPage from "./features/records/pages/UploadRecordPage";

// ── Doctor pages ──────────────────────────────────────────────────────────
import AvailabilityPage from "./features/appointment/pages/AvailabilityPage";
import DoctorAppointmentsPage from "./features/appointment/pages/DoctorAppointmentsPage";
import DailySchedulePage from "./features/appointment/pages/DailySchedulePage";
import DoctorPatientRecordsPage from "./features/records/pages/DoctorPatientRecordsPage";
import DoctorPrescriptionsPage from "./features/records/pages/DoctorPrescriptionsPage";
import CreatePrescriptionPage from "./features/records/pages/CreatePrescriptionPage";

// ── Admin pages ───────────────────────────────────────────────────────────
import AdminAppointmentsPage from "./features/appointment/pages/AdminAppointmentsPage";
import AdminRecordsPage from "./features/records/pages/AdminRecordsPage";
import AdminPrescriptionsPage from "./features/records/pages/AdminPrescriptionsPage";
import AdminPaymentsPage from "./features/payment/pages/AdminPaymentsPage";
import AdminUserManagementPage from "./features/profile/pages/AdminUserManagement";

// ── Profile pages ─────────────────────────────────────────────────────────
import ProfilePage from "./features/profile/pages/Profile";
import DoctorProfilePage from "./features/profile/pages/DoctorProfile";
import PatientProfilePage from "./features/profile/pages/PatientProfile";
import RequestPendingProfilePage from "./features/profile/pages/RequestPendingProfile";
import UpgradeRequestProfilePage from "./features/profile/pages/UpgradeRequestProfile";
import AISymptomCheckerPage from "./features/symptom/pages/AISymptomCheckerPage";
import UnauthorizedPage from "./features/auth/pages/Unauthorized";

// ── Telemedicine pages ────────────────────────────────────────────────────
import VideoSessionPage from "./features/telemedicine/pages/VideoSessionPage";

// ── Payment pages ──────────────────────────────────────────────────────────
import PaymentCheckoutPage from "./features/payment/pages/PaymentCheckoutPage";
import PaymentStatusPage from "./features/payment/pages/PaymentStatusPage";

// ── Layouts ───────────────────────────────────────────────────────────────
import DashboardLayout from "./components/layout/DashboardLayout";
import MainLayout from "./components/layout/MainLayout";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "0.75rem",
              border: "1px solid var(--neutral-200)",
              background: "#ffffff",
              color: "var(--neutral-900)",
            },
          }}
        />
        <AppointmentProvider>
          <MedicalProvider>
            <Routes>
              {/* Default redirect */}
              <Route
                path="/"
                element={
                  <AuthGuard allowedRoles={["PATIENT", "DOCTOR", "ADMIN"]}>
                    <div />
                  </AuthGuard>
                }
              />

              {/* ── Auth routes (No Layout) ── */}
              <Route path="/auth/login" element={<LoginPage />} />
              {/* <Route path="/auth/signup" element={<SignupPage />} /> */}
              <Route path="/auth/otp" element={<OtpVerificationPage />} />
              <Route path="/auth/admin-2fa" element={<Admin2FAPage />} />
              <Route
                path="/auth/forgot-password"
                element={<ForgotPasswordPage />}
              />
              <Route
                path="/auth/change-password"
                element={<ChangePasswordPage />}
              />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

              {/* ── Cross-role gate routes ── */}
              <Route
                path="/profile"
                element={
                  <AuthGuard allowedRoles={["PATIENT", "DOCTOR"]}>
                    <MainLayout />
                  </AuthGuard>
                }
              >
                <Route index element={<ProfilePage />} />
              </Route>
              <Route
                path="/request-pending"
                element={
                  <AuthGuard allowedRoles={["PATIENT"]}>
                    <MainLayout />
                  </AuthGuard>
                }
              >
                <Route index element={<RequestPendingProfilePage />} />
              </Route>
              <Route
                path="/upgrade-request"
                element={
                  <AuthGuard allowedRoles={["PATIENT"]}>
                    <MainLayout />
                  </AuthGuard>
                }
              >
                <Route index element={<UpgradeRequestProfilePage />} />
              </Route>
              <Route
                path="/unauthorized"
                element={
                  <AuthGuard allowedRoles={["PATIENT", "DOCTOR"]}>
                    <MainLayout />
                  </AuthGuard>
                }
              >
                <Route index element={<UnauthorizedPage />} />
              </Route>

              {/* ── Patient routes (MainLayout) ── */}
              <Route
                path="/patient"
                element={
                  <AuthGuard allowedRoles={["PATIENT"]}>
                    <MainLayout />
                  </AuthGuard>
                }
              >
                <Route index element={<Navigate to="doctors" replace />} />
                <Route path="doctors" element={<DoctorSearchPage />} />
                <Route
                  path="book/:doctorId"
                  element={<BookAppointmentPage />}
                />
                <Route
                  path="appointments"
                  element={<PatientAppointmentsPage />}
                />
                <Route path="records" element={<PatientRecordsPage />} />
                <Route
                  path="prescriptions"
                  element={<PatientPrescriptionsPage />}
                />
                <Route path="upload-record" element={<UploadRecordPage />} />
                <Route path="profile" element={<PatientProfilePage />} />
                <Route path="ai-checker" element={<AISymptomCheckerPage />} />
                <Route
                  path="payment/:appointmentId"
                  element={<PaymentCheckoutPage />}
                />
                <Route path="payment-status" element={<PaymentStatusPage />} />
                <Route
                  path="session/:appointmentId"
                  element={<VideoSessionPage />}
                />
                <Route
                  path="dashboard"
                  element={<Navigate to="doctors" replace />}
                />
              </Route>

              {/* ── Doctor routes (DashboardLayout) ── */}
              <Route
                path="/doctor"
                element={
                  <AuthGuard allowedRoles={["DOCTOR"]}>
                    <DashboardLayout />
                  </AuthGuard>
                }
              >
                <Route index element={<Navigate to="appointments" replace />} />
                <Route path="availability" element={<AvailabilityPage />} />
                <Route
                  path="appointments"
                  element={<DoctorAppointmentsPage />}
                />
                <Route path="schedule" element={<DailySchedulePage />} />
                <Route
                  path="patient-records"
                  element={<DoctorPatientRecordsPage />}
                />
                <Route
                  path="prescriptions"
                  element={<DoctorPrescriptionsPage />}
                />
                <Route
                  path="prescriptions/create"
                  element={<CreatePrescriptionPage />}
                />
                <Route path="profile" element={<DoctorProfilePage />} />
                <Route
                  path="session/:appointmentId"
                  element={<VideoSessionPage />}
                />
                <Route
                  path="dashboard"
                  element={<Navigate to="appointments" replace />}
                />
              </Route>

              {/* ── Admin routes (DashboardLayout) ── */}
              <Route
                path="/admin"
                element={
                  <AuthGuard allowedRoles={["ADMIN"]}>
                    <DashboardLayout />
                  </AuthGuard>
                }
              >
                <Route index element={<Navigate to="appointments" replace />} />
                <Route
                  path="appointments"
                  element={<AdminAppointmentsPage />}
                />
                <Route path="records" element={<AdminRecordsPage />} />
                <Route
                  path="prescriptions"
                  element={<AdminPrescriptionsPage />}
                />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="users" element={<AdminUserManagementPage />} />
                <Route
                  path="profile"
                  element={<Navigate to="/admin/users" replace />}
                />
                <Route
                  path="dashboard"
                  element={<Navigate to="/admin/appointments" replace />}
                />
              </Route>

              {/* ── 404 catch-all ── */}
              <Route
                path="*"
                element={
                  <div className="flex flex-col items-center justify-center h-screen gap-4">
                    <h1 className="text-6xl font-bold text-blue-600">404</h1>
                    <p className="text-slate-500">Page not found.</p>
                    <Link
                      to="/auth/login"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Go to Login
                    </Link>
                  </div>
                }
              />
            </Routes>
          </MedicalProvider>
        </AppointmentProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
