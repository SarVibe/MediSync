import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Topbar from '../common/Topbar';

/**
 * DashboardLayout – Layout for Admin and Doctor roles.
 * Includes a sticky Sidebar and Topbar.
 */
const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
