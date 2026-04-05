import PatientProfilePage from "./PatientProfile";
import { PATIENT_PROFILE_VIEW_MODE } from "../hooks/usePatientProfile";

export default function UpgradeRequestProfilePage() {
  return (
    <PatientProfilePage viewMode={PATIENT_PROFILE_VIEW_MODE.UPGRADE_REQUEST} />
  );
}
