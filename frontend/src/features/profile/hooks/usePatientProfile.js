import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyDoctorApplication,
  getMyPatientProfile,
} from "../services/profileService";
import { useAuth } from "../../auth/context/AuthContext";
import { getApiErrorMessage } from "../../../utils/api";
import { notifyError } from "../../../utils/toast";
import usePatientProfileCoreController from "./usePatientProfileCore";
import useDoctorUpgradeApplicationController from "./useDoctorUpgradeApplication";

export const PATIENT_PROFILE_VIEW_MODE = {
  PROFILE: "PROFILE",
  REQUEST_PENDING: "REQUEST_PENDING",
  UPGRADE_REQUEST: "UPGRADE_REQUEST",
};

function normalizeRole(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeProfileCompleted(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  const normalizedValue = String(value || "").trim().toLowerCase();
  if (normalizedValue === "true" || normalizedValue === "1") return true;
  if (normalizedValue === "false" || normalizedValue === "0") return false;

  return false;
}

export default function usePatientProfileController({
  viewMode = PATIENT_PROFILE_VIEW_MODE.PROFILE,
} = {}) {
  const { user, refreshAuthSession, getHomeRouteFromRole } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const redirectedToDoctorRef = useRef(false);

  const core = usePatientProfileCoreController({
    user,
    refreshAuthSession,
  });

  const {
    form,
    errors,
    isSaving,
    isDeleting,
    serverError,
    successMessage,
    profileMeta,
    profilePicturePreviewUrl,
    hydrateProfile,
    updateField,
    handleFieldBlur,
    isFormValid,
    handleSubmit,
    handleDeleteProfile,
    setServerError,
    setSuccessMessage,
  } = core;

  const doctorUpgrade = useDoctorUpgradeApplicationController({
    refreshAuthSession,
  });

  const {
    isDoctorRequestPending,
    isDoctorRequestApproved,
    isDoctorRequestRejected,
    canShowDoctorUpgrade,
    doctorApplication,
    doctorUpgradeForm,
    doctorUpgradeErrors,
    isSubmittingDoctorUpgrade,
    doctorUpgradeError,
    doctorUpgradeSuccess,
    showDoctorUpgradeForm,
    hydrateDoctorApplication,
    updateDoctorUpgradeField,
    handleDoctorUpgradeFieldBlur,
    isDoctorUpgradeFormValid,
    handleDoctorUpgradeSubmit: submitDoctorUpgrade,
    setDoctorUpgradeError,
    setDoctorUpgradeSuccess,
    setShowDoctorUpgradeForm,
  } = doctorUpgrade;

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setServerError("");

      const [profileResult, applicationResult] = await Promise.allSettled([
        getMyPatientProfile(),
        getMyDoctorApplication(),
      ]);

      let profileData = null;
      if (profileResult.status === "fulfilled") {
        profileData = profileResult.value?.data || null;
        hydrateProfile(profileData);
      } else if (profileResult.reason?.response?.status === 404) {
        hydrateProfile(null);
      } else {
        const msg = getApiErrorMessage(
          profileResult.reason,
          "Unable to load patient profile.",
        );
        setServerError(msg);
        notifyError(msg);
      }

      let applicationData = null;
      if (applicationResult.status === "fulfilled") {
        applicationData = applicationResult.value?.data || null;
      } else {
        const err = applicationResult.reason;
        const status = err?.response?.status;
        if (status === 404) {
          applicationData = null;
        } else if (status === 409) {
          applicationData = { approvalStatus: "APPROVED" };
          setDoctorUpgradeError(
            err?.response?.data?.message ||
              "Your doctor application has been approved.",
          );
        } else {
          const msg = getApiErrorMessage(
            err,
            "Unable to load doctor request status.",
          );
          setServerError((prev) => prev || msg);
          notifyError(msg);
        }
      }

      hydrateDoctorApplication({ applicationData, profileData });
    } catch (error) {
      const msg = getApiErrorMessage(error, "Unable to load patient profile.");
      setServerError(msg);
      notifyError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [
    hydrateDoctorApplication,
    hydrateProfile,
    setDoctorUpgradeError,
    setServerError,
  ]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (isLoading || !isDoctorRequestApproved) return;

    if (!redirectedToDoctorRef.current) {
      redirectedToDoctorRef.current = true;
      (async () => {
        await refreshAuthSession();
        navigate("/doctor/appointments", { replace: true });
      })();
    }
  }, [isDoctorRequestApproved, isLoading, navigate, refreshAuthSession]);

  const handleDoctorUpgradeSubmit = useCallback(
    async (event) => {
      const result = await submitDoctorUpgrade(event, {
        onAfterSubmit: fetchProfile,
      });

      if (result?.success) {
        setShowDoctorUpgradeForm(false);
      }

      return result;
    },
    [fetchProfile, setShowDoctorUpgradeForm, submitDoctorUpgrade],
  );

  const handlePatientProfileSubmit = useCallback(
    async (event) => {
      const isNewProfile = !profileMeta;
      const result = await handleSubmit(event);

      if (result?.success && isNewProfile) {
        navigate(getHomeRouteFromRole("PATIENT"), { replace: true });
      }

      return result;
    },
    [getHomeRouteFromRole, handleSubmit, navigate, profileMeta],
  );

  const isProfileView = viewMode === PATIENT_PROFILE_VIEW_MODE.PROFILE;
  const isRequestPendingView =
    viewMode === PATIENT_PROFILE_VIEW_MODE.REQUEST_PENDING;
  const isDoctorUpgradeView = isProfileView && showDoctorUpgradeForm;
  const isPatientRole = normalizeRole(user?.role) === "PATIENT";
  const hasCompletedPatientProfile = normalizeProfileCompleted(
    user?.isProfileCompleted ?? user?.is_profile_completed,
  );

  const isPatientFormLocked =
    isDoctorRequestPending || isSubmittingDoctorUpgrade;
  const isDoctorUpgradeDisabled =
    isPatientRole &&
    hasCompletedPatientProfile &&
    !isDoctorRequestPending &&
    !isDoctorRequestRejected;
  const doctorUpgradeButtonLabel = isDoctorRequestPending
    ? "Update Doctor Profile"
    : "Upgrade as Doctor";
  const shouldShowPatientForm = !isRequestPendingView && !isDoctorUpgradeView;
  const shouldShowDoctorUpgradeSection =
    canShowDoctorUpgrade &&
    (isRequestPendingView || showDoctorUpgradeForm || isDoctorRequestRejected);

  const patientFormTitle = profileMeta ? "Patient Profile" : "Profile Setup";
  const patientDescription = profileMeta
    ? "Manage your personal health details and preferences."
    : "Create your patient profile to access appointments, records, and prescriptions.";
  const patientSubmitLabel = profileMeta ? "Save Changes" : "Initialize & Save";

  const doctorSectionDescription = isDoctorRequestPending
    ? "Your doctor upgrade request is under review. You can still edit and update it before approval."
    : isDoctorRequestRejected
      ? "Your request was rejected. Review the reason and resubmit."
      : "Complete your professional details to apply for a doctor account.";

  return {
    user,
    form,
    errors,
    isLoading,
    isSaving,
    isDeleting,
    serverError,
    successMessage,
    profileMeta,
    doctorApplication,
    doctorUpgradeForm,
    doctorUpgradeErrors,
    isSubmittingDoctorUpgrade,
    doctorUpgradeError,
    doctorUpgradeSuccess,
    profilePicturePreviewUrl,
    showDoctorUpgradeForm,
    isDoctorRequestPending,
    isDoctorRequestApproved,
    isDoctorRequestRejected,
    isPatientFormLocked,
    isDoctorUpgradeDisabled,
    doctorUpgradeButtonLabel,
    canShowDoctorUpgrade,
    isProfileView,
    isRequestPendingView,
    shouldShowPatientForm,
    shouldShowDoctorUpgradeSection,
    patientFormTitle,
    patientDescription,
    patientSubmitLabel,
    doctorSectionDescription,
    updateField,
    handleFieldBlur,
    isFormValid,
    updateDoctorUpgradeField,
    handleDoctorUpgradeFieldBlur,
    isDoctorUpgradeFormValid,
    handleSubmit: handlePatientProfileSubmit,
    handleDoctorUpgradeSubmit,
    handleDeleteProfile,
    setServerError,
    setSuccessMessage,
    setDoctorUpgradeError,
    setDoctorUpgradeSuccess,
    setShowDoctorUpgradeForm,
  };
}