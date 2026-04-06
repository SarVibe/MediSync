import React, { useEffect } from "react";
import { X, FileText } from "lucide-react";
import { useModals } from "../ModalsContext";
import { useMedical } from "../../MedicalContext";
import { useAuth } from "../../../auth/context/AuthContext";

/**
 * MedicalRecordsModal - Quick access to medical records for video consulting
 * Allows doctor/patient to view records without leaving video session
 */

const MedicalRecordsModal = () => {
  const { medicalRecordsModalOpen, closeMedicalRecordsModal } = useModals();
  const { user } = useAuth();
  const { records, fetchRecords } = useMedical();

  // Fetch records when modal opens
  useEffect(() => {
    if (medicalRecordsModalOpen && user?.id) {
      fetchRecords(user.id);
    }
  }, [medicalRecordsModalOpen, user?.id]);

  if (!medicalRecordsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full h-[90vh] md:h-auto md:max-h-[80vh] md:w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-slate-50">
          <h3 className="text-lg md:text-xl font-black text-slate-800">
            📋 Medical Records
          </h3>
          <button
            onClick={closeMedicalRecordsModal}
            className="p-2 hover:bg-slate-200 rounded-lg transition-all"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-3">
            <p className="text-sm text-slate-500 mb-4">
              {records?.length || 0} record(s) available
            </p>
            {records && records.length > 0 ? (
              records.map((record, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">
                        {record.recordType || record.fileName}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {record.description}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {record.fileUrl && (
                      <a
                        href={record.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-all"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">No records available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsModal;
