import React, { useState, useEffect } from "react";
import PrescriptionCard from "../components/PrescriptionCard";
import FilePreview from "../components/FilePreview";
import FilterBar from "../components/FilterBar";
import { useMedical } from "../MedicalContext";
import ConfirmationModal from "../../appointment/components/ConfirmationModal";

const AdminPrescriptionsPage = () => {
  const { fetchPrescriptions, removePrescription, loading } = useMedical();
  const [prescriptions, setPrescriptions] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPrescriptions({ admin: true }).catch(() => {});
    
    // Mocking all system prescriptions
    const mockData = [
      { id: 1, doctorName: "Arjun Sharma", patientName: "Rahul Verma", appointmentRef: "#APT-9821", date: "2026-03-22", validUntil: "2026-06-22", fileName: "rx_rahul.pdf" },
      { id: 2, doctorName: "Priya Nair", patientName: "Ananya Singh", appointmentRef: "#APT-7723", date: "2026-03-25", validUntil: "2026-06-25", fileName: "rx_ananya.pdf" },
    ];
    setPrescriptions(mockData);
  }, [fetchPrescriptions]);

  const handleDelete = async () => {
    try {
      await removePrescription(deleteId);
      setPrescriptions(prev => prev.filter(p => p.id !== deleteId));
    } catch (err) {}
    setDeleteId(null);
  };

  const filtered = prescriptions.filter(p => 
    p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.appointmentRef.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Prescription Monitoring</h1>
          <p className="text-slate-500 font-medium mt-1">Audit and manage all prescriptions issued on MediSync.</p>
        </div>

        <FilterBar onSearch={setSearchQuery} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Scanning prescriptions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(prescription => (
              <PrescriptionCard 
                key={prescription.id} 
                prescription={prescription} 
                onPreview={setPreviewFile}
                onDownload={() => alert('Download starting...')}
                isAdmin={true}
                onDelete={(p) => setDeleteId(p.id)}
              />
            ))}
          </div>
        )}
      </div>

      <FilePreview file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />

      <ConfirmationModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete}
        title="Delete Prescription"
        message="This will permanently revoke/delete this prescription. Are you sure? Inappropriate prescriptions should be deleted immediately."
        confirmLabel="Confirm Deletion"
        confirmStyle="danger"
      />
    </div>
  );
};

export default AdminPrescriptionsPage;
