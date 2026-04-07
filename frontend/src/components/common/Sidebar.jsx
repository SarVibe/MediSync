import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  AlignJustify,
  CalendarDays,
  CalendarClock,
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
  UserCog,
  Users,
  X,
} from "lucide-react";
import BrandLogo from "./BrandLogo";

// ─── Nav config ───────────────────────────────────────────────────────────────

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
    ]
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

// ─── Role label config ─────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  admin: { label: "Admin Panel", badge: "ADMIN", Icon: UserCog },
  doctor: { label: "Doctor Portal", badge: "DOCTOR", Icon: HeartPulse },
};

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({ link, collapsed }) {
  const location = useLocation();
  const Icon = link.icon;
  const hasChildren = link.children && link.children.length > 0;
  
  // A link is "active" if its path matches the current path exactly OR if it's a parent and one of its children is active
  const isActive = location.pathname === link.path || (hasChildren && location.pathname.startsWith(link.path));
  
  const [isOpen, setIsOpen] = useState(isActive);

  // Sync open state with active state (e.g. on manual navigation)
  useEffect(() => {
    if (isActive && !collapsed) setIsOpen(true);
  }, [isActive, collapsed]);

  const ItemContent = (
    <div
      title={collapsed ? link.name : undefined}
      className={[
        "relative flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer group",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        collapsed ? "justify-center px-0 py-3 mx-1" : "px-3.5 py-2.5",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900",
      ].join(" ")}
      onClick={() => hasChildren && !collapsed && setIsOpen(!isOpen)}
    >
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary transition-all"
        />
      )}

      <Icon
        size={17}
        className="flex-shrink-0 transition-transform duration-150 group-hover:scale-110"
        style={{ color: isActive ? "var(--color-primary)" : undefined }}
        aria-hidden="true"
      />

      {!collapsed && (
        <>
          <span className="leading-none truncate flex-1">{link.name}</span>
          {hasChildren && (
            <ChevronLeft
              size={14}
              className={`transition-transform duration-200 text-neutral-400 ${isOpen ? "-rotate-90" : ""}`}
            />
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-1">
      {hasChildren ? (
        ItemContent
      ) : (
        <NavLink to={link.path}>{() => ItemContent}</NavLink>
      )}

      {hasChildren && isOpen && !collapsed && (
        <div className="pl-9 pr-2 space-y-1 animate-in slide-in-from-top-1 duration-200">
          {link.children.map((child) => {
            const isChildActive = location.pathname === child.path.split("?")[0] && 
                                 location.search === (child.path.includes("?") ? child.path.substring(child.path.indexOf("?")) : "");
            
            return (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive: genericActive }) => {
                  const active = genericActive || isChildActive;
                  return [
                    "block px-3 py-2 text-[13px] rounded-lg transition-colors",
                    active 
                      ? "text-primary font-bold bg-primary/5" 
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                  ].join(" ");
                }}
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

// ─── Sidebar inner content ────────────────────────────────────────────────────

function SidebarContent({
  links,
  role,
  collapsed,
  onToggleCollapse,
  onClose,
  isMobile,
}) {
  const cfg = ROLE_CONFIG[role];
  const RoleIcon = cfg?.Icon ?? Activity;

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className={`flex items-center border-b border-neutral-100 ${collapsed ? "justify-center px-2 py-4" : "justify-between px-5 py-4"}`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandLogo size="md" />
            {cfg && (
              <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase leading-none mt-0.5 block">
                {cfg.badge}
              </span>
            )}
          </div>
        )}

        {collapsed && <BrandLogo size="sm" showText={false} />}

        {/* Collapse toggle — desktop only */}
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 flex-shrink-0 ${collapsed ? "mt-2" : ""}`}
          >
            <ChevronLeft
              size={15}
              className="transition-transform duration-300"
              style={{
                transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
              }}
              aria-hidden="true"
            />
          </button>
        )}

        {/* Close — mobile only */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── Role badge ──────────────────────────────────────────────────── */}
      {!collapsed && cfg && (
        <div className="px-4 pt-4">
          <div
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl"
            style={{
              background: "color-mix(in srgb, var(--color-primary) 8%, white)",
              color: "var(--color-primary)",
            }}
          >
            <RoleIcon size={13} aria-hidden="true" />
            {cfg.label}
          </div>
        </div>
      )}

      {/* ── Nav links ───────────────────────────────────────────────────── */}
      <nav
        className={`flex-1 overflow-y-auto mt-3 space-y-0.5 ${collapsed ? "px-1" : "px-3"}`}
        aria-label={`${cfg?.label ?? "Navigation"} menu`}
      >
        {links.map((link) => (
          <NavItem key={link.path} link={link} collapsed={collapsed} />
        ))}
      </nav>

      {/* ── Support card ────────────────────────────────────────────────── */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-5 mt-2 border-t border-neutral-100">
          <div className="p-4 bg-neutral-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle
                size={14}
                className="text-neutral-400"
                aria-hidden="true"
              />
              <p className="text-xs font-bold tracking-wider uppercase text-neutral-500">
                Need Help?
              </p>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-neutral-400">
              Contact our support team for any assistance.
            </p>
            <button className="w-full flex items-center justify-center gap-1.5 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 active:scale-[0.98] transition-all duration-150 shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              <LifeBuoy size={13} aria-hidden="true" />
              Contact Support
            </button>
          </div>
        </div>
      )}

      {/* Collapsed support icon */}
      {collapsed && (
        <div className="flex justify-center px-2 pt-3 pb-5 border-t border-neutral-100">
          <button
            aria-label="Contact support"
            title="Contact Support"
            className="flex items-center justify-center transition-colors duration-150 cursor-pointer w-9 h-9 rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <LifeBuoy size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Sidebar ──────────────────────────────────────────────────────────────

const Sidebar = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isDoctor = location.pathname.startsWith("/doctor");

  const role = isAdmin ? "admin" : isDoctor ? "doctor" : null;
  const links = isAdmin ? ADMIN_LINKS : isDoctor ? DOCTOR_LINKS : [];

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Close mobile drawer on route change
  useEffect(() => {
    closeMobile();
  }, [location.pathname, closeMobile]);

  // Lock body scroll when mobile open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Mobile toggle button (shown outside sidebar) ─────────────── */}
      <button
        onClick={openMobile}
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        className="fixed z-50 flex items-center justify-center w-12 h-12 text-white transition-transform duration-200 shadow-lg cursor-pointer bottom-5 left-5 lg:hidden rounded-2xl active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        style={{ background: "var(--color-primary)" }}
      >
        <AlignJustify size={20} aria-hidden="true" />
      </button>

      {/* ── Mobile backdrop ─────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={closeMobile}
        className="fixed inset-0 z-40 transition-opacity duration-300 cursor-pointer bg-neutral-900/30 backdrop-blur-sm lg:hidden"
        style={{
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
      />

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden"
        style={{
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <SidebarContent
          links={links}
          role={role}
          collapsed={false}
          onClose={closeMobile}
          isMobile
        />
      </div>

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-neutral-100 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex-shrink-0 overflow-hidden"
        style={{ width: collapsed ? "4.5rem" : "16rem" }}
        aria-label="Main sidebar"
      >
        <SidebarContent
          links={links}
          role={role}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((p) => !p)}
          isMobile={false}
        />
      </aside>
    </>
  );
};

export default Sidebar;
