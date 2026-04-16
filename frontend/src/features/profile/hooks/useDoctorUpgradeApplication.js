import { useCallback, useEffect, useMemo, useState } from "react";
import {
  submitDoctorUpgradeRequest,
  updateMyDoctorApplication,
  uploadProfilePicture,
} from "../services/profileService";
import {
  normalizeUpper,
  validateDoctorUpgradeRequestField,
  validateDoctorUpgradeRequestForm,
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
  const [touchedFields, setTouchedFields] = useState({});

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
      setTouchedFields({});
      setDoctorUpgradeForm({
        fullName: ensureDoctorPrefix(
          applicationData?.fullName || profileData?.fullName,
        ),
        gender: applicationData?.gender || profileData?.gender || "",
        specialization: applicationData?.specialization || "",
        qualifications: applicationData?.qualifications || "",
        experienceYears:
          applicationData?.experienceYears != null
            ? String(applicationData.experienceYears)
            : "",
        profilePictureUrl:
          applicationData?.profilePictureUrl ||
          applicationData?.profileImageUrl ||
          profileData?.profilePictureUrl ||
          profileData?.profileImageUrl ||
          "",
        profilePictureFile: null,
      });
    },
    [],
  );

  const getFieldError = useCallback((name, nextForm) => {
    return validateDoctorUpgradeRequestField(name, nextForm);
  }, []);

  const updateDoctorUpgradeField = useCallback((name, value) => {
    const nextValue = name === "fullName" ? ensureDoctorPrefix(value) : value;

    setDoctorUpgradeForm((prev) => {
      const next = { ...prev, [name]: nextValue };

      setDoctorUpgradeErrors((prevErrs) => {
        if (!touchedFields[name] && !prevErrs[name]) return prevErrs;
        return {
          ...prevErrs,
          [name]: getFieldError(name, next) || "",
        };
      });
      return next;
    });

    setDoctorUpgradeError("");
    setDoctorUpgradeSuccess("");
  }, [getFieldError, touchedFields]);

  const handleDoctorUpgradeFieldBlur = useCallback((name, valueOverride) => {
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    setDoctorUpgradeErrors((prev) => {
      const nextForm =
        valueOverride === undefined
          ? doctorUpgradeForm
          : { ...doctorUpgradeForm, [name]: valueOverride };
      return {
        ...prev,
        [name]: getFieldError(name, nextForm) || "",
      };
    });
  }, [doctorUpgradeForm, getFieldError]);

  const handleDoctorUpgradeSubmit = useCallback(
    async (event, { onAfterSubmit } = {}) => {
      event.preventDefault();

      const validationErrors = validateDoctorUpgradeRequestForm(
        doctorUpgradeForm,
      );
      setTouchedFields({
        fullName: true,
        gender: true,
        specialization: true,
        qualifications: true,
        experienceYears: true,
        profilePictureFile: true,
      });
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
        setDoctorApplication((prev) => ({
          ...(prev || {}),
          ...(response?.data || {}),
          approvalStatus:
            response?.data?.approvalStatus ||
            response?.data?.status ||
            STATUS.PENDING,
        }));
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
        setTouchedFields({});

        await refreshAuthSession();
        if (onAfterSubmit) {
          await onAfterSubmit();
        }
        return {
          success: true,
          response,
        };
      } catch (error) {
        const msg = getApiErrorMessage(
          error,
          "Unable to submit doctor upgrade request.",
        );
        setDoctorUpgradeError(msg);
        notifyError(msg);
        throw error;
      } finally {
        setIsSubmittingDoctorUpgrade(false);
      }
    },
    [doctorUpgradeForm, isDoctorRequestPending, refreshAuthSession],
  );

  const isDoctorUpgradeFormValid = useMemo(() => {
    const nextErrors = validateDoctorUpgradeRequestForm(doctorUpgradeForm);
    return !Object.values(nextErrors).some(Boolean);
  }, [doctorUpgradeForm]);

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
    handleDoctorUpgradeFieldBlur,
    isDoctorUpgradeFormValid,
    handleDoctorUpgradeSubmit,
    setDoctorUpgradeError,
    setDoctorUpgradeSuccess,
    setShowDoctorUpgradeForm,
  };
}
