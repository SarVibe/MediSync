/* eslint-disable no-unused-vars */
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  BotMessageSquare,
  Calendar,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Pill,
  RefreshCw,
  Stethoscope,
  User,
  Users,
  X,
} from "lucide-react";
import NotificationDropdown from "../../features/notifications/components/NotificationDropdown";
import { useOptionalAuth } from "../../features/auth/context/AuthContext";
import { notifyError, notifySuccess } from "../../utils/toast";

const ROLE_NAV_LINKS = {
  PATIENT: [
    { to: "/patient/doctors", label: "Home", icon: Activity },
    { to: "/patient/appointments", label: "Appointments", icon: Calendar },
    { to: "/patient/records", label: "Medical Records", icon: ClipboardList },
    { to: "/patient/prescriptions", label: "Prescriptions", icon: Pill },
    { to: "/patient/symptom-checker", label: "AI Symptom Checker", icon: BotMessageSquare },
  ],
  DOCTOR: [
    { to: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/doctor/appointments", label: "Appointments", icon: Calendar },
    { to: "/doctor/availability", label: "Availability", icon: Activity },
    { to: "/doctor/patient-records", label: "Patients", icon: Stethoscope },
    {
      to: "/doctor/prescriptions",
      label: "Prescriptions",
      icon: ClipboardList,
    },
  ],
  ADMIN: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/payments", label: "Reports", icon: CreditCard },
  ],
};

const ROLE_HOME_LINK = {
  PATIENT: "/patient/doctors",
  DOCTOR: "/doctor/dashboard",
  ADMIN: "/admin/dashboard",
};

const ROLE_PROFILE_LINK = {
  PATIENT: { to: "/patient/profile", label: "Profile" },
  DOCTOR: { to: "/doctor/profile", label: "Profile" },
  ADMIN: { to: "/admin/profile", label: "Profile" },
};

const ROLE_PORTAL_LABEL = {
  PATIENT: "Patient Portal",
  DOCTOR: "Doctor Portal",
  ADMIN: "Admin Portal",
};

function normalizeRole(role) {
  return String(role || "").toUpperCase();
}

function getRoleConfig(role) {
  const normalizedRole = normalizeRole(role);

  return {
    role: normalizedRole,
    navLinks: ROLE_NAV_LINKS[normalizedRole] || [],
    homePath: ROLE_HOME_LINK[normalizedRole] || "/auth/login",
    profileLink: ROLE_PROFILE_LINK[normalizedRole] || null,
    portalLabel: ROLE_PORTAL_LABEL[normalizedRole] || "Portal",
  };
}

function getUserDisplayName(user) {
  return user?.name || user?.fullName || "User";
}

function getUserInitials(user) {
  const displayName = getUserDisplayName(user);
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";
}

const desktopLinkClass = ({ isActive }) =>
  [
    "group relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    isActive
      ? "text-blue-600"
      : "text-slate-600 hover:text-blue-600",
  ].join(" ");

const ActiveIndicator = memo(function ActiveIndicator({ isActive }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "absolute bottom-0 left-0 h-0.5 rounded-full bg-blue-500 transition-all duration-300",
        isActive
          ? "w-full opacity-100"
          : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100",
      ].join(" ")}
    />
  );
});

const HeaderSkeleton = memo(function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b backdrop-blur-md border-slate-200 bg-white/90 sm:h-18">
      <div className="flex justify-between items-center px-4 mx-auto max-w-7xl h-full sm:px-6 lg:px-8">
        <div className="w-36 h-10 rounded-xl animate-pulse bg-slate-200" />

        <div className="hidden gap-3 items-center md:flex">
          <div className="w-24 h-9 rounded-xl animate-pulse bg-slate-200" />
          <div className="w-28 h-9 rounded-xl animate-pulse bg-slate-200" />
          <div className="w-32 h-9 rounded-xl animate-pulse bg-slate-200" />
          <div className="w-24 h-9 rounded-xl animate-pulse bg-slate-200" />
        </div>

        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-2xl animate-pulse bg-slate-200" />
          <div className="w-10 h-10 rounded-full animate-pulse bg-slate-200" />
        </div>
      </div>
    </header>
  );
});

