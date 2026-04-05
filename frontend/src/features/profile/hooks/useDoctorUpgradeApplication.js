import { useCallback, useEffect, useMemo, useState } from "react";
import {
  submitDoctorUpgradeRequest,
  updateMyDoctorApplication,
  uploadProfilePicture,
} from "../services/profileService";
import {
  normalizeUpper,
  validateDoctorUpgradeRequestForm,
  validateProfilePictureFile,
} from "../../../utils/validation";
import { getApiErrorMessage } from "../../../utils/api";
import { notifyApiSuccess, notifyError } from "../../../utils/toast";

const DOCTOR_NAME_PREFIX = "Dr. ";

const EMPTY_DOCTOR_UPGRADE_FORM = {
  fullName: DOCTOR_NAME_PREFIX,
  gender: "",
  specialization: "",
  qualifications: "",
  experienceYears: "",
  profilePictureUrl: "",
  profilePictureFile: null,
};

const STATUS = {
  NOT_SUBMITTED: "NOT_SUBMITTED",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

function getDoctorRequestStatus(application) {
  return (
    normalizeUpper(application?.approvalStatus || application?.status) ||
    STATUS.NOT_SUBMITTED
  );
}

function ensureDoctorPrefix(value) {
  const raw = String(value || "").trim();
  if (!raw) return DOCTOR_NAME_PREFIX;
  const stripped = raw.replace(/^dr\.\s*/i, "").trimStart();
  return `${DOCTOR_NAME_PREFIX}${stripped}`;
}

export default function useDoctorUpgradeApplicationController({
  refreshAuthSession,
}) {
  const [doctorApplication, setDoctorApplication] = useState(null);
  const [doctorUpgradeForm, setDoctorUpgradeForm] = useState(
    EMPTY_DOCTOR_UPGRADE_FORM,
  );
  const [doctorUpgradeErrors, setDoctorUpgradeErrors] = useState({});
  const [isSubmittingDoctorUpgrade, setIsSubmittingDoctorUpgrade] =
    useState(false);
  const [doctorUpgradeError, setDoctorUpgradeError] = useState("");
  const [doctorUpgradeSuccess, setDoctorUpgradeSuccess] = useState("");
  const [showDoctorUpgradeForm, setShowDoctorUpgradeForm] = useState(false);

  useEffect(() => {
    if (!doctorUpgradeSuccess) return;
    const t = setTimeout(() => setDoctorUpgradeSuccess(""), 7000);
    return () => clearTimeout(t);
  }, [doctorUpgradeSuccess]);

  const doctorRequestStatus = useMemo(
    () => getDoctorRequestStatus(doctorApplication),
    [doctorApplication],
  );
  const isDoctorRequestPending = doctorRequestStatus === STATUS.PENDING;
  const isDoctorRequestApproved = doctorRequestStatus === STATUS.APPROVED;
  const isDoctorRequestRejected = doctorRequestStatus === STATUS.REJECTED;
  const canShowDoctorUpgrade = doctorRequestStatus !== STATUS.APPROVED;

  const hydrateDoctorApplication = useCallback(
    ({ applicationData, profileData }) => {
      setDoctorApplication(applicationData || null);
      setDoctorUpgradeForm((prev) => ({
        ...prev,
        fullName:
          prev.fullName ||
          ensureDoctorPrefix(
            applicationData?.fullName || profileData?.fullName,
          ),
        gender:
          prev.gender || applicationData?.gender || profileData?.gender || "",
        specialization:
          prev.specialization || applicationData?.specialization || "",
        qualifications:
          prev.qualifications || applicationData?.qualifications || "",
        experienceYears:
          prev.experienceYears ||
          (applicationData?.experienceYears != null
            ? String(applicationData.experienceYears)
            : ""),
        profilePictureUrl:
          prev.profilePictureUrl ||
          applicationData?.profilePictureUrl ||
          profileData?.profilePictureUrl ||
          "",
        profilePictureFile: null,
      }));
    },
    [],
  );

  const updateDoctorUpgradeField = useCallback((name, value) => {
    const nextValue = name === "fullName" ? ensureDoctorPrefix(value) : value;

    setDoctorUpgradeForm((prev) => {
      const next = { ...prev, [name]: nextValue };
      const hasExisting = Boolean(String(next.profilePictureUrl || "").trim());
      setDoctorUpgradeErrors((prevErrs) => {
        if (!prevErrs[name]) return prevErrs;
        const all = {
          ...validateDoctorUpgradeRequestForm(next),
          profilePictureFile: validateProfilePictureFile(
            next.profilePictureFile,
            { requiredValue: !hasExisting, maxSizeMB: 5 },
          ),
        };
        return { ...prevErrs, [name]: all[name] || "" };
      });
      return next;
    });

    setDoctorUpgradeError("");
    setDoctorUpgradeSuccess("");
  }, []);

  const handleDoctorUpgradeSubmit = useCallback(
    async (event, { onAfterSubmit } = {}) => {
      event.preventDefault();

      const hasExisting = Boolean(
        String(doctorUpgradeForm.profilePictureUrl || "").trim(),
      );
      const validationErrors = {
        ...validateDoctorUpgradeRequestForm(doctorUpgradeForm),
        profilePictureFile: validateProfilePictureFile(
          doctorUpgradeForm.profilePictureFile,
          { requiredValue: !hasExisting, maxSizeMB: 5 },
        ),
      };
      setDoctorUpgradeErrors(validationErrors);
      if (Object.values(validationErrors).some(Boolean)) return;

      try {
        setIsSubmittingDoctorUpgrade(true);
        setDoctorUpgradeError("");

        let pictureUrl = String(
          doctorUpgradeForm.profilePictureUrl || "",
        ).trim();
        if (doctorUpgradeForm.profilePictureFile) {
          const uploaded = await uploadProfilePicture(
            doctorUpgradeForm.profilePictureFile,
          );
          pictureUrl = uploaded || pictureUrl;
        }

        const payload = {
          fullName: doctorUpgradeForm.fullName.trim(),
          gender: normalizeUpper(doctorUpgradeForm.gender),
          specialization: doctorUpgradeForm.specialization.trim(),
          qualifications: doctorUpgradeForm.qualifications.trim(),
          experienceYears: Number(doctorUpgradeForm.experienceYears),
          profilePictureUrl: pictureUrl || null,
        };

        const response = isDoctorRequestPending
          ? await updateMyDoctorApplication(payload)
          : await submitDoctorUpgradeRequest(payload);

        setDoctorUpgradeSuccess(
          response?.message ||
            (isDoctorRequestPending
              ? "Doctor upgrade request updated successfully."
              : "Doctor upgrade request submitted successfully."),
        );
        notifyApiSuccess(
          response,
          isDoctorRequestPending
            ? "Doctor upgrade request updated."
            : "Doctor upgrade request submitted.",
        );
        setDoctorUpgradeForm((prev) => ({
          ...prev,
          profilePictureUrl: pictureUrl || prev.profilePictureUrl,
          profilePictureFile: null,
        }));

        await refreshAuthSession();
        if (onAfterSubmit) {
          await onAfterSubmit();
        }
      } catch (error) {
        const msg = getApiErrorMessage(
          error,
          "Unable to submit doctor upgrade request.",
        );
        setDoctorUpgradeError(msg);
        notifyError(msg);
      } finally {
        setIsSubmittingDoctorUpgrade(false);
      }
    },
    [doctorUpgradeForm, isDoctorRequestPending, refreshAuthSession],
  );

  return {
    doctorApplication,
    doctorUpgradeForm,
    doctorUpgradeErrors,
    isSubmittingDoctorUpgrade,
    doctorUpgradeError,
    doctorUpgradeSuccess,
    showDoctorUpgradeForm,
    isDoctorRequestPending,
    isDoctorRequestApproved,
    isDoctorRequestRejected,
    canShowDoctorUpgrade,
    hydrateDoctorApplication,
    updateDoctorUpgradeField,
    handleDoctorUpgradeSubmit,
    setDoctorUpgradeError,
    setDoctorUpgradeSuccess,
    setShowDoctorUpgradeForm,
  };
}
