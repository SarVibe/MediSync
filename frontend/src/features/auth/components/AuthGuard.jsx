import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RestoringSession from "../../../components/common/RestoringSession";
function roleAllowed(userRole, allowedRoles) {
  const normalizedRole = String(userRole || "").toUpperCase();

  if (!allowedRoles || allowedRoles.length === 0) {
    return Boolean(normalizedRole);
  }

  return allowedRoles.includes(normalizedRole);
}

const PROFILE_ROUTE = "/profile";
const PATIENT_PROFILE_ROUTE = "/patient/profile";
const DOCTOR_PROFILE_ROUTE = "/doctor/profile";
const REQUEST_PENDING_ROUTE = "/request-pending";
const UPGRADE_REQUEST_ROUTE = "/upgrade-request";
const UNAUTHORIZED_ROUTE = "/unauthorized";
const ROOT_ROUTE = "/";
const ADMIN_HOME_ROUTE = "/admin/appointments";
const PATIENT_HOME_ROUTE = "/patient/appointments";
const DOCTOR_HOME_ROUTE = "/doctor/appointments";

export default function AuthGuard({ children, allowedRoles = [] }) {
  const { isAuthenticated, isHydrating, user } = useAuth();
  const location = useLocation();

  if (isHydrating) {
    return <RestoringSession />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  if (!user?.role) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!roleAllowed(user?.role, allowedRoles)) {
    return <Navigate to="/auth/login" replace />;
  }

  const userRole = String(user?.role || "").toUpperCase();
  const isProfileCompleted = user?.isProfileCompleted;
  const approvalStatus = String(user?.approval_status || "").toUpperCase();
  const profileRoute =
    userRole === "DOCTOR"
      ? DOCTOR_PROFILE_ROUTE
      : userRole === "PATIENT"
        ? PATIENT_PROFILE_ROUTE
        : PROFILE_ROUTE;
  const shouldEnforceProfileCompletion =
    isProfileCompleted === false &&
    !(userRole === "DOCTOR" && approvalStatus === "APPROVED");

  // Mandatory enforcement (profile completion first).
  if (
    (userRole === "PATIENT" || userRole === "DOCTOR") &&
    shouldEnforceProfileCompletion
  ) {
    if (location.pathname !== profileRoute && location.pathname !== PROFILE_ROUTE) {
      return <Navigate to={profileRoute} replace />;
    }
    return children;
  }

  // Patient gating: doctor request must be resolved (pending/rejected).
  if (userRole === "PATIENT") {
    if (
      approvalStatus === "PENDING" &&
      location.pathname !== REQUEST_PENDING_ROUTE
    ) {
      return <Navigate to={REQUEST_PENDING_ROUTE} replace />;
    }

    if (
      approvalStatus === "REJECTED" &&
      location.pathname !== UPGRADE_REQUEST_ROUTE
    ) {
      return <Navigate to={UPGRADE_REQUEST_ROUTE} replace />;
    }
  }

  // Doctor gating: doctor account requires approval.
  if (userRole === "DOCTOR" && approvalStatus !== "APPROVED") {
    if (location.pathname !== UNAUTHORIZED_ROUTE) {
      return <Navigate to={UNAUTHORIZED_ROUTE} replace />;
    }
  }

  // Neutral post-login route is resolved here.
  if (location.pathname === ROOT_ROUTE) {
    if (userRole === "ADMIN") {
      return <Navigate to={ADMIN_HOME_ROUTE} replace />;
    }
    if (userRole === "DOCTOR") {
      return <Navigate to={DOCTOR_HOME_ROUTE} replace />;
    }
    if (userRole === "PATIENT") {
      return <Navigate to={PATIENT_HOME_ROUTE} replace />;
    }
  }

  return children;
}
