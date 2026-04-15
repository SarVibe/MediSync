const PHONE_REGEX = /^\+94\d{9}$/;
const OTP_REGEX = /^\d{6}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_COMPLEXITY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
const URL_REGEX = /^(https?:\/\/).+/i;
const FULL_NAME_REGEX =
  /^[A-Za-z]+(?:[.'-][A-Za-z]+)*\.?(?:\s+[A-Za-z]+(?:[.'-][A-Za-z]+)*\.?)*$/;
const SPECIALIZATION_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s&/().,'-]*[A-Za-z0-9)]$/;
const QUALIFICATIONS_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s&/().,+'-]*[A-Za-z0-9)]$/;
const PROFILE_PICTURE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const BLOOD_GROUP_ALLOWED = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
];

function required(value, label) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return `${label} is required.`;
  }
  return "";
}

export function validatePhone(phone) {
  const emptyError = required(phone, "Phone number");
  if (emptyError) return emptyError;
  if (!PHONE_REGEX.test(String(phone).trim())) {
    return "Phone must be in format +94XXXXXXXXX.";
  }
  return "";
}

export function validateOtp(otp) {
  const emptyError = required(otp, "OTP");
  if (emptyError) return emptyError;
  if (!OTP_REGEX.test(String(otp).trim())) {
    return "OTP must be exactly 6 numeric digits.";
  }
  return "";
}

export function validateEmail(email) {
  const emptyError = required(email, "Email");
  if (emptyError) return emptyError;
  if (!EMAIL_REGEX.test(String(email).trim())) {
    return "Invalid email format.";
  }
  return "";
}

export function validatePassword(
  password,
  { minLength = 8, enforceComplexity = false } = {},
) {
  const emptyError = required(password, "Password");
  if (emptyError) return emptyError;

  const input = String(password);
  if (input.length < minLength) {
    return `Password must be at least ${minLength} characters.`;
  }

  if (enforceComplexity && !PASSWORD_COMPLEXITY_REGEX.test(input)) {
    return "Password must contain uppercase, lowercase, number and special character.";
  }

  return "";
}

export function validateConfirmPassword(confirmPassword, password) {
  const emptyError = required(confirmPassword, "Confirm password");
  if (emptyError) return emptyError;
  if (confirmPassword !== password) {
    return "Password and confirm password do not match.";
  }
  return "";
}

export function validateName(name, label = "Name", min = 2, max = 120) {
  const emptyError = required(name, label);
  if (emptyError) return emptyError;
  const normalized = String(name).trim();
  if (normalized.length < min || normalized.length > max) {
    return `${label} must be between ${min} and ${max} characters.`;
  }
  return "";
}

export function validateFullName(value, { requiredValue = true } = {}) {
  if (
    !requiredValue &&
    (value === undefined || value === null || String(value).trim() === "")
  ) {
    return "";
  }

  const emptyError = required(value, "Full name");
  if (emptyError) return emptyError;

  const normalized = String(value).trim();
  if (normalized.length < 2 || normalized.length > 120) {
    return "Full name must be between 2 and 120 characters.";
  }

  if (!FULL_NAME_REGEX.test(normalized)) {
    return "Full name must contain only letters and valid separators (space, apostrophe, hyphen, dot).";
  }

  return "";
}

export function validateRole(role) {
  const emptyError = required(role, "Role");
  if (emptyError) return emptyError;
  const allowed = ["PATIENT", "DOCTOR", "ADMIN"];
  if (!allowed.includes(String(role).toUpperCase())) {
    return "Role must be PATIENT, DOCTOR, or ADMIN.";
  }
  return "";
}

export function validateUserId(userId) {
  if (userId === undefined || userId === null || userId === "") {
    return "User ID is required.";
  }
  const parsed = Number(userId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return "User ID must be a positive integer.";
  }
  return "";
}

export function validateReason(
  reason,
  { requiredValue = false, max = 500 } = {},
) {
  if (
    !requiredValue &&
    (reason === undefined || reason === null || String(reason).trim() === "")
  ) {
    return "";
  }
  const text = String(reason || "").trim();
  if (requiredValue && !text) {
    return "Reason is required.";
  }
  if (text.length > max) {
    return `Reason must be at most ${max} characters.`;
  }
  return "";
}

export function validateGender(gender, { requiredValue = true } = {}) {
  if (!gender || String(gender).trim() === "") {
    return requiredValue ? "Gender is required." : "";
  }
  const allowed = ["MALE", "FEMALE", "OTHER"];
  if (!allowed.includes(String(gender).toUpperCase())) {
    return "Gender must be MALE, FEMALE, or OTHER.";
  }
  return "";
}

