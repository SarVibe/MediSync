import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  adminLogin,
  adminVerify2FA,
  authenticateWithPhone,
  changeAdminPassword,
  forgotAdminPassword,
  logoutSession,
  refreshSession,
  resetAdminPassword,
  verifyPhoneOtp,
} from "../services/authService";
import {
  clearSessionStore,
  getCurrentUser,
  setAccessToken,
  setCurrentUser,
} from "../../../app/sessionStore";

export const AuthContext = createContext(null);

function normalizeRole(role) {
  return String(role || "").toUpperCase();
}

export function getHomeRouteFromRole(role) {
  switch (normalizeRole(role)) {
    case "ADMIN":
      return "/admin/appointments";
    case "DOCTOR":
      return "/doctor/appointments";
    case "PATIENT":
      return "/patient/appointments";
    default:
      return "/auth/login";
  }
}

export function resolvePostLoginRoute({ role } = {}) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "PATIENT" || normalizedRole === "DOCTOR") {
    return "/";
  }

  if (normalizedRole === "ADMIN") {
    return "/";
  }

  return "/auth/login";
}

function parseAuthPayload(apiResponse) {
  const payload = apiResponse?.data || {};
  const role = payload?.role || payload?.user?.role || null;
  const token = payload?.accessToken || payload?.token || null;

  const isProfileCompleted =
    payload?.isProfileCompleted ?? payload?.user?.isProfileCompleted ?? false;

  const approval_status =
    payload?.approval_status ??
    payload?.user?.approval_status ??
    payload?.approvalStatus ??
    payload?.user?.approvalStatus ??
    null;

  const status = payload?.status ?? payload?.user?.status ?? null;

  const baseUser = payload?.user ? payload.user : role ? { role } : null;
  const user = baseUser
    ? {
        ...baseUser,
        role: baseUser?.role ?? role,
        isProfileCompleted: baseUser?.isProfileCompleted ?? isProfileCompleted,
        approval_status: baseUser?.approval_status ?? approval_status,
        status: baseUser?.status ?? status,
      }
    : null;

  return {
    accessToken: token,
    user,
    isNewUser: payload?.isNewUser ?? false,
    role,
    message: apiResponse?.message || "",
  };
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(null);
  const [user, setUserState] = useState(getCurrentUser());
  const [isHydrating, setIsHydrating] = useState(true);
  const hasBootstrappedRef = useRef(false);

  const applySession = useCallback((token, nextUser) => {
    setAccessToken(token);
    setCurrentUser(nextUser || null);
    setAccessTokenState(token || null);
    setUserState(nextUser || null);
  }, []);

  const clearSession = useCallback(() => {
    clearSessionStore();
    setAccessTokenState(null);
    setUserState(null);
  }, []);

  const bootstrapSession = useCallback(async () => {
    try {
      const response = await refreshSession();
      const parsed = parseAuthPayload(response);
      if (parsed.accessToken) {
        applySession(parsed.accessToken, parsed.user);
      } else {
        clearSession();
      }
    } catch {
      clearSession();
    } finally {
      setIsHydrating(false);
    }
  }, [applySession, clearSession]);

  const refreshAuthSession = useCallback(async () => {
    const response = await refreshSession();
    const parsed = parseAuthPayload(response);
    if (parsed.accessToken) {
      applySession(parsed.accessToken, parsed.user);
    } else {
      clearSession();
    }
    return parsed;
  }, [applySession, clearSession]);

  useEffect(() => {
    // Prevent duplicate refresh calls in React StrictMode (dev double-invocation).
    if (hasBootstrappedRef.current) {
      return;
    }
    hasBootstrappedRef.current = true;

    bootstrapSession();
  }, [bootstrapSession]);

  const phoneAuthenticate = useCallback(async (phone) => {
    return authenticateWithPhone(phone);
  }, []);

  const verifyPhoneLoginOtp = useCallback(
    async (phone, otp) => {
      const response = await verifyPhoneOtp(phone, otp);
      const parsed = parseAuthPayload(response);
      applySession(parsed.accessToken, parsed.user);
      return response;
    },
    [applySession],
  );

  const loginAdmin = useCallback(async (email, password) => {
    return adminLogin(email, password);
  }, []);

  const verifyAdminSecondFactor = useCallback(
    async (challengeToken, otp) => {
      const response = await adminVerify2FA(challengeToken, otp);
      const parsed = parseAuthPayload(response);
      applySession(parsed.accessToken, parsed.user);
      return response;
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await logoutSession();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const changePassword = useCallback(async (payload) => {
    return changeAdminPassword(payload);
  }, []);

  const requestForgotPasswordOtp = useCallback(async (email) => {
    return forgotAdminPassword(email);
  }, []);

  const resetPassword = useCallback(async (payload) => {
    return resetAdminPassword(payload);
  }, []);

  const contextValue = useMemo(
    () => ({
      accessToken,
      user,
      isHydrating,
      isAuthenticated: Boolean(accessToken),
      phoneAuthenticate,
      verifyPhoneLoginOtp,
      loginAdmin,
      verifyAdminSecondFactor,
      logout,
      changePassword,
      requestForgotPasswordOtp,
      resetPassword,
      clearSession,
      getHomeRouteFromRole,
      resolvePostLoginRoute,
      refreshAuthSession,
    }),
    [
      accessToken,
      user,
      isHydrating,
      phoneAuthenticate,
      verifyPhoneLoginOtp,
      loginAdmin,
      verifyAdminSecondFactor,
      logout,
      changePassword,
      requestForgotPasswordOtp,
      resetPassword,
      clearSession,
      refreshAuthSession,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}
