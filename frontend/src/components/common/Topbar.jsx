/* eslint-disable no-unused-vars */
import React, { memo, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { useOptionalAuth } from "../../features/auth/context/AuthContext";
import { notifyError, notifySuccess } from "../../utils/toast";
import {
  clearNotifications,
  getNotifications,
  markAsRead,
} from "../../features/notifications/services/notificationService";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const getPageMeta = (pathname) => {
  if (pathname.includes("dashboard")) {
    return {
      title: "Dashboard Overview",
      subtitle: "Your daily activity and quick actions",
      Icon: LayoutDashboard,
    };
  }

  if (pathname.includes("appointments")) {
    return {
      title: "Manage Appointments",
      subtitle: "Track and manage patient bookings",
      Icon: Calendar,
    };
  }

  if (pathname.includes("schedule")) {
    return {
      title: "Daily Schedule",
      subtitle: "Review today's consultations and tasks",
      Icon: Clock,
    };
  }

  if (pathname.includes("availability")) {
    return {
      title: "Availability Settings",
      subtitle: "Control your consultation availability",
      Icon: Sliders,
    };
  }

  return {
    title: "MediSync Portal",
    subtitle: "Smart healthcare workspace",
    Icon: Activity,
  };
};

const NOTIF_ICON = {
  info: {
    Icon: Info,
    iconClass: "text-blue-600",
    wrapperClass: "bg-blue-50 ring-1 ring-blue-100",
  },
  success: {
    Icon: CheckCheck,
    iconClass: "text-emerald-600",
    wrapperClass: "bg-emerald-50 ring-1 ring-emerald-100",
  },
  warning: {
    Icon: AlertCircle,
    iconClass: "text-amber-600",
    wrapperClass: "bg-amber-50 ring-1 ring-amber-100",
  },
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

// ─────────────────────────────────────────────────────────────────────────────
// UI PARTS
// ─────────────────────────────────────────────────────────────────────────────

const Skeleton = memo(({ className = "" }) => (
  <div className={cn("rounded-xl animate-pulse bg-slate-200/80", className)} />
));

Skeleton.displayName = "Skeleton";

const IconBadge = memo(({ Icon }) => (
  <div className="hidden justify-center items-center w-10 h-10 text-blue-600 bg-blue-50 rounded-2xl ring-1 ring-blue-100 shadow-sm sm:flex">
    <Icon size={18} />
  </div>
));

IconBadge.displayName = "IconBadge";

const NotificationItem = memo(({ notif, onRead }) => {
  const { Icon, iconClass, wrapperClass } =
    NOTIF_ICON[notif.type] || NOTIF_ICON.info;

  return (
    <button
      type="button"
      onClick={() => onRead(notif.id)}
      className={cn(
        "group flex w-full items-start gap-3 px-4 py-3.5 text-left transition-all duration-200 cursor-pointer",
        "hover:bg-blue-50/60 focus:outline-none focus-visible:bg-blue-50/60",
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500",
        !notif.read && "bg-white",
        notif.read && "opacity-70",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105",
          wrapperClass,
        )}
      >
        <Icon size={16} className={iconClass} />
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex gap-3 justify-between items-start">
          <p className="text-sm font-semibold truncate text-slate-900">
            {notif.title}
          </p>
          {!notif.read && (
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
          )}
        </div>

        <p className="mt-1 text-xs leading-5 line-clamp-2 text-slate-500">
          {notif.body}
        </p>

        <p className="mt-2 text-[11px] font-medium text-slate-400">
          {notif.time}
        </p>
      </div>
    </button>
  );
});

NotificationItem.displayName = "NotificationItem";

const NotificationLoading = memo(() => (
  <div className="px-4 py-4 space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-3">
        <Skeleton className="w-10 h-10 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="w-full h-3" />
          <Skeleton className="w-1/3 h-3" />
        </div>
      </div>
    ))}
  </div>
));

NotificationLoading.displayName = "NotificationLoading";

const NotificationEmpty = memo(() => (
  <div className="flex flex-col justify-center items-center px-6 py-12 text-center">
    <div className="flex justify-center items-center w-14 h-14 rounded-2xl ring-1 bg-slate-100 text-slate-400 ring-slate-200">
      <Bell size={24} />
    </div>
    <p className="mt-4 text-sm font-semibold text-slate-700">
      You're all caught up
    </p>
    <p className="mt-1 text-xs leading-5 text-slate-400">
      New alerts and activity updates will appear here.
    </p>
  </div>
));