export function validateBloodGroup(value, { requiredValue = false } = {}) {
  if (!value || String(value).trim() === "") {
    return requiredValue ? "Blood group is required." : "";
  }

  const normalized = String(value).trim().toUpperCase();
  if (!BLOOD_GROUP_ALLOWED.includes(normalized)) {
    return "Blood group must be one of A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE, AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE.";
  }

  return "";
}

export function validateExperienceYears(value, { requiredValue = false } = {}) {
  if (
    !requiredValue &&
    (value === undefined || value === null || value === "")
  ) {
    return "";
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return "Experience years must be an integer greater than or equal to 0.";
  }
  return "";
}

export function validateOptionalMaxLength(value, label, max) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "";
  }
  if (String(value).trim().length > max) {
    return `${label} must be at most ${max} characters.`;
  }
  return "";
}

export function validateProfilePictureUrl(url, { requiredValue = false } = {}) {
  if (
    !requiredValue &&
    (url === undefined || url === null || String(url).trim() === "")
  ) {
    return "";
  }
  const text = String(url || "").trim();
  if (requiredValue && !text) {
    return "Profile picture URL is required.";
  }
  if (text.length > 500) {
    return "Profile picture URL must be at most 500 characters.";
  }
  if (text && !URL_REGEX.test(text)) {
    return "Profile picture URL must start with http:// or https://.";
  }

  if (text) {
    try {
      const parsed = new URL(text);
      if (!parsed.hostname) {
        return "Profile picture URL must be a valid URL.";
      }
    } catch {
      return "Profile picture URL must be a valid URL.";
    }
  }

  return "";
}