const HeaderStateBanner = memo(function HeaderStateBanner({
  type = "empty",
  title,
  description,
  action,
}) {
  const isError = type === "error";

  return (
    <div
      className={[
        "border-b px-4 py-3 text-sm",
        isError
          ? "border-red-100 bg-red-50 text-red-700"
          : "border-slate-100 bg-slate-50 text-slate-700",
      ].join(" ")}
      role={isError ? "alert" : "status"}
    >
      <div className="flex gap-3 items-start mx-auto max-w-7xl sm:px-2">
        <div
          className={[
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
            isError ? "bg-red-100" : "bg-slate-100",
          ].join(" ")}
        >
          {isError ? (
            <AlertCircle size={16} aria-hidden="true" />
          ) : (
            <User size={16} aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold">{title}</p>
          {description ? <p className="mt-0.5 text-xs">{description}</p> : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
});

const DesktopNavItem = memo(function DesktopNavItem({ to, label }) {
  return (
    <NavLink to={to} className={desktopLinkClass}>
      {({ isActive }) => (
        <span className="block relative">
          {label}
          <ActiveIndicator isActive={isActive} />
        </span>
      )}
    </NavLink>
  );
});

const MobileNavItem = memo(function MobileNavItem({
  to,
  label,
  icon: Icon,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer",
          isActive
            ? "bg-blue-50 text-blue-600 shadow-sm"
            : "text-slate-700 hover:bg-blue-50 hover:text-blue-600",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
              isActive
                ? "bg-blue-100 text-blue-600"
                : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700",
            ].join(" ")}
          >
            <Icon size={16} aria-hidden="true" />
          </span>
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
});

const ProfileDropdown = memo(function ProfileDropdown({
  user,
  profileLink,
  onLogout,
  onClose,
}) {
  const displayName = useMemo(() => getUserDisplayName(user), [user]);
  const initials = useMemo(() => getUserInitials(user), [user]);
  const roleLabel = useMemo(() => normalizeRole(user?.role) || "USER", [user]);

  return (
    <div
      id="profile-dropdown"
      className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]"
    >
      <div className="px-4 py-4 from-blue-50 via-white to-white border-b border-slate-100 bg-linear-to-br">
        <div className="flex gap-3 items-center">
          <div className="flex justify-center items-center w-11 h-11 text-sm font-bold text-white bg-blue-600 rounded-2xl shadow-md shadow-blue-100">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-slate-900">
              {displayName}
            </p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              {roleLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="p-2">
        {profileLink ? (
          <Link
            to={profileLink.to}
            onClick={onClose}
            className="flex gap-3 items-center px-3 py-3 w-full text-sm font-medium rounded-2xl transition-all duration-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <span className="flex justify-center items-center w-9 h-9 rounded-xl bg-slate-100 text-slate-500">
              <User size={16} aria-hidden="true" />
            </span>
            <span>{profileLink.label}</span>
          </Link>
        ) : null}

        <button
          type="button"
          onClick={onLogout}
          className="flex gap-3 items-center px-3 py-3 w-full text-sm font-medium text-red-600 rounded-2xl transition-all duration-200 cursor-pointer hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          <span className="flex justify-center items-center w-9 h-9 text-red-500 bg-red-50 rounded-xl">
            <LogOut size={16} aria-hidden="true" />
          </span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
});

const MobileDrawer = memo(function MobileDrawer({
  open,
  onClose,
  navLinks,
  homePath,
  portalLabel,
  user,
  profileLink,
  onLogout,
}) {
  const drawerRef = useRef(null);
  const location = useLocation();
  const displayName = useMemo(() => getUserDisplayName(user), [user]);
  const initials = useMemo(() => getUserInitials(user), [user]);

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const panel = drawerRef.current;
    const focusable = panel?.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );

    focusable?.[0]?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm transition-all duration-300 md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        ref={drawerRef}
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={[
          "fixed inset-y-0 right-0 z-50 flex w-[88vw] max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex gap-3 justify-between items-center">
            <Link
              to={homePath}
              onClick={onClose}
              className="flex gap-3 items-center rounded-xl group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label={`MediSync home - ${portalLabel}`}
            >
              <div className="flex overflow-hidden justify-center items-center w-11 h-11 rounded-2xl shadow-lg transition duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <img
                  src="/MediSync_Logo_3.png"
                  alt="MediSync logo"
                  className="object-cover w-full h-full"
                />
              </div>
            </Link>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="flex justify-center items-center w-10 h-10 rounded-xl border transition-colors duration-200 cursor-pointer border-slate-200 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="flex gap-3 items-center p-3 mt-5 rounded-3xl bg-slate-50">
            <div className="flex justify-center items-center w-12 h-12 text-sm font-bold text-white bg-blue-600 rounded-2xl shadow-md shadow-blue-100">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-slate-900">
                {displayName}
              </p>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-500">
                {portalLabel}
              </p>
            </div>
          </div>
        </div>

        <nav
          className="overflow-y-auto flex-1 px-3 py-4 space-y-1"
          aria-label="Drawer navigation"
        >
          {navLinks.map((item) => (
            <MobileNavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              onClick={onClose}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100">
          {profileLink ? (
            <Link
              to={profileLink.to}
              onClick={onClose}
              className="flex gap-3 items-center px-4 py-3 mb-2 text-sm font-medium rounded-2xl transition-all duration-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <span className="flex justify-center items-center w-9 h-9 rounded-xl bg-slate-100 text-slate-500">
                <User size={16} aria-hidden="true" />
              </span>
              <span>{profileLink.label}</span>
            </Link>
          ) : null}

          <button
            type="button"
            onClick={onLogout}
            className="flex gap-3 items-center px-4 py-3 w-full text-sm font-medium text-red-600 rounded-2xl transition-all duration-200 cursor-pointer hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <span className="flex justify-center items-center w-9 h-9 text-red-500 bg-red-50 rounded-xl">
              <LogOut size={16} aria-hidden="true" />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
});

const Header = () => {
  const auth = useOptionalAuth() || {};
  const {
    user,
    logout,
    isLoading = false,
    error = null,
    refetchUser,
  } = auth;

  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef(null);

  const roleConfig = useMemo(() => getRoleConfig(user?.role), [user?.role]);
  const navLinks = roleConfig.navLinks;
  const homePath = roleConfig.homePath;
  const profileLink = roleConfig.profileLink;
  const portalLabel = roleConfig.portalLabel;

  const displayName = useMemo(() => getUserDisplayName(user), [user]);
  const initials = useMemo(() => getUserInitials(user), [user]);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);
  const toggleProfile = useCallback(
    () => setProfileOpen((previous) => !previous),
    []
  );

  useEffect(() => {
    closeDrawer();
    closeProfile();
  }, [location.pathname, closeDrawer, closeProfile]);

  useEffect(() => {
    if (!profileOpen) return undefined;

    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        closeProfile();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeProfile();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileOpen, closeProfile]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout?.();
      notifySuccess("Logged out successfully.");
    } catch (logoutError) {
      notifyError(logoutError, "Failed to log out cleanly.");
    } finally {
      closeProfile();
      closeDrawer();
      navigate("/auth/login", { replace: true });
    }
  }, [logout, navigate, closeDrawer, closeProfile]);

  const handleRetry = useCallback(() => {
    if (typeof refetchUser === "function") {
      refetchUser();
      return;
    }
    window.location.reload();
  }, [refetchUser]);

  if (isLoading) {
    return <HeaderSkeleton />;
  }

  if (error) {
    return (
      <>
        <header className="sticky top-0 z-40 h-16 border-b backdrop-blur-md border-slate-200 bg-white/90 sm:h-18">
          <div className="flex justify-between items-center px-4 mx-auto max-w-7xl h-full sm:px-6 lg:px-8">
            <Link
              to="/auth/login"
              className="flex gap-3 items-center rounded-xl group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label="Go to login"
            >
              <div className="flex overflow-hidden justify-center items-center w-11 h-11 rounded-2xl shadow-lg transition duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <img
                  src="/MediSync_Logo_3.png"
                  alt="MediSync logo"
                  className="object-cover w-full h-full"
                />
              </div>
            </Link>
          </div>
        </header>

        <HeaderStateBanner
          type="error"
          title="Unable to load account information."
          description="Refresh and try again. If this keeps happening, your auth state is probably broken."
          action={
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex gap-2 items-center px-3 py-2 text-xs font-semibold text-red-600 bg-white rounded-xl ring-1 ring-red-200 shadow-sm transition-all duration-200 cursor-pointer hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Retry
            </button>
          }
        />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <header className="sticky top-0 z-40 h-16 border-b backdrop-blur-md border-slate-200 bg-white/90 sm:h-18">
          <div className="flex justify-between items-center px-4 mx-auto max-w-7xl h-full sm:px-6 lg:px-8">
            <Link
              to="/auth/login"
              className="flex gap-3 items-center rounded-xl group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label="Go to login"
            >
              <div className="flex overflow-hidden justify-center items-center w-11 h-11 rounded-2xl shadow-lg transition duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <img
                  src="/MediSync_Logo_3.png"
                  alt="MediSync logo"
                  className="object-cover w-full h-full"
                />
              </div>
             
            </Link>

            <Link
              to="/auth/login"
              className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Sign In
            </Link>
          </div>
        </header>

        <HeaderStateBanner
          type="empty"
          title="No active session found."
          description="You are not signed in. Stop expecting protected navigation without authentication."
        />
      </>
    );
  }

  return (
    <>
      <header
        className="sticky top-0 z-40 transition-all duration-300"
        role="banner"
        style={{
          background: scrolled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: scrolled
            ? "1px solid rgba(148,163,184,0.25)"
            : "1px solid transparent",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 py-3.5 sm:h-18 sm:px-6 lg:px-8">
          <div className="flex gap-3 items-center min-w-0">
            <Link
              to={homePath}
              className="flex gap-3 items-center rounded-xl group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label={`MediSync home - ${portalLabel}`}
            >
              <div className="flex overflow-hidden justify-center items-center w-11 h-11 rounded-2xl shadow-lg transition duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <img
                  src="/MediSync_Logo_3.png"
                  alt="MediSync logo"
                  className="object-cover w-full h-full"
                />
              </div>
             
            </Link>

            <div className="hidden min-w-0 xl:block">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {portalLabel}
              </p>
              <p className="text-sm font-medium truncate text-slate-700">
                {displayName}
              </p>
            </div>
          </div>

          <nav
            className="hidden items-center gap-1 md:flex lg:gap-1.5"
            aria-label="Main navigation"
          >
            {navLinks.map((item) => (
              <DesktopNavItem
                key={item.to}
                to={item.to}
                label={item.label}
              />
            ))}
          </nav>

          <div className="flex gap-2 items-center sm:gap-3">
            <div className="hidden sm:block">
              <NotificationDropdown />
            </div>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={toggleProfile}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                aria-controls="profile-dropdown"
                className="group flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-linear-to-br from-blue-600 to-blue-500 text-sm font-bold text-white shadow-md shadow-blue-100 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer"
              >
                <span aria-hidden="true">{initials}</span>
              </button>

              {profileOpen ? (
                <ProfileDropdown
                  user={user}
                  profileLink={profileLink}
                  onLogout={handleLogout}
                  onClose={closeProfile}
                />
              ) : null}
            </div>

            <button
              type="button"
              onClick={openDrawer}
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              className="flex justify-center items-center w-10 h-10 bg-white rounded-xl border transition-colors duration-200 cursor-pointer border-slate-200 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:hidden"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="sm:hidden">
        <NotificationDropdown />
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        navLinks={navLinks}
        homePath={homePath}
        portalLabel={portalLabel}
        user={user}
        profileLink={profileLink}
        onLogout={handleLogout}
      />
    </>
  );
};

export default memo(Header);
