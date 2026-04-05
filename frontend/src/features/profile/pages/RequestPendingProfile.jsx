import PatientProfilePage from "./PatientProfile";
import { PATIENT_PROFILE_VIEW_MODE } from "../hooks/usePatientProfile";

export default function RequestPendingProfilePage() {
  return (
    <PatientProfilePage viewMode={PATIENT_PROFILE_VIEW_MODE.REQUEST_PENDING} />
  );
}
