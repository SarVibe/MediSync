import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  Calendar,
  Clock,
  Sliders,
  Activity,
  X,
  CheckCheck,
  AlertCircle,
  Info,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import { useOptionalAuth } from "../../features/auth/context/AuthContext";
import { notifyError, notifySuccess } from "../../utils/toast";
import {
  clearNotifications,
  getNotifications,
  markAsRead,
} from "../../features/notifications/services/notificationService";

// ─── HELPERS ────────────────────────────────────────────────────────────────

const getPageMeta = (pathname) => {
  if (pathname.includes("dashboard"))
    return { title: "Dashboard Overview", Icon: LayoutDashboard };
  if (pathname.includes("appointments"))
    return { title: "Manage Appointments", Icon: Calendar };
  if (pathname.includes("schedule"))
    return { title: "Daily Schedule", Icon: Clock };
  if (pathname.includes("availability"))
    return { title: "Availability Settings", Icon: Sliders };
  return { title: "MediSync Portal", Icon: Activity };
};

const NOTIF_ICON = {
  info: { Icon: Info, bg: "bg-sky-100", text: "text-sky-600" },
  success: { Icon: CheckCheck, bg: "bg-emerald-100", text: "text-emerald-600" },
  warning: { Icon: AlertCircle, bg: "bg-amber-100", text: "text-amber-600" },
};

// ─── SUB-COMPONENTS ─────────────────────────────────────────────────────────

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-neutral-200 ${className}`} />
);

const NotifItem = ({ notif, onRead }) => {
  const { Icon, bg, text } = NOTIF_ICON[notif.type] || NOTIF_ICON.info;
  return (
    <button
      type="button"
      onClick={() => onRead(notif.id)}
      className={`w-full text-left flex gap-3 px-4 py-3 transition-colors duration-150 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary cursor-pointer ${
        notif.read ? "opacity-60" : ""
      }`}
    >
      <span
        className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${bg}`}
      >
        <Icon size={15} className={text} />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate text-neutral-800">
          {notif.title}
        </p>
        <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
          {notif.body}
        </p>
        <p className="text-[10px] text-neutral-400 mt-1">{notif.time}</p>
      </div>

      {!notif.read && (
        <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
      )}
    </button>
  );
};

const NotificationPanel = ({
  items,
  loading,
  error,
  unreadCount,
  onRead,
  onClearAll,
  onClose,
}) => (
  <div
    className="absolute right-0 z-50 mt-3 overflow-hidden bg-white border shadow-2xl top-full w-80 sm:w-96 rounded-2xl border-neutral-100"
    style={{ animation: "slideDown 0.18s cubic-bezier(0.22,1,0.36,1) both" }}
  >
    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
      <div className="flex items-center gap-2">
        <Bell size={15} className="text-neutral-600" />
        <span className="text-sm font-bold text-neutral-800">
          Notifications
        </span>
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-white text-[10px] font-bold">
            {unreadCount}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-primary font-medium hover:underline rounded cursor-pointer"
          >
            Mark all read
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="p-1 transition-colors rounded-lg cursor-pointer text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
        >
          <X size={14} />
        </button>
      </div>
    </div>

    <div className="overflow-y-auto divide-y max-h-80 divide-neutral-50">
      {loading && !error && (
        <div className="px-4 py-3 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-3/4 h-3" />
                <Skeleton className="h-2.5 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-neutral-400">
          <AlertCircle size={28} className="text-red-400" />
          <p className="text-xs">Failed to load notifications.</p>
        </div>
      )}

      {!loading && items?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-neutral-400">
          <Bell size={28} />
          <p className="text-xs">You're all caught up!</p>
        </div>
      )}

      {!loading &&
        items?.map((n) => <NotifItem key={n.id} notif={n} onRead={onRead} />)}
    </div>
  </div>
);

// ─── PROFILE DROPDOWN ───────────────────────────────────────────────────────

