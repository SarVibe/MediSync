/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import ScrollToTop from "./components/common/ScrollToTop";

// ── Common pages ────────────────────────────────────────────────────────────
import MediSyncHomePage from "./pages/Home";
import AboutUsPage from "./pages/public/AboutUsPage";
import ContactUsPage from "./pages/public/ContactUsPage";
import PrivacyPolicyPage from "./pages/public/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/public/TermsOfServicePage";

// ── Auth pages ──────────────────────────────────────────────────────────────
import LoginPage from "./features/auth/pages/Login";
// import SignupPage from "./features/auth/pages/Signup";
import ForgotPasswordPage from "./features/auth/pages/ForgotPassword";
import OtpVerificationPage from "./features/auth/pages/OtpVerification";
import Admin2FAPage from "./features/auth/pages/Admin2FA";
import ChangePasswordPage from "./features/auth/pages/ChangePassword";
import AuthProvider from "./features/auth/context/AuthContext";
import AuthGuard from "./features/auth/components/AuthGuard";

// ── Appointment context ─────────────────────────────────────────────────────
import { AppointmentProvider } from "./features/appointment/AppointmentContext";
import { MedicalProvider } from "./features/records/MedicalContext";

// ── Patient pages ───────────────────────────────────────────────────────────
import DoctorSearchPage from "./features/appointment/pages/DoctorSearchPage";
import BookAppointmentPage from "./features/appointment/pages/BookAppointmentPage";
import PatientAppointmentsPage from "./features/appointment/pages/PatientAppointmentsPage";
import PatientRecordsPage from "./features/records/pages/PatientRecordsPage";
import PatientPrescriptionsPage from "./features/records/pages/PatientPrescriptionsPage";
import UploadRecordPage from "./features/records/pages/UploadRecordPage";

// ── Doctor pages ────────────────────────────────────────────────────────────
import AvailabilityPage from "./features/appointment/pages/AvailabilityPage";
import DoctorAppointmentsPage from "./features/appointment/pages/DoctorAppointmentsPage";
import DailySchedulePage from "./features/appointment/pages/DailySchedulePage";
import DoctorPatientRecordsPage from "./features/records/pages/DoctorPatientRecordsPage";
import DoctorPrescriptionsPage from "./features/records/pages/DoctorPrescriptionsPage";
import CreatePrescriptionPage from "./features/records/pages/CreatePrescriptionPage";

// ── Admin pages ─────────────────────────────────────────────────────────────
import AdminAppointmentsPage from "./features/appointment/pages/AdminAppointmentsPage";
import AdminRecordsPage from "./features/records/pages/AdminRecordsPage";
import AdminPrescriptionsPage from "./features/records/pages/AdminPrescriptionsPage";
import AdminPaymentsPage from "./features/payment/pages/AdminPaymentsPage";
import AdminUserManagementPage from "./features/profile/pages/AdminUserManagement";

// ── Profile pages ───────────────────────────────────────────────────────────
import ProfilePage from "./features/profile/pages/Profile";
import DoctorProfilePage from "./features/profile/pages/DoctorProfile";
import PatientProfilePage from "./features/profile/pages/PatientProfile";
import RequestPendingProfilePage from "./features/profile/pages/RequestPendingProfile";
import UpgradeRequestProfilePage from "./features/profile/pages/UpgradeRequestProfile";
import UnauthorizedPage from "./features/auth/pages/Unauthorized";

// ── Telemedicine pages ──────────────────────────────────────────────────────
import VideoSessionPage from "./features/telemedicine/pages/VideoSessionPage";

// ── Payment pages ───────────────────────────────────────────────────────────
import PaymentCheckoutPage from "./features/payment/pages/PaymentCheckoutPage";
import PaymentStatusPage from "./features/payment/pages/PaymentStatusPage";

// ── Symptom Checker pages ───────────────────────────────────────────────────
import SymptomCheckerPage from "./features/symptom-checker/pages/SymptomCheckerPage";

// ── Layouts ─────────────────────────────────────────────────────────────────
import DashboardLayout from "./components/layout/DashboardLayout";
import MainLayout from "./components/layout/MainLayout";