NotificationEmpty.displayName = "NotificationEmpty";

const NotificationError = memo(({ onRetry }) => (
  <div className="flex flex-col justify-center items-center px-6 py-12 text-center">
    <div className="flex justify-center items-center w-14 h-14 text-red-500 bg-red-50 rounded-2xl ring-1 ring-red-100">
      <AlertCircle size={24} />
    </div>
    <p className="mt-4 text-sm font-semibold text-slate-800">
      Failed to load notifications
    </p>
    <p className="mt-1 text-xs leading-5 text-slate-400">
      Something went wrong while fetching your latest activity.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex items-center px-4 py-2 mt-4 text-xs font-semibold text-white bg-blue-600 rounded-xl transition cursor-pointer hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
    >
      Try Again
    </button>
  </div>
));

NotificationError.displayName = "NotificationError";

const NotificationPanel = memo(
  ({
    items,
    loading,
    error,
    unreadCount,
    onRead,
    onClearAll,
    onClose,
    onRetry,
  }) => {
    return (
      <div
        className={cn(
          "absolute right-0 top-full z-50 mt-3 w-[20rem] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.14)]",
          "sm:w-[24rem]",
        )}
      >
        <div className="border-b border-slate-100 bg-linear-to-b from-blue-50/70 to-white px-4 py-3.5">
          <div className="flex gap-3 justify-between items-center">
            <div className="min-w-0">
              <div className="flex gap-2 items-center">
                <div className="flex justify-center items-center w-8 h-8 text-white bg-blue-600 rounded-xl shadow-sm shadow-blue-100">
                  <Bell size={15} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Notifications
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Recent system updates and alerts
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={cn(
                "inline-flex justify-center items-center w-8 h-8 rounded-xl transition cursor-pointer text-slate-400 hover:bg-slate-100 hover:text-slate-700",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              )}
              aria-label="Close notifications panel"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex gap-3 justify-between items-center mt-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              {unreadCount} unread
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs font-semibold text-blue-600 rounded-md transition cursor-pointer hover:text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto divide-y max-h-88 divide-slate-100">
          {loading && !error && <NotificationLoading />}
          {error && <NotificationError onRetry={onRetry} />}
          {!loading && !error && items.length === 0 && <NotificationEmpty />}
          {!loading &&
            !error &&
            items.map((notif) => (
              <NotificationItem key={notif.id} notif={notif} onRead={onRead} />
            ))}
        </div>
      </div>
    );
  },
);

NotificationPanel.displayName = "NotificationPanel";

