export const SYMPTOM_CHECKER_SEVERITY_VALUES = ["mild", "moderate", "severe"];

const CUSTOM_SYMPTOM_PATTERN = /^[a-z][a-z0-9\s'-]*$/i;

export const EMPTY_SYMPTOM_CHECKER_ERRORS = {
  symptoms: "",
  customSymptom: "",
  severity: "",
  durationDays: "",
};

export function normalizeSymptomValue(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function validateSymptoms(symptoms) {
  if (!Array.isArray(symptoms) || symptoms.length === 0) {
    return "Select at least one symptom.";
  }

  const normalizedSymptoms = symptoms.map(normalizeSymptomValue).filter(Boolean);

  if (normalizedSymptoms.length !== symptoms.length) {
    return "Each selected symptom must be valid.";
  }

  if (new Set(normalizedSymptoms).size !== normalizedSymptoms.length) {
    return "Each symptom can only be added once.";
  }

  return "";
}

export function validateCustomSymptom(
  value,
  { selectedSymptoms = [], required = false } = {},
) {
  const normalizedValue = normalizeSymptomValue(value);

  if (!normalizedValue) {
    return required ? "Enter a symptom before adding it." : "";
  }

  if (normalizedValue.length < 2) {
    return "Symptom must be at least 2 characters long.";
  }

  if (normalizedValue.length > 60) {
    return "Symptom must be 60 characters or fewer.";
  }

  if (!CUSTOM_SYMPTOM_PATTERN.test(normalizedValue)) {
    return "Use letters, numbers, spaces, apostrophes, or hyphens only.";
  }

  const normalizedSelectedSymptoms = selectedSymptoms.map(normalizeSymptomValue);

  if (normalizedSelectedSymptoms.includes(normalizedValue)) {
    return "This symptom is already added.";
  }

  return "";
}

export function validateSeverity(value) {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase();

  if (!normalizedValue) {
    return "Severity is required.";
  }

  if (!SYMPTOM_CHECKER_SEVERITY_VALUES.includes(normalizedValue)) {
    return "Select a valid severity level.";
  }

  return "";
}

export function validateDurationDays(value) {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "Duration is required.";
  }

  if (!/^\d+$/.test(normalizedValue)) {
    return "Duration must be a whole number.";
  }

  const parsedValue = Number(normalizedValue);

  if (parsedValue < 1 || parsedValue > 365) {
    return "Duration must be between 1 and 365 days.";
  }

  return "";
}

export function validateSymptomCheckerForm({
  symptoms,
  customSymptom,
  severity,
  durationDays,
}) {
  const errors = {
    symptoms: validateSymptoms(symptoms),
    customSymptom: validateCustomSymptom(customSymptom, {
      selectedSymptoms: symptoms,
    }),
    severity: validateSeverity(severity),
    durationDays: validateDurationDays(durationDays),
  };

  return {
    errors,
    isValid: Object.values(errors).every((error) => !error),
  };
}