function App() {
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const windowHeight = window.innerHeight || 0;
      const docHeight = document.documentElement.scrollHeight || 0;
      const threshold = 40;

      const atTop = scrollTop <= threshold;
      const atBottom = windowHeight + scrollTop >= docHeight - threshold;

      setShowScrollUp(!atTop);
      setShowScrollDown(!atBottom);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />

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
              {/* Default routes */}
              <Route path="/" element={<MediSyncHomePage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />

              {/* Auth routes */}
              <Route path="/auth/login" element={<LoginPage />} />
              {/* <Route path="/auth/signup" element={<SignupPage />} /> */}
              <Route path="/auth/otp" element={<OtpVerificationPage />} />
              <Route path="/auth/admin-2fa" element={<Admin2FAPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/change-password" element={<ChangePasswordPage />} />
              

              {/* Cross-role gate routes */}
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

              {/* Patient routes */}
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
                <Route path="book/:doctorId" element={<BookAppointmentPage />} />
                <Route path="appointments" element={<PatientAppointmentsPage />} />
                <Route path="records" element={<PatientRecordsPage />} />
                <Route path="prescriptions" element={<PatientPrescriptionsPage />} />
                <Route path="upload-record" element={<UploadRecordPage />} />
                <Route path="profile" element={<PatientProfilePage />} />
                <Route path="symptom-checker" element={<SymptomCheckerPage />} />
                <Route path="payment/checkout" element={<PaymentCheckoutPage />} />
                <Route path="payment-status" element={<PaymentStatusPage />} />
                <Route path="session/:appointmentId" element={<VideoSessionPage />} />
                <Route path="dashboard" element={<Navigate to="doctors" replace />} />
              </Route>

              {/* Doctor routes */}
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
                <Route path="appointments" element={<DoctorAppointmentsPage />} />
                <Route path="schedule" element={<DailySchedulePage />} />
                <Route path="patient-records" element={<DoctorPatientRecordsPage />} />
                <Route path="prescriptions" element={<DoctorPrescriptionsPage />} />
                <Route path="prescriptions/create" element={<CreatePrescriptionPage />} />
                <Route path="profile" element={<DoctorProfilePage />} />
                <Route path="session/:appointmentId" element={<VideoSessionPage />} />
                <Route path="dashboard" element={<Navigate to="appointments" replace />} />
              </Route>

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <AuthGuard allowedRoles={["ADMIN"]}>
                    <DashboardLayout />
                  </AuthGuard>
                }
              >
                <Route index element={<Navigate to="appointments" replace />} />
                <Route path="appointments" element={<AdminAppointmentsPage />} />
                <Route path="records" element={<AdminRecordsPage />} />
                <Route path="prescriptions" element={<AdminPrescriptionsPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="users" element={<AdminUserManagementPage />} />
                <Route path="profile" element={<Navigate to="/admin/users" replace />} />
                <Route
                  path="dashboard"
                  element={<Navigate to="/admin/appointments" replace />}
                />
              </Route>

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="flex flex-col gap-4 justify-center items-center h-screen">
                    <h1 className="text-6xl font-bold text-blue-600">404</h1>
                    <p className="text-slate-500">Page not found.</p>
                    <Link
                      to="/auth/login"
                      className="text-blue-600 underline transition-colors hover:text-blue-800"
                    >
                      Go to Login
                    </Link>
                  </div>
                }
              />
            </Routes>

            <AnimatePresence>
              {showScrollUp && (
                <motion.button
                  key="scroll-up"
                  type="button"
                  aria-label="Scroll to top"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 40, scale: 0.9 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed bottom-28 right-5 z-50 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </motion.button>
              )}

              {showScrollDown && (
                <motion.button
                  key="scroll-down"
                  type="button"
                  aria-label="Scroll to bottom"
                  onClick={() =>
                    window.scrollTo({
                      top: document.documentElement.scrollHeight,
                      behavior: "smooth",
                    })
                  }
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 40, scale: 0.9 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed bottom-6 right-5 z-50 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </MedicalProvider>
        </AppointmentProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
