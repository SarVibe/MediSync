import React, { createContext, useContext, useState } from "react";

/**
 * ModalsContext - Global state for overlay modals
 * Manages prescription and medical records modals without interrupting background tasks
 */

const ModalsContext = createContext();

export const ModalsProvider = ({ children }) => {
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [medicalRecordsModalOpen, setMedicalRecordsModalOpen] = useState(false);

  const openPrescriptionModal = () => {
    setPrescriptionModalOpen(true);
  };

  const closePrescriptionModal = () => {
    setPrescriptionModalOpen(false);
  };

  const openMedicalRecordsModal = () => {
    setMedicalRecordsModalOpen(true);
  };

  const closeMedicalRecordsModal = () => {
    setMedicalRecordsModalOpen(false);
  };

  const value = {
    prescriptionModalOpen,
    openPrescriptionModal,
    closePrescriptionModal,
    medicalRecordsModalOpen,
    openMedicalRecordsModal,
    closeMedicalRecordsModal,
  };

  return (
    <ModalsContext.Provider value={value}>{children}</ModalsContext.Provider>
  );
};

export const useModals = () => {
  const context = useContext(ModalsContext);
  if (!context) {
    throw new Error("useModals must be used within ModalsProvider");
  }
  return context;
};
