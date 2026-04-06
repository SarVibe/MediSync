import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Topbar from '../common/Topbar';
import { ModalsProvider } from '../../features/records/modals/ModalsContext';
import PrescriptionModal from '../../features/records/modals/components/PrescriptionModal';
import MedicalRecordsModal from '../../features/records/modals/components/MedicalRecordsModal';

/**
 * DashboardLayout – Layout for Admin and Doctor roles.
 * Includes a sticky Sidebar, Topbar, and modal overlays for quick access.
 */
const DashboardLayout = () => {
  return (
    <ModalsProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Topbar />
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
        
        {/* Overlay Modals */}
        <PrescriptionModal />
        <MedicalRecordsModal />
      </div>
    </ModalsProvider>
  );
};

export default DashboardLayout;