const ProfileDropdownMenu = memo(({ user, onLogout, onClose }) => {
  const navigate = useNavigate();

  const handleProfileClick = useCallback(() => {
    const normalizedRole = String(user?.role || "").toUpperCase();
    navigate(`/${normalizedRole === "DOCTOR" ? "doctor" : "patient"}/profile`);
    onClose();
  }, [navigate, onClose, user?.role]);

  const handleSettingsClick = useCallback(() => {
    navigate("/settings");
    onClose();
  }, [navigate, onClose]);

  return (
    <div className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.14)]">
      <div className="px-4 py-4 to-white border-b bg-linear-to-b border-slate-100 from-blue-50/70">
        <div className="flex gap-3 items-center">
          <div className="flex justify-center items-center w-11 h-11 text-sm font-bold text-white from-blue-600 to-blue-500 rounded-2xl shadow-sm shadow-blue-100 bg-linear-to-br">
            {(user?.name || "User")
              .split(" ")
              .map((word) => word[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold truncate text-slate-900">
              {user?.name || "User"}
            </p>
            <p className="text-xs capitalize truncate text-slate-500">
              {user?.role || "user"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-2">
        <button
          type="button"
          onClick={handleProfileClick}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-all duration-200 cursor-pointer",
            "hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          )}
        >
          <User size={16} className="text-slate-500" />
          View Profile
        </button>

        <button
          type="button"
          onClick={handleSettingsClick}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-all duration-200 cursor-pointer",
            "hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          )}
        >
          <Settings size={16} className="text-slate-500" />
          Settings
        </button>
      </div>

      <div className="p-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-all duration-200 cursor-pointer",
            "hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500",
          )}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
});

ProfileDropdownMenu.displayName = "ProfileDropdownMenu";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

const Topbar = () => {
  const auth = useOptionalAuth() || {};
  const { user, currentUser, logout } = auth;
  const effectiveUser = currentUser || user || null;

  const { pathname } = useLocation();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifItems, setNotifItems] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const pageMeta = useMemo(() => getPageMeta(pathname), [pathname]);
  const unreadCount = useMemo(
    () => notifItems.filter((item) => !item.read).length,
    [notifItems],
  );

  const initials = useMemo(() => {
    return (effectiveUser?.name || "User")
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [effectiveUser?.name]);

  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    setNotifError(false);

    try {
      const data = await getNotifications();
      setNotifItems(Array.isArray(data) ? data : []);
    } catch {
      setNotifError(true);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const handleNotificationToggle = useCallback(() => {
    setNotifOpen((prev) => {
      const next = !prev;
      if (next) setProfileOpen(false);
      return next;
    });
  }, []);

  const handleProfileToggle = useCallback(() => {
    setProfileOpen((prev) => {
      const next = !prev;
      if (next) setNotifOpen(false);
      return next;
    });
  }, []);

  const handleReadNotification = useCallback(async (notifId) => {
    try {
      await markAsRead(notifId);
      setNotifItems((prev) =>
        prev.map((item) =>
          item.id === notifId ? { ...item, read: true } : item,
        ),
      );
    } catch {
      setNotifError(true);
    }
  }, []);

  const handleClearNotifications = useCallback(async () => {
    try {
      await clearNotifications();
      setNotifItems((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch {
      setNotifError(true);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout?.();
      notifySuccess("Logged out successfully.");
      setProfileOpen(false);
      setNotifOpen(false);
    } catch (logoutError) {
      notifyError(logoutError, "Failed to log out. Please try again.");
    }
  }, [logout]);

  useEffect(() => {
    if (notifOpen) {
      loadNotifications();
    }
  }, [notifOpen, loadNotifications]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };

    if (notifOpen || profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [notifOpen, profileOpen]);

  return (
    <header
      className="sticky top-0 z-40 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled
          ? "1px solid rgba(148,163,184,0.25)"
          : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="px-3 mx-auto max-w-7xl sm:px-5 lg:px-8">
        <div className="flex min-h-[72px] items-center justify-between gap-3 sm:min-h-[84px]">
          {/* Left */}
          <div className="flex gap-3 items-center min-w-0 sm:gap-4">
            <IconBadge Icon={pageMeta.Icon} />
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight truncate text-slate-900 sm:text-base lg:text-lg">
                {pageMeta.title}
              </h1>
              <p className="hidden text-xs font-medium truncate text-slate-500 sm:block">
                {pageMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex gap-2 items-center shrink-0 sm:gap-3">
            {/* Notification icon disabled as requested.
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={handleNotificationToggle}
                className={cn(
                  "relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 cursor-pointer",
                  "hover:bg-slate-100 hover:text-slate-800 hover:-translate-y-0.5 active:translate-y-0",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
                  notifOpen && "bg-slate-100 text-slate-900",
                )}
                aria-label="Open notifications"
                aria-expanded={notifOpen}
                aria-haspopup="dialog"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-emerald-500 px-1 text-[10px] font-bold text-white shadow-sm">
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
                  onRetry={loadNotifications}
                />
              )}
            </div>
            */}
            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={handleProfileToggle}
                className={cn(
                  "group flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2 transition-all duration-200 cursor-pointer",
                  "hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
                  profileOpen && "bg-slate-100",
                )}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <div className="flex justify-center items-center w-10 h-10 text-xs font-bold text-white from-blue-600 to-blue-500 rounded-2xl ring-1 shadow-sm shadow-blue-100 bg-linear-to-br ring-blue-300/30">
                  {initials}
                </div>

                <div className="hidden min-w-0 text-left md:block">
                  <p className="max-w-[130px] truncate text-sm font-bold leading-tight text-slate-900">
                    {effectiveUser?.name || "Guest"}
                  </p>
                  <p className="text-[11px] font-medium capitalize text-slate-500">
                    {effectiveUser?.role || "User"}
                  </p>
                </div>

                <ChevronDown
                  size={15}
                  className={cn(
                    "hidden text-slate-400 transition-transform duration-200 sm:block",
                    profileOpen && "rotate-180",
                  )}
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
        </div>
      </div>
    </header>
  );
};

export default Topbar;
