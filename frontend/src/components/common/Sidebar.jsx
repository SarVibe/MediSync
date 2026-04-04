<<<<<<< HEAD
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
  { name: "Manage Users", path: "/admin/users", icon: Users },
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
  const Icon = link.icon;

  return (
    <NavLink
      to={link.path}
      title={collapsed ? link.name : undefined}
      className={({ isActive }) =>
        [
          "relative flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer group",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          collapsed ? "justify-center px-0 py-3 mx-1" : "px-3.5 py-2.5",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {/* Active pill */}
          {isActive && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary transition-all"
            />
          )}

          {/* Icon */}
          <Icon
            size={17}
            className="flex-shrink-0 transition-transform duration-150 group-hover:scale-110"
            style={{ color: isActive ? "var(--color-primary)" : undefined }}
            aria-hidden="true"
          />

          {/* Label */}
          {!collapsed && (
            <span className="leading-none truncate">{link.name}</span>
          )}
        </>
      )}
    </NavLink>
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
=======
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/**
 * Sidebar – Vertical navigation for Admin and Doctor.
 * Adapts links based on the role detected in the URL path.
 */
const Sidebar = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isDoctor = location.pathname.startsWith('/doctor');

  const links = isAdmin
    ? [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Appointments', path: '/admin/appointments', icon: '📅' },
        { name: 'Records', path: '/admin/records', icon: '📁' },
        { name: 'Prescriptions', path: '/admin/prescriptions', icon: '📜' },
        { name: 'Transactions', path: '/admin/payments', icon: '💸' },
        { name: 'Manage Users', path: '/admin/users', icon: '👥' },
      ]
    : isDoctor
    ? [
        { name: 'Dashboard', path: '/doctor/dashboard', icon: '📊' },
        { name: 'Appointments', path: '/doctor/appointments', icon: '📅' },
        { name: 'Patient Records', path: '/doctor/patient-records', icon: '🩺' },
        { name: 'Prescriptions', path: '/doctor/prescriptions', icon: '📜' },
        { name: 'Daily Schedule', path: '/doctor/schedule', icon: '⏳' },
        { name: 'Availability', path: '/doctor/availability', icon: '⚙️' },
        { name: 'My Profile', path: '/doctor/profile', icon: '👤' },
      ]
    : [];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-xl">+</span>
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">MediSync</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Need Help?</p>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">Contact our support team for any assistance.</p>
          <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
            Contact Support
          </button>
        </div>
      </div>
    </aside>
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
  );
};

export default Sidebar;
