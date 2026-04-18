function normalizeRole(role) {
  return String(role || "").toUpperCase();
}

function normalizeApprovalStatus(status) {
  return String(status || "").toUpperCase();
}

function normalizeOptionalBoolean(value) {
  return typeof value === "boolean" ? value : null;
}

export function getHomeRouteFromRole(role) {
  switch (normalizeRole(role)) {
    case "ADMIN":
      return "/admin/appointments";
    case "DOCTOR":
      return "/doctor/dashboard";
    case "PATIENT":
      return "/patient/doctors";
    default:
      return "/auth/login";
  }
}

export function resolvePostLoginRoute({
  isNewUser = false,
  role,
  isProfileCompleted,
  approval_status,
} = {}) {
  const normalizedRole = normalizeRole(role);
  const normalizedApprovalStatus = normalizeApprovalStatus(approval_status);
  const hasCompletedProfile = normalizeOptionalBoolean(isProfileCompleted);

  if (normalizedRole === "PATIENT") {
    if (isNewUser || hasCompletedProfile === false) {
      return "/patient/profile";
    }

    if (normalizedApprovalStatus === "PENDING") {
      return "/request-pending";
    }

    if (normalizedApprovalStatus === "REJECTED") {
      return "/upgrade-request";
    }

    return getHomeRouteFromRole(normalizedRole);
  }

  if (normalizedRole === "DOCTOR") {
    if (normalizedApprovalStatus === "APPROVED") {
      return getHomeRouteFromRole(normalizedRole);
    }

    if (isNewUser || hasCompletedProfile === false) {
      return "/doctor/profile";
    }

    if (normalizedApprovalStatus && normalizedApprovalStatus !== "APPROVED") {
      return "/unauthorized";
    }

    return getHomeRouteFromRole(normalizedRole);
  }

  if (normalizedRole === "ADMIN") {
    return getHomeRouteFromRole(normalizedRole);
  }

  return "/auth/login";
}

export {
  normalizeRole,
  normalizeApprovalStatus,
  normalizeOptionalBoolean,
};