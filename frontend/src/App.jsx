import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

// ── Auth pages ────────────────────────────────────────────────────────────
import LoginPage          from "./features/auth/pages/LoginPage";
import SignupPage         from "./features/auth/pages/SignupPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";

// ── Appointment context ───────────────────────────────────────────────────
import { AppointmentProvider } from "./features/appointment/AppointmentContext";
import { MedicalProvider }     from "./features/records/MedicalContext";

// ── Patient pages ─────────────────────────────────────────────────────────
import DoctorSearchPage         from "./features/appointment/pages/DoctorSearchPage";
import BookAppointmentPage      from "./features/appointment/pages/BookAppointmentPage";
import PatientAppointmentsPage  from "./features/appointment/pages/PatientAppointmentsPage";
import PatientRecordsPage       from "./features/records/pages/PatientRecordsPage";
import PatientPrescriptionsPage from "./features/records/pages/PatientPrescriptionsPage";
import UploadRecordPage         from "./features/records/pages/UploadRecordPage";

// ── Doctor pages ──────────────────────────────────────────────────────────
import AvailabilityPage         from "./features/appointment/pages/AvailabilityPage";
import DoctorAppointmentsPage   from "./features/appointment/pages/DoctorAppointmentsPage";
import DailySchedulePage        from "./features/appointment/pages/DailySchedulePage";
import DoctorPatientRecordsPage from "./features/records/pages/DoctorPatientRecordsPage";
import DoctorPrescriptionsPage  from "./features/records/pages/DoctorPrescriptionsPage";
import CreatePrescriptionPage   from "./features/records/pages/CreatePrescriptionPage";

// ── Admin pages ───────────────────────────────────────────────────────────
import AdminAppointmentsPage    from "./features/appointment/pages/AdminAppointmentsPage";
import AdminRecordsPage         from "./features/records/pages/AdminRecordsPage";
import AdminPrescriptionsPage   from "./features/records/pages/AdminPrescriptionsPage";
import AdminPaymentsPage        from "./features/payment/pages/AdminPaymentsPage";
import AdminUserManagementPage  from "./features/profile/pages/AdminUserManagementPage";

// ── Profile pages ─────────────────────────────────────────────────────────
import PatientProfilePage       from "./features/profile/pages/PatientProfilePage";
import AISymptomCheckerPage    from "./features/symptom/pages/AISymptomCheckerPage";
import DoctorProfilePage        from "./features/profile/pages/DoctorProfilePage";

// ── Telemedicine pages ────────────────────────────────────────────────────
import VideoSessionPage         from "./features/telemedicine/pages/VideoSessionPage";

// ── Payment pages ──────────────────────────────────────────────────────────
import PaymentCheckoutPage      from "./features/payment/pages/PaymentCheckoutPage";
import PaymentStatusPage        from "./features/payment/pages/PaymentStatusPage";

// ── Layouts ───────────────────────────────────────────────────────────────
import DashboardLayout     from "./components/layout/DashboardLayout";
import MainLayout          from "./components/layout/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <AppointmentProvider>
        <MedicalProvider>
          <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />

            {/* ── Auth routes (No Layout) ── */}
            <Route path="/auth/login"           element={<LoginPage />}          />
            <Route path="/auth/signup"          element={<SignupPage />}         />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

            {/* ── Patient routes (MainLayout) ── */}
            <Route path="/patient" element={<MainLayout />}>
              <Route index element={<Navigate to="doctors" replace />} />
              <Route path="doctors"       element={<DoctorSearchPage />}        />
              <Route path="book/:doctorId" element={<BookAppointmentPage />}   />
              <Route path="appointments"  element={<PatientAppointmentsPage />} />
              <Route path="records"       element={<PatientRecordsPage />}      />
              <Route path="prescriptions" element={<PatientPrescriptionsPage />} />
              <Route path="upload-record" element={<UploadRecordPage />}        />
              <Route path="profile"       element={<PatientProfilePage />}      />
              <Route path="ai-checker"    element={<AISymptomCheckerPage />}    />
              <Route path="payment/:appointmentId" element={<PaymentCheckoutPage />} />
              <Route path="payment-status"         element={<PaymentStatusPage />}   />
              <Route path="session/:appointmentId" element={<VideoSessionPage />}    />
              <Route
                path="dashboard"
                element={<Navigate to="doctors" replace />}
              />
            </Route>

            {/* ── Doctor routes (DashboardLayout) ── */}
            <Route path="/doctor" element={<DashboardLayout />}>
              <Route index element={<Navigate to="appointments" replace />} />
              <Route path="availability"      element={<AvailabilityPage />}       />
              <Route path="appointments"      element={<DoctorAppointmentsPage />} />
              <Route path="schedule"          element={<DailySchedulePage />}      />
              <Route path="patient-records"   element={<DoctorPatientRecordsPage />} />
              <Route path="prescriptions"     element={<DoctorPrescriptionsPage />} />
              <Route path="prescriptions/create" element={<CreatePrescriptionPage />} />
              <Route path="profile"           element={<DoctorProfilePage />}      />
              <Route path="session/:appointmentId" element={<VideoSessionPage />}    />
              <Route
                path="dashboard"
                element={<Navigate to="appointments" replace />}
              />
            </Route>

            {/* ── Admin routes (DashboardLayout) ── */}
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<Navigate to="appointments" replace />} />
              <Route path="appointments"   element={<AdminAppointmentsPage />}  />
              <Route path="records"        element={<AdminRecordsPage />}       />
              <Route path="prescriptions"  element={<AdminPrescriptionsPage />} />
              <Route path="payments"       element={<AdminPaymentsPage />}      />
              <Route path="users"          element={<AdminUserManagementPage />} />
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
                  <Link to="/auth/login" className="text-blue-600 underline hover:text-blue-800">
                    Go to Login
                  </Link>
                </div>
              }
            />
          </Routes>
        </MedicalProvider>
      </AppointmentProvider>
    </BrowserRouter>
  );
}

export default App;
