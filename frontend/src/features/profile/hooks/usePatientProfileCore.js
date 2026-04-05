import { useCallback, useEffect, useState } from "react";
import {
  deleteMyPatientProfile,
  initProfile,
  uploadProfilePicture,
  upsertMyPatientProfile,
} from "../services/profileService";
import {
  validatePatientProfileForm,
  validateOptionalMaxLength,
  validatePastDate,
  validateFullName,
  validateGender,
  validateBloodGroup,
} from "../../../utils/validation";
import { getApiErrorMessage } from "../../../utils/api";
import { notifyApiSuccess, notifyError } from "../../../utils/toast";

const EMPTY_FORM = {
  fullName: "",
  address: "",
  bloodGroup: "",
  gender: "",
  dob: "",
  profilePictureUrl: "",
  profilePictureFile: null,
  basicHealthInfo: "",
};

export default function usePatientProfileCoreController({
  user,
  refreshAuthSession,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [profileMeta, setProfileMeta] = useState(null);
  const [profilePicturePreviewUrl, setProfilePicturePreviewUrl] = useState("");

  useEffect(() => {
    if (!form.profilePictureFile) {
      setProfilePicturePreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(form.profilePictureFile);
    setProfilePicturePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.profilePictureFile]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(""), 7000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const hydrateProfile = useCallback((profileData) => {
    if (!profileData) {
      setProfileMeta(null);
      setForm(EMPTY_FORM);
      return;
    }

    setProfileMeta(profileData);
    setForm({
      fullName: profileData?.fullName || "",
      address: profileData?.address || "",
      bloodGroup: profileData?.bloodGroup || "",
      gender: profileData?.gender || "",
      dob: profileData?.dob || "",
      profilePictureUrl: profileData?.profilePictureUrl || "",
      profilePictureFile: null,
      basicHealthInfo: profileData?.basicHealthInfo || "",
    });
  }, []);

  const updateField = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const nextError = (() => {
        switch (name) {
          case "fullName":
            return validateFullName(value, { requiredValue: true });
          case "address":
            return validateOptionalMaxLength(value, "Address", 500);
          case "bloodGroup":
            return validateBloodGroup(value, { requiredValue: false });
          case "gender":
            return validateGender(value, { requiredValue: false });
          case "dob":
            if (!String(value || "").trim())
              return "Date of birth is required.";
            return validatePastDate(value, "Date of birth");
          case "basicHealthInfo":
            return validateOptionalMaxLength(value, "Basic health info", 2000);
          default:
            return "";
        }
      })();
      return { ...prev, [name]: nextError || "" };
    });
    setServerError("");
    setSuccessMessage("");
  }, []);

  const validateForm = useCallback(() => {
    const nextErrors = validatePatientProfileForm(form);

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  }, [form]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!validateForm()) return;

      try {
        setIsSaving(true);
        setServerError("");

        if (!profileMeta) {
          await initProfile({
            userId: user.id,
            name: user.name,
            role: user.role,
          });
        }

        let pictureUrl = String(form.profilePictureUrl || "").trim();
        if (form.profilePictureFile) {
          const uploaded = await uploadProfilePicture(form.profilePictureFile);
          pictureUrl = uploaded || pictureUrl;
        }

        const payload = {
          fullName: form.fullName || null,
          address: form.address || null,
          bloodGroup: form.bloodGroup || null,
          gender: form.gender || null,
          dob: form.dob || null,
          profilePictureUrl: pictureUrl || null,
          basicHealthInfo: form.basicHealthInfo || null,
        };

        const response = await upsertMyPatientProfile(payload);
        hydrateProfile(response?.data || null);
        setSuccessMessage(response?.message || "Profile updated.");
        notifyApiSuccess(response, "Profile updated.");
        await refreshAuthSession();
      } catch (error) {
        const msg = getApiErrorMessage(
          error,
          "Unable to update patient profile.",
        );
        setServerError(msg);
        notifyError(msg);
      } finally {
        setIsSaving(false);
      }
    },
    [form, hydrateProfile, profileMeta, refreshAuthSession, user, validateForm],
  );

  const handleDeleteProfile = useCallback(async () => {
    try {
      setIsDeleting(true);
      setServerError("");
      const response = await deleteMyPatientProfile();
      hydrateProfile(null);
      setErrors({});
      setSuccessMessage(response?.message || "Patient profile deleted.");
      notifyApiSuccess(response, "Patient profile deleted.");

      try {
        await refreshAuthSession();
      } catch {
        // Let route guards handle invalidated sessions.
      }
    } catch (error) {
      const msg = getApiErrorMessage(
        error,
        "Unable to delete patient profile.",
      );
      setServerError(msg);
      notifyError(msg);
    } finally {
      setIsDeleting(false);
    }
  }, [hydrateProfile, refreshAuthSession]);

  return {
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
    handleSubmit,
    handleDeleteProfile,
    setServerError,
    setSuccessMessage,
  };
}