export function validateProfilePictureFile(
  file,
  { requiredValue = false, maxSizeMB = 5 } = {},
) {
  if (!file) {
    return requiredValue ? "Profile picture is required." : "";
  }

  const fileType = String(file.type || "").toLowerCase();
  if (!PROFILE_PICTURE_ALLOWED_TYPES.includes(fileType)) {
    return "Only JPG, JPEG, and PNG images are allowed.";
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Profile picture must be ${maxSizeMB} MB or smaller.`;
  }

  return "";
}

export function validatePastDate(dateValue, label = "Date") {
  if (!dateValue) return "";
  const inputDate = new Date(dateValue);
  if (Number.isNaN(inputDate.getTime())) {
    return `${label} is invalid.`;
  }
  const now = new Date();
  if (inputDate >= now) {
    return `${label} must be in the past.`;
  }
  return "";
}

export function validateSpecialization(value, { requiredValue = false } = {}) {
  if (!requiredValue && (!value || !String(value).trim())) return "";

  const text = String(value || "").trim();
  if (!text) return "Specialization is required.";
  if (text.length < 2 || text.length > 120) {
    return "Specialization must be between 2 and 120 characters.";
  }
  if (!SPECIALIZATION_REGEX.test(text)) {
    return "Specialization contains invalid characters.";
  }

  return "";
}

export function validateQualifications(value, { requiredValue = false } = {}) {
  if (!requiredValue && (!value || !String(value).trim())) return "";

  const text = String(value || "").trim();
  if (!text) return "Qualifications is required.";
  if (text.length < 2 || text.length > 1000) {
    return "Qualifications must be between 2 and 1000 characters.";
  }
  if (!QUALIFICATIONS_REGEX.test(text)) {
    return "Qualifications contains invalid characters.";
  }

  return "";
}

export function validateDoctorUpgradeExperienceYears(value) {
  const emptyError = required(value, "Experience years");
  if (emptyError) return emptyError;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return "Experience years must be a positive number.";
  }

  return "";
}

export function validateDoctorUpgradeFullName(value) {
  const baseError = validateFullName(value, { requiredValue: true });
  if (baseError) return baseError;

  const normalized = String(value || "").trim();
  const nameWithoutPrefix = normalized.replace(/^dr\.\s*/i, "").trim();
  if (!nameWithoutPrefix) {
    return "Please enter your name after Dr.";
  }

  return "";
}

export function validateDoctorUpgradeRequestForm(form) {
  return {
    fullName: validateDoctorUpgradeRequestField("fullName", form),
    gender: validateDoctorUpgradeRequestField("gender", form),
    specialization: validateDoctorUpgradeRequestField("specialization", form),
    qualifications: validateDoctorUpgradeRequestField("qualifications", form),
    experienceYears: validateDoctorUpgradeRequestField("experienceYears", form),
    profilePictureFile: validateDoctorUpgradeRequestField(
      "profilePictureFile",
      form,
    ),
  };
}

export function validateDoctorUpgradeRequestField(
  field,
  form,
  { requireProfilePicture } = {},
) {
  const hasExisting = Boolean(String(form?.profilePictureUrl || "").trim());

  switch (field) {
    case "fullName":
      return validateDoctorUpgradeFullName(form?.fullName);
    case "gender":
      return validateGender(form?.gender, { requiredValue: true });
    case "specialization":
      return validateSpecialization(form?.specialization, {
        requiredValue: true,
      });
    case "qualifications":
      return validateQualifications(form?.qualifications, { requiredValue: true });
    case "experienceYears":
      return validateDoctorUpgradeExperienceYears(form?.experienceYears);
    case "profilePictureFile":
      return validateProfilePictureFile(form?.profilePictureFile, {
        requiredValue:
          requireProfilePicture === undefined
            ? !hasExisting
            : Boolean(requireProfilePicture),
        maxSizeMB: 5,
      });
    default:
      return "";
  }
}

export function validatePatientProfileForm(
  form,
  { requireProfilePicture } = {},
) {
  return {
    fullName: validatePatientProfileField("fullName", form),
    address: validatePatientProfileField("address", form),
    bloodGroup: validatePatientProfileField("bloodGroup", form),
    gender: validatePatientProfileField("gender", form),
    dob: validatePatientProfileField("dob", form),
    profilePictureFile: validatePatientProfileField("profilePictureFile", form, {
      requireProfilePicture,
    }),
    basicHealthInfo: validatePatientProfileField("basicHealthInfo", form),
  };
}

export function validatePatientProfileField(
  field,
  form,
  { requireProfilePicture } = {},
) {
  const hasExisting = Boolean(String(form?.profilePictureUrl || "").trim());

  switch (field) {
    case "fullName":
      return validateFullName(form?.fullName, { requiredValue: true });
    case "address":
      return validateOptionalMaxLength(form?.address, "Address", 500);
    case "bloodGroup":
      return validateBloodGroup(form?.bloodGroup, { requiredValue: false });
    case "gender":
      return validateGender(form?.gender, { requiredValue: false });
    case "dob": {
      const empty = required(form?.dob, "Date of birth");
      if (empty) return empty;
      return validatePastDate(form?.dob, "Date of birth");
    }
    case "profilePictureFile":
      return validateProfilePictureFile(form?.profilePictureFile, {
        requiredValue:
          requireProfilePicture === undefined
            ? !hasExisting
            : Boolean(requireProfilePicture),
        maxSizeMB: 5,
      });
    case "basicHealthInfo":
      return validateOptionalMaxLength(
        form?.basicHealthInfo,
        "Basic health info",
        2000,
      );
    default:
      return "";
  }
}

export function validateDoctorProfileField(
  field,
  form,
  { requireProfilePicture } = {},
) {
  const hasExisting = Boolean(String(form?.profilePictureUrl || "").trim());

  switch (field) {
    case "fullName":
      return validateFullName(form?.fullName, { requiredValue: true });
    case "gender":
      return validateGender(form?.gender, { requiredValue: true });
    case "specialization":
      return validateSpecialization(form?.specialization, {
        requiredValue: true,
      });
    case "qualifications":
      return validateQualifications(form?.qualifications, { requiredValue: true });
    case "experienceYears":
      return validateExperienceYears(form?.experienceYears, {
        requiredValue: true,
      });
    case "profilePictureFile":
      return validateProfilePictureFile(form?.profilePictureFile, {
        requiredValue:
          requireProfilePicture === undefined
            ? !hasExisting
            : Boolean(requireProfilePicture),
        maxSizeMB: 5,
      });
    default:
      return "";
  }
}

export function validateDoctorProfileForm(
  form,
  { requireProfilePicture } = {},
) {
  return {
    fullName: validateDoctorProfileField("fullName", form),
    gender: validateDoctorProfileField("gender", form),
    specialization: validateDoctorProfileField("specialization", form),
    qualifications: validateDoctorProfileField("qualifications", form),
    experienceYears: validateDoctorProfileField("experienceYears", form),
    profilePictureFile: validateDoctorProfileField("profilePictureFile", form, {
      requireProfilePicture,
    }),
  };
}

export function normalizeUpper(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}
