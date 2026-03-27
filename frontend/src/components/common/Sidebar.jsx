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
  );
};

export default Sidebar;
