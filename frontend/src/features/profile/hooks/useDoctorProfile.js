import { useEffect, useMemo, useState } from "react";
import {
  getMyDoctorApplication,
  getMyDoctorProfile,
  submitDoctorUpgradeRequest,
  updateMyDoctorApplication,
  updateMyDoctorProfile,
  uploadProfilePicture,
} from "../services/profileService";
import { useAuth } from "../../auth/context/AuthContext";
import {
  normalizeUpper,
  validateDoctorProfileForm,
  validateExperienceYears,
  validateGender,
  validateFullName,
  validateQualifications,
  validateSpecialization,
} from "../../../utils/validation";
import { getApiErrorMessage } from "../../../utils/api";
import { notifyApiSuccess, notifyError } from "../../../utils/toast";

const EMPTY_FORM = {
  fullName: "",
  gender: "",
  specialization: "",
  qualifications: "",
  experienceYears: "",
  profilePictureUrl: "",
  profilePictureFile: null,
};

function mapDoctorDtoToForm(data) {
  return {
    fullName: data?.fullName || "",
    gender: data?.gender || "",
    specialization: data?.specialization || "",
    qualifications: data?.qualifications || "",
    experienceYears:
      data?.experienceYears === 0 || data?.experienceYears
        ? String(data.experienceYears)
        : "",
    profilePictureUrl: data?.profilePictureUrl || "",
    profilePictureFile: null,
  };
}

export default function useDoctorProfileController() {
  const { user } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [doctorData, setDoctorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [profilePicturePreviewUrl, setProfilePicturePreviewUrl] = useState("");

  useEffect(() => {
    if (!form.profilePictureFile) {
      setProfilePicturePreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(form.profilePictureFile);
    setProfilePicturePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [form.profilePictureFile]);

  const isDoctorRole = useMemo(
    () => normalizeUpper(user?.role) === "DOCTOR",
    [user],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setServerError("");

        const response = isDoctorRole
          ? await getMyDoctorProfile()
          : await getMyDoctorApplication();

        const data = response?.data;
        setDoctorData(data);
        setForm(mapDoctorDtoToForm(data));
      } catch (error) {
        if (error?.response?.status === 404) {
          setDoctorData(null);
        } else {
          const message = getApiErrorMessage(
            error,
            "Unable to load doctor profile details.",
          );
          setServerError(message);
          notifyError(message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isDoctorRole]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(""), 6000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const validateForm = () => {
    const nextErrors = validateDoctorProfileForm(form);

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const buildPayload = () => ({
    fullName: form.fullName.trim(),
    gender: normalizeUpper(form.gender),
    specialization: form.specialization.trim(),
    qualifications: form.qualifications.trim(),
    experienceYears: Number(form.experienceYears),
    profilePictureUrl: String(form.profilePictureUrl || "").trim() || null,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      setServerError("");

      let profilePictureUrl = String(form.profilePictureUrl || "").trim();
      if (form.profilePictureFile) {
        const uploadedPictureUrl = await uploadProfilePicture(
          form.profilePictureFile,
        );
        profilePictureUrl = uploadedPictureUrl || profilePictureUrl;
      }

      const payload = {
        ...buildPayload(),
        profilePictureUrl: profilePictureUrl || null,
      };

      const response = isDoctorRole
        ? await updateMyDoctorProfile(payload)
        : doctorData
          ? await updateMyDoctorApplication(payload)
          : await submitDoctorUpgradeRequest(payload);

      setDoctorData(response?.data || null);
      setForm({
        ...mapDoctorDtoToForm(response?.data || {}),
        profilePictureFile: null,
      });
      setSuccessMessage(response?.message || "Doctor details saved.");
      notifyApiSuccess(response, "Doctor details saved.");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to save doctor details.",
      );
      setServerError(message);
      notifyError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;

      const nextError = (() => {
        switch (field) {
          case "fullName":
            return validateFullName(value, { requiredValue: true });
          case "gender":
            return validateGender(value, { requiredValue: true });
          case "specialization":
            return validateSpecialization(value, { requiredValue: true });
          case "qualifications":
            return validateQualifications(value, { requiredValue: true });
          case "experienceYears":
            return validateExperienceYears(value, { requiredValue: true });
          case "profilePictureFile": {
            const nextForm = { ...form, profilePictureFile: value };
            return validateDoctorProfileForm(nextForm).profilePictureFile;
          }
          default:
            return "";
        }
      })();

      return nextError
        ? { ...prev, [field]: nextError }
        : { ...prev, [field]: "" };
    });
  };

  return {
    form,
    errors,
    doctorData,
    isLoading,
    isSaving,
    serverError,
    successMessage,
    profilePicturePreviewUrl,
    isDoctorRole,
    handleSubmit,
    setField,
  };
}
