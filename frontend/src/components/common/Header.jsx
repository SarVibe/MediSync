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
  );
};

export default Header;
