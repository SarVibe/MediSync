import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  AlignJustify,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  CreditCard,
  FolderOpen,
  HeartPulse,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  Settings2,
  Stethoscope,
  TriangleAlert,
  UserCog,
  Users,
  X,
} from "lucide-react";

// ───────────────────────────────────────────────────────────────────────────────
// Nav config
// ───────────────────────────────────────────────────────────────────────────────

const ADMIN_LINKS = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Appointments", path: "/admin/appointments", icon: CalendarDays },
  { name: "Records", path: "/admin/records", icon: FolderOpen },
  { name: "Prescriptions", path: "/admin/prescriptions", icon: ClipboardList },
  { name: "Transactions", path: "/admin/payments", icon: CreditCard },
  {
    name: "Manage Users",
    path: "/admin/users",
    icon: Users,
    children: [
      { name: "Patients", path: "/admin/users?tab=patients" },
      { name: "Approved Doctors", path: "/admin/users?tab=doctors" },
      { name: "Pending Requests", path: "/admin/users?tab=pending" },
    ],
  },
];

const DOCTOR_LINKS = [
  { name: "Dashboard", path: "/doctor/dashboard", icon: LayoutDashboard },
  { name: "Appointments", path: "/doctor/appointments", icon: CalendarDays },
  {
    name: "Patient Records",
    path: "/doctor/patient-records",
    icon: Stethoscope,
  },
  { name: "Prescriptions", path: "/doctor/prescriptions", icon: ClipboardList },
  { name: "Daily Schedule", path: "/doctor/schedule", icon: CalendarClock },
  { name: "Availability", path: "/doctor/availability", icon: Settings2 },
  { name: "My Profile", path: "/doctor/profile", icon: UserCog },
];

const ROLE_CONFIG = {
  admin: { label: "Admin Panel", badge: "ADMIN", Icon: UserCog },
  doctor: { label: "Doctor Portal", badge: "DOCTOR", Icon: HeartPulse },
};

// ───────────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────────

const cn = (...classes) => classes.filter(Boolean).join(" ");

const getPathAndSearch = (fullPath = "") => {
  const [pathname, search = ""] = fullPath.split("?");
  return {
    pathname,
    search: search ? `?${search}` : "",
  };
};

const isChildLinkActive = (location, childPath) => {
  const parsed = getPathAndSearch(childPath);
  return (
    location.pathname === parsed.pathname &&
    location.search === parsed.search
  );
};

const isParentLinkActive = (location, link) => {
  if (!link?.path) return false;

  const parsed = getPathAndSearch(link.path);
  const matchesParent = location.pathname === parsed.pathname;

  if (matchesParent) {
    if (!parsed.search) return true;
    return location.search === parsed.search;
  }

  if (link.children?.length) {
    return link.children.some((child) => isChildLinkActive(location, child.path));
  }

  return false;
};

// ───────────────────────────────────────────────────────────────────────────────
// State Components
// ───────────────────────────────────────────────────────────────────────────────

const SidebarSkeleton = memo(function SidebarSkeleton({ collapsed }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          "border-b border-neutral-200",
          collapsed ? "px-3 py-4" : "px-5 py-4"
        )}
      >
        <div
          className={cn(
            "rounded-2xl animate-pulse bg-neutral-200",
            collapsed ? "mx-auto w-10 h-10" : "w-full h-11"
          )}
        />
      </div>

      {!collapsed && (
        <div className="px-4 pt-4">
          <div className="h-10 rounded-2xl animate-pulse bg-neutral-200" />
        </div>
      )}

      <div className={cn("flex-1 mt-4 space-y-2", collapsed ? "px-2" : "px-3")}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "rounded-2xl animate-pulse bg-neutral-200",
              collapsed ? "mx-auto w-11 h-11" : "w-full h-11"
            )}
          />
        ))}
      </div>
    </div>
  );
});

