import { useAuth } from "../../auth/context/AuthContext";
import DoctorProfilePage from "./DoctorProfile";
import PatientProfilePage from "./PatientProfile";
import { PATIENT_PROFILE_VIEW_MODE } from "../hooks/usePatientProfile";

export default function Profile() {
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();

  if (role === "DOCTOR") {
    return <DoctorProfilePage />;
  }

  return <PatientProfilePage viewMode={PATIENT_PROFILE_VIEW_MODE.PROFILE} />;
}
