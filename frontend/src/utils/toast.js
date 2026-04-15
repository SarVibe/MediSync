import toast from "react-hot-toast";
import { getApiErrorMessage } from "./api";

const BASE_OPTIONS = {
  duration: 3500,
};

export function notifySuccess(message, options = {}) {
  const text = String(message || "").trim();
  if (!text) return;
  toast.success(text, { ...BASE_OPTIONS, ...options });
}

export function notifyInfo(message, options = {}) {
  const text = String(message || "").trim();
  if (!text) return;
  toast(text, { ...BASE_OPTIONS, ...options });
}

export function notifyWarning(message, options = {}) {
  const text = String(message || "").trim();
  if (!text) return;
  toast(text, { icon: "⚠️", ...BASE_OPTIONS, ...options });
}

export function notifyError(errorOrMessage, fallbackMessage, options = {}) {
  const text =
    typeof errorOrMessage === "string"
      ? errorOrMessage
      : getApiErrorMessage(errorOrMessage, fallbackMessage);

  const finalMessage = String(
    text || fallbackMessage || "Something went wrong.",
  ).trim();

  if (!finalMessage) return;
  toast.error(finalMessage, { ...BASE_OPTIONS, ...options });
}

export function notifyApiSuccess(response, fallbackMessage, options = {}) {
  const message = response?.message || fallbackMessage;
  notifySuccess(message, options);
}