const ProfileDropdownMenu = ({ user, onLogout, onClose }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    const normalizedRole = String(user?.role || "").toUpperCase();
    navigate(`/${normalizedRole === "DOCTOR" ? "doctor" : "patient"}/profile`);
    onClose();
  };

  return (
    <div
      className="absolute right-0 z-50 w-48 mt-3 overflow-hidden bg-white border shadow-2xl top-full rounded-2xl border-neutral-100"
      style={{
        animation: "slideDown 0.18s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      {/* Header with user info */}
      <div className="px-4 py-3 border-b border-neutral-100">
        <p className="text-xs font-semibold text-neutral-800">
          {user?.name || "User"}
        </p>
        <p className="text-[11px] text-neutral-500 capitalize">
          {user?.role || "user"}
        </p>
      </div>

      {/* Menu items */}
      <div className="divide-y divide-neutral-50">
        <button
          type="button"
          onClick={handleProfileClick}
          className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <User size={14} className="text-neutral-500" />
          View Profile
        </button>
        <button
          type="button"
          onClick={() => {
            navigate("/settings");
            onClose();
          }}
          className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <Settings size={14} className="text-neutral-500" />
          Settings
        </button>
      </div>

      {/* Logout */}
      <div className="px-4 py-2.5 border-t border-neutral-100">
        <button
          type="button"
          onClick={onLogout}
          className="w-full text-left flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-2 py-1.5 rounded transition-colors font-medium cursor-pointer"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

const Topbar = () => {
  const auth = useOptionalAuth() || {};
  const { user, currentUser, logout } = auth;
  const effectiveUser = currentUser || user || null;
  const { pathname } = useLocation();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const { title: pageTitle } = getPageMeta(pathname);
  const unreadCount = notifItems.filter((n) => !n.read).length;

  // ─── HANDLERS ─────────────────────────────────────────────────────────────

  const loadNotifications = useCallback(async () => {
    if (!notifOpen) return;
    setNotifLoading(true);
    setNotifError(false);
    try {
      const data = await getNotifications();
      setNotifItems(data || []);
    } catch (err) {
      setNotifError(true);
    } finally {
      setNotifLoading(false);
    }
  }, [notifOpen]);

  const handleReadNotification = useCallback(async (notifId) => {
    try {
      await markAsRead(notifId);
      setNotifItems((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)),
      );
    } catch {
      setNotifError(true);
    }
  }, []);

  const handleClearNotifications = useCallback(async () => {
    try {
      await clearNotifications();
      setNotifItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      setNotifError(true);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleLogout = useCallback(async () => {
    try {
      await logout?.();
      notifySuccess("Logged out successfully.");
      setProfileOpen(false);
      setNotifOpen(false);
    } catch (error) {
      notifyError(error, "Failed to log out. Please try again.");
    }
  }, [logout]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    if (notifOpen || profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [notifOpen, profileOpen]);

  // Initials logic fixed (removed duplication)
  const initials = (effectiveUser?.name || "User")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePop {
          0%   { transform: scale(0.6); }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .badge-pop { animation: badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 bg-white border-b sm:h-20 border-neutral-200 sm:px-8">
        {/* Left: Page Title */}
        <div className="flex items-center min-w-0 gap-3">
          <BrandLogo size="sm" className="flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="text-base font-bold leading-tight truncate sm:text-lg text-neutral-900">
              {pageTitle}
            </h2>
            <p className="hidden sm:block text-[11px] text-neutral-400 font-medium mt-0.5">
              MediSync Portal
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center flex-shrink-0 gap-2 sm:gap-4">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="relative flex items-center justify-center transition-all cursor-pointer w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="badge-pop absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <NotificationPanel
                items={notifItems}
                loading={notifLoading}
                error={notifError}
                unreadCount={unreadCount}
                onRead={handleReadNotification}
                onClearAll={handleClearNotifications}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </div>

          <span className="hidden w-px h-8 rounded-full sm:block bg-neutral-200" />

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 sm:gap-3 rounded-xl px-2 py-1.5 hover:bg-neutral-100 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary group cursor-pointer"
            >
              <div
                className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-xs font-bold text-white bg-blue-600 shadow-sm sm:w-9 sm:h-9 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                }}
              >
                {initials}
              </div>

              <div className="hidden text-left md:block">
                <p className="text-xs font-bold text-neutral-900 leading-tight max-w-[120px] truncate">
                  {effectiveUser?.name || "Guest"}
                </p>
                <p className="text-[10px] text-neutral-400 font-medium capitalize">
                  {effectiveUser?.role || "User"}
                </p>
              </div>

              <ChevronDown
                size={13}
                className={`hidden sm:block text-neutral-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileOpen && (
              <ProfileDropdownMenu
                user={effectiveUser}
                onLogout={handleLogout}
                onClose={() => setProfileOpen(false)}
              />
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Topbar;
