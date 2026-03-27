import React from 'react';
import { useLocation } from 'react-router-dom';
import NotificationDropdown from '../../features/notifications/components/NotificationDropdown';

/**
 * Topbar – Horizontal top header for Admin and Doctor dashboards.
 */
const Topbar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Guest", "role": "USER"}');

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard Overview';
    if (path.includes('appointments')) return 'Manage Appointments';
    if (path.includes('schedule')) return 'Daily Schedule';
    if (path.includes('availability')) return 'Availability Settings';
    return 'MediSync Portal';
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <h2 className="text-xl font-bold text-slate-800">{getPageTitle()}</h2>

      <div className="flex items-center gap-6">
        <NotificationDropdown />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{user.name}</p>
            <p className="text-xs font-medium text-slate-400 capitalize">{user.role.toLowerCase()}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white font-bold shadow-md">
            {user.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
