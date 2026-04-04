<<<<<<< HEAD
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BotMessageSquare,
  Calendar,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  User,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import NotificationDropdown from "../../features/notifications/components/NotificationDropdown";
import { useOptionalAuth } from "../../features/auth/context/AuthContext";
import { notifyError, notifySuccess } from "../../utils/toast";

// ─── Nav config ───────────────────────────────────────────────────────────────

const ROLE_NAV_LINKS = {
  PATIENT: [
    { to: "/patient/doctors", label: "Home", icon: Activity },
    { to: "/patient/appointments", label: "Appointments", icon: Calendar },
    { to: "/patient/records", label: "Medical Records", icon: ClipboardList },
    { to: "/patient/prescriptions", label: "Prescriptions", icon: Pill },
    { to: "/patient/ai-checker", label: "AI Checker", icon: BotMessageSquare },
  ],
  DOCTOR: [
    { to: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/doctor/appointments", label: "Appointments", icon: Calendar },
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

// ─── Shared NavLink class helper ─────────────────────────────────────────────

const desktopCls = ({ isActive }) =>
  [
    "relative text-sm font-semibold transition-colors duration-200 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded",
    isActive ? "text-primary" : "text-neutral-500 hover:text-neutral-900",
  ].join(" ");

function NavItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer",
          isActive
            ? "bg-primary/8 text-primary"
            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={16}
            aria-hidden="true"
            style={{ color: isActive ? "var(--color-primary)" : undefined }}
          />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

// ─── Animated underline dot ───────────────────────────────────────────────────

function ActiveDot({ isActive }) {
  return (
    <span
      aria-hidden="true"
      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary transition-all duration-300"
      style={{
        opacity: isActive ? 1 : 0,
        transform: `translateX(-50%) scale(${isActive ? 1 : 0})`,
      }}
    />
  );
}

function ProfileDropdown({ user, profileLink, onLogout, onClose }) {
  const displayName = user?.name || user?.fullName || "User";
  const roleLabel = normalizeRole(user?.role) || "USER";

  return (
    <div
      id="profile-dropdown"
      className="absolute right-0 z-50 w-56 mt-3 overflow-hidden bg-white border shadow-2xl top-full rounded-2xl border-neutral-100"
      style={{ animation: "slideDown 0.18s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      <div className="px-4 py-3 border-b border-neutral-100">
        <p className="text-xs font-semibold truncate text-neutral-800">
          {displayName}
        </p>
        <p className="text-[11px] text-neutral-500 capitalize">{roleLabel}</p>
      </div>

      <div className="p-2">
        {profileLink && (
          <Link
            to={profileLink.to}
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <User size={14} className="text-neutral-500" aria-hidden="true" />
            {profileLink.label}
          </Link>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer"
        >
          <LogOut size={14} aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────

function MobileDrawer({
  open,
  onClose,
  navLinks,
  homePath,
  portalLabel,
  user,
}) {
  const drawerRef = useRef(null);
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Trap focus
  useEffect(() => {
    if (!open) return;
    const el = drawerRef.current;
    const focusable = el?.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && focusable?.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (
          e.shiftKey
            ? document.activeElement === first
            : document.activeElement === last
        ) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-40 transition-opacity duration-300 bg-neutral-900/30 backdrop-blur-sm md:hidden"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
      />

      {/* Panel */}
      <div
        ref={drawerRef}
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed inset-y-0 right-0 z-50 flex flex-col w-72 bg-white shadow-2xl md:hidden transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <Link
            to={homePath}
            onClick={onClose}
            className="flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <BrandLogo size="sm" />
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer links */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5"
          aria-label="Mobile navigation"
        >
          {navLinks.map(({ to, label, icon }) => (
            <NavItem
              key={to}
              to={to}
              label={label}
              icon={icon}
              onClick={onClose}
            />
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="px-5 py-4 border-t border-neutral-100">
          <p className="text-[10px] font-medium tracking-widest text-neutral-300 uppercase">
            {portalLabel}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400 truncate">
            {user?.name || "Signed in"}
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────

const Header = () => {
  const auth = useOptionalAuth() || {};
  const { user, logout } = auth;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);

  const roleConfig = getRoleConfig(user?.role);
  const navLinks = roleConfig.navLinks;
  const homePath = roleConfig.homePath;
  const profileLink = roleConfig.profileLink;
  const portalLabel = roleConfig.portalLabel;

  useEffect(() => {
    closeDrawer();
    closeProfile();
  }, [pathname, closeDrawer, closeProfile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        closeProfile();
      }
    };

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [profileOpen, closeProfile]);

  const handleLogout = useCallback(async () => {
    try {
      await logout?.();
      notifySuccess("Logged out successfully.");
    } catch (error) {
      notifyError(error, "Failed to log out cleanly.");
    } finally {
      closeProfile();
      closeDrawer();
      navigate("/auth/login", { replace: true });
    }
  }, [logout, navigate, closeDrawer, closeProfile]);

  return (
    <>
      <header
        className="sticky top-0 z-40 h-16 sm:h-[4.25rem] flex items-center justify-between px-4 sm:px-8 md:px-12 lg:px-16 border-b border-neutral-100 bg-white/90 backdrop-blur-md"
        role="banner"
      >
        {/* ── Logo ────────────────────────────────────────────────────── */}
        <Link
          to={homePath}
          className="flex items-center gap-2.5 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded group"
          aria-label={`MediSync — go to ${portalLabel}`}
        >
          <BrandLogo size="md" />
        </Link>

        {/* ── Desktop nav ─────────────────────────────────────────────── */}
        <nav
          className="hidden md:flex items-center gap-1 lg:gap-1.5"
          aria-label="Main navigation"
        >
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} className={desktopCls}>
              {({ isActive }) => (
                <span className="px-3 py-1.5 rounded-lg transition-colors duration-150 hover:bg-neutral-100 block">
                  {label}
                  <ActiveDot isActive={isActive} />
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Right actions ───────────────────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <NotificationDropdown />

          {/* Avatar — desktop */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              aria-controls="profile-dropdown"
              className="flex items-center justify-center overflow-hidden text-sm font-bold transition-all duration-200 border-2 rounded-full cursor-pointer w-9 h-9 border-neutral-200 bg-neutral-100 text-neutral-700 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <User size={16} aria-hidden="true" />
            </button>

            {profileOpen && (
              <ProfileDropdown
                user={user}
                profileLink={profileLink}
                onLogout={handleLogout}
                onClose={closeProfile}
              />
            )}
          </div>

          {/* Hamburger — mobile */}
          <button
            onClick={openDrawer}
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            className="flex items-center justify-center transition-all duration-150 border cursor-pointer md:hidden w-9 h-9 rounded-xl border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Menu size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      <MobileDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        navLinks={navLinks}
        homePath={homePath}
        portalLabel={portalLabel}
        user={user}
      />
    </>
=======
import { Link, NavLink } from 'react-router-dom';
import NotificationDropdown from '../../features/notifications/components/NotificationDropdown';

/**
 * Header – Navigation header for Patients and Public users.
 */
const Header = () => {
  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 md:px-16 sticky top-0 z-50 backdrop-blur-md bg-white/80">
      <Link to="/patient/dashboard" className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
          <span className="text-white font-bold text-xl">+</span>
        </div>
        <span className="text-2xl font-black text-slate-800 tracking-tight">MediSync</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8">
        <NavLink
          to="/patient/doctors"
          className={({ isActive }) =>
            `text-sm font-bold transition-all hover:text-blue-600 ${
              isActive ? 'text-blue-600' : 'text-slate-500'
            }`
          }
        >
          Doctors
        </NavLink>
        <NavLink
          to="/patient/ai-checker"
          className={({ isActive }) =>
            `text-sm font-bold transition-all hover:text-blue-600 ${
              isActive ? 'text-blue-600' : 'text-slate-500'
            }`
          }
        >
          AI Checker
        </NavLink>
        <NavLink
          to="/patient/appointments"
          className={({ isActive }) =>
            `text-sm font-bold transition-all hover:text-blue-600 ${
              isActive ? 'text-blue-600' : 'text-slate-500'
            }`
          }
        >
          My Appointments
        </NavLink>
        <NavLink
          to="/patient/records"
          className={({ isActive }) =>
            `text-sm font-bold transition-all hover:text-blue-600 ${
              isActive ? 'text-blue-600' : 'text-slate-500'
            }`
          }
        >
          My Records
        </NavLink>
        <NavLink
          to="/patient/prescriptions"
          className={({ isActive }) =>
            `text-sm font-bold transition-all hover:text-blue-600 ${
              isActive ? 'text-blue-600' : 'text-slate-500'
            }`
          }
        >
          Prescriptions
        </NavLink>
        <NavLink
          to="/patient/profile"
          className={({ isActive }) =>
            `text-sm font-bold transition-all hover:text-blue-600 ${
              isActive ? 'text-blue-600' : 'text-slate-500'
            }`
          }
        >
          Account
        </NavLink>
      </nav>

      <div className="flex items-center gap-6">
        <NotificationDropdown />
        <button className="p-2 text-slate-400 hover:text-slate-600 md:hidden">
          <span className="text-2xl">☰</span>
        </button>
        <Link to="/patient/profile" className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-bold overflow-hidden cursor-pointer hover:border-blue-200 transition-all">
          👤
        </Link>
      </div>
    </header>
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
  );
};

export default Header;
