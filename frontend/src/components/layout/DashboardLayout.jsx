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
<<<<<<< HEAD
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
=======
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
>>>>>>> d5a0a0d5c42b043127f4712732c3ee089cb226e6
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