const SidebarEmptyState = memo(function SidebarEmptyState({ collapsed }) {
  if (collapsed) {
    return (
      <div className="flex flex-1 justify-center items-center px-2">
        <div className="p-3 rounded-2xl bg-neutral-100 text-neutral-400">
          <Activity size={18} aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center px-4 py-6">
      <div className="p-5 w-full text-center rounded-3xl border border-dashed border-neutral-200 bg-neutral-50">
        <div className="flex justify-center items-center mx-auto mb-3 w-11 h-11 bg-white rounded-2xl shadow-sm text-neutral-400">
          <Activity size={18} aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-neutral-800">No navigation items</p>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
          No sidebar links are available for this section.
        </p>
      </div>
    </div>
  );
});

const SidebarErrorState = memo(function SidebarErrorState({
  collapsed,
  onRetry,
}) {
  if (collapsed) {
    return (
      <div className="flex flex-1 justify-center items-center px-2">
        <button
          type="button"
          onClick={onRetry}
          className="flex justify-center items-center w-11 h-11 text-red-600 bg-red-50 rounded-2xl transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
          aria-label="Retry sidebar"
        >
          <TriangleAlert size={18} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center px-4 py-6">
      <div className="p-5 w-full bg-red-50 rounded-3xl border border-red-100">
        <div className="flex justify-center items-center mb-3 w-11 h-11 text-red-500 bg-white rounded-2xl shadow-sm">
          <TriangleAlert size={18} aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-red-700">
          Failed to load sidebar
        </p>
        <p className="mt-1 text-xs leading-relaxed text-red-600/80">
          Something went wrong while preparing navigation items.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
        >
          Retry
        </button>
      </div>
    </div>
  );
});

// ───────────────────────────────────────────────────────────────────────────────
// Nav Item
// ───────────────────────────────────────────────────────────────────────────────

const NavItem = memo(function NavItem({ link, collapsed, onNavigate }) {
  const location = useLocation();
  const Icon = link.icon;
  const hasChildren = Array.isArray(link.children) && link.children.length > 0;

  const active = useMemo(
    () => isParentLinkActive(location, link),
    [location, link]
  );

  const [isOpen, setIsOpen] = useState(active);
  const shouldShowChildren = !collapsed && (active || isOpen);

  const handleParentToggle = useCallback(() => {
    if (hasChildren && !collapsed) {
      setIsOpen((prev) => !prev);
    }
  }, [hasChildren, collapsed]);

  const baseItemClass = cn(
    "group relative flex w-full items-center gap-3 rounded-2xl text-sm font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30",
    collapsed ? "justify-center px-0 py-3" : "px-3.5 py-3",
    active
      ? "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100"
      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
  );

  const iconClass = cn(
    "shrink-0 transition duration-200",
    active
      ? "scale-105 text-emerald-600"
      : "text-neutral-500 group-hover:scale-110 group-hover:text-neutral-800"
  );

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={handleParentToggle}
          title={collapsed ? link.name : undefined}
          aria-expanded={!collapsed ? isOpen : undefined}
          aria-label={link.name}
          className={cn(baseItemClass, "cursor-pointer")}
        >
          {active && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 w-1 h-6 bg-emerald-600 rounded-r-full -translate-y-1/2"
            />
          )}

          <Icon size={18} className={iconClass} aria-hidden="true" />

          {!collapsed && (
            <>
              <span className="flex-1 min-w-0 text-left truncate">{link.name}</span>
              <ChevronDown
                size={15}
                className={cn(
                  "transition-transform duration-200 shrink-0 text-neutral-400",
                  shouldShowChildren ? "rotate-180" : ""
                )}
                aria-hidden="true"
              />
            </>
          )}
        </button>

        {shouldShowChildren && (
          <div className="pr-1 pl-9 space-y-1">
            {link.children.map((child) => {
              const childActive = isChildLinkActive(location, child.path);

              return (
                <NavLink
                  key={child.path}
                  to={child.path}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-xl px-3 py-2.5 text-[13px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30",
                    childActive
                      ? "bg-emerald-50 font-semibold text-emerald-700"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                >
                  {child.name}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={link.path}
      onClick={onNavigate}
      title={collapsed ? link.name : undefined}
      className={baseItemClass}
    >
      {active && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 w-1 h-6 bg-emerald-600 rounded-r-full -translate-y-1/2"
        />
      )}

      <Icon size={18} className={iconClass} aria-hidden="true" />

      {!collapsed && (
        <span className="flex-1 min-w-0 truncate">{link.name}</span>
      )}
    </NavLink>
  );
});

// ───────────────────────────────────────────────────────────────────────────────
// Sidebar Section
// ───────────────────────────────────────────────────────────────────────────────

const SidebarContent = memo(function SidebarContent({
  links,
  role,
  collapsed,
  onToggleCollapse,
  onClose,
  onNavigate,
  isMobile,
  isLoading = false,
  hasError = false,
  onRetry,
}) {
  const cfg = ROLE_CONFIG[role];
  const RoleIcon = cfg?.Icon ?? Activity;
  const hasLinks = Array.isArray(links) && links.length > 0;

  return (
    <div className="flex flex-col h-full bg-white">
      <div
        className={cn(
          "sticky top-0 z-10 border-b backdrop-blur border-neutral-200 bg-white/90",
          collapsed
            ? "flex justify-center px-2 py-4"
            : "flex justify-between items-center px-5 py-4"
        )}
      >
        {!collapsed ? (
          <div className="flex gap-3 items-center min-w-0">
            <div className="flex overflow-hidden justify-center items-center w-11 h-11 rounded-2xl shadow-lg">
              <img
                src="/MediSync_Logo_3.png"
                alt="MediSync logo"
                className="object-cover w-full h-full"
              />
            </div>

            <div className="min-w-0">
              <span className="block text-lg font-bold tracking-tight leading-none">
                <span className="text-blue-600">Medi</span>
                <span className="text-emerald-600">Sync</span>
              </span>

              {cfg && (
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                  {cfg.badge}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex overflow-hidden justify-center items-center w-11 h-11 rounded-2xl shadow-lg">
            <img
              src="/MediSync_Logo_3.png"
              alt="MediSync logo"
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {!isMobile && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "p-2 rounded-xl transition duration-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30"
            )}
          >
            <ChevronLeft
              size={16}
              className={cn(
                "transition-transform duration-300",
                collapsed ? "rotate-180" : ""
              )}
              aria-hidden="true"
            />
          </button>
        )}

        {isMobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-2 rounded-xl transition duration-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {!collapsed && cfg && !isLoading && !hasError && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700">
            <RoleIcon size={14} aria-hidden="true" />
            <span>{cfg.label}</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <SidebarSkeleton collapsed={collapsed} />
      ) : hasError ? (
        <SidebarErrorState collapsed={collapsed} onRetry={onRetry} />
      ) : !hasLinks ? (
        <SidebarEmptyState collapsed={collapsed} />
      ) : (
        <nav
          className={cn(
            "overflow-y-auto flex-1 pb-4 mt-4",
            collapsed ? "px-2" : "px-3"
          )}
          aria-label={`${cfg?.label ?? "Sidebar"} navigation`}
        >
          <div className="space-y-1.5">
            {links.map((link) => (
              <NavItem
                key={link.path}
                link={link}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </nav>
      )}

      {!isLoading && !hasError && !collapsed && (
        <div className="px-4 pt-4 pb-5 mt-auto border-t border-neutral-200">
          <div className="p-4 to-white rounded-3xl border shadow-sm bg-linear-to-br border-neutral-200 from-neutral-50">
            <div className="flex gap-2 items-center mb-2">
              <div className="flex justify-center items-center w-8 h-8 text-emerald-600 bg-emerald-50 rounded-2xl">
                <HelpCircle size={15} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                  Need Help?
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-neutral-500">
              Contact support if you need help with appointments, records, or account issues.
            </p>

            <button
              type="button"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-100 hover:text-neutral-900 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30"
            >
              <LifeBuoy size={14} aria-hidden="true" />
              Contact Support
            </button>
          </div>
        </div>
      )}

      {!isLoading && !hasError && collapsed && (
        <div className="px-2 pt-4 pb-5 mt-auto border-t border-neutral-200">
          <button
            type="button"
            title="Contact Support"
            aria-label="Contact support"
            className="flex justify-center items-center mx-auto w-11 h-11 rounded-2xl transition duration-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30"
          >
            <LifeBuoy size={17} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
});

// ───────────────────────────────────────────────────────────────────────────────
// Main Sidebar
// ───────────────────────────────────────────────────────────────────────────────

const Sidebar = ({
  isLoading = false,
  error = false,
  onRetry,
}) => {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerRouteKey, setMobileDrawerRouteKey] = useState("");
  const locationKey = `${location.pathname}${location.search}`;

  const isAdmin = location.pathname.startsWith("/admin");
  const isDoctor = location.pathname.startsWith("/doctor");

  const role = isAdmin ? "admin" : isDoctor ? "doctor" : null;

  const links = useMemo(() => {
    if (isAdmin) return ADMIN_LINKS;
    if (isDoctor) return DOCTOR_LINKS;
    return [];
  }, [isAdmin, isDoctor]);

  const mobileOpen = mobileDrawerRouteKey === locationKey;
  const openMobile = useCallback(() => setMobileDrawerRouteKey(locationKey), [
    locationKey,
  ]);
  const closeMobile = useCallback(() => setMobileDrawerRouteKey(""), []);
  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (!role) return null;

  return (
    <>
      <button
        type="button"
        onClick={openMobile}
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        className="fixed bottom-5 left-5 z-50 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl transition duration-200 hover:scale-[1.03] hover:bg-emerald-700 active:scale-95 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
      >
        <AlignJustify size={20} aria-hidden="true" />
      </button>

      <div
        aria-hidden="true"
        onClick={closeMobile}
        className={cn(
          "fixed inset-0 z-40 backdrop-blur-sm transition duration-300 bg-neutral-950/40 lg:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white shadow-2xl transition-transform duration-300 w-[18rem] max-w-[85vw] lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent
          links={links}
          role={role}
          collapsed={false}
          onClose={closeMobile}
          onNavigate={closeMobile}
          isMobile
          isLoading={isLoading}
          hasError={Boolean(error)}
          onRetry={onRetry}
        />
      </div>

      <aside
        className="hidden sticky top-0 h-screen bg-white border-r shrink-0 border-neutral-200 lg:flex"
        style={{ width: collapsed ? "5.25rem" : "17rem" }}
        aria-label="Main sidebar"
      >
        <div className="w-full transition-all duration-300">
          <SidebarContent
            links={links}
            role={role}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
            onNavigate={closeMobile}
            isMobile={false}
            isLoading={isLoading}
            hasError={Boolean(error)}
            onRetry={onRetry}
          />
        </div>
      </aside>
    </>
  );
};

export default memo(Sidebar);
