import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PrescriptionCard from "../components/PrescriptionCard";
import FilePreview from "../components/FilePreview";
import FilterBar from "../components/FilterBar";
import { useMedical } from "../MedicalContext";

const MOCK_ISSUED = [
  { id: 201, patientName: "Rahul Verma", appointmentRef: "#APT-9821", date: "2026-03-22", validUntil: "2026-06-22", fileName: "rx_rahul_mar22.pdf" },
  { id: 202, patientName: "Ananya Singh", appointmentRef: "#APT-7723", date: "2026-03-25", validUntil: "2026-06-25", fileName: "rx_ananya_mar25.pdf" },
];

const DoctorPrescriptionsPage = () => {
  const { prescriptions, fetchPrescriptions, loading } = useMedical();
  const [localPres, setLocalPres] = useState(MOCK_ISSUED);
  const [previewFile, setPreviewFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPrescriptions({ doctorId: 'me' }).catch(() => {});
  }, [fetchPrescriptions]);

  useEffect(() => {
    if (prescriptions.length > 0) setLocalPres(prescriptions);
  }, [prescriptions]);

  const filtered = localPres.filter(p => 
    p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.appointmentRef.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Issued Prescriptions</h1>
            <p className="text-slate-500 font-medium mt-1">Manage and track prescriptions you've provided to patients.</p>
          </div>
          <Link 
            to="/doctor/prescriptions/create" 
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            + New Prescription
          </Link>
        </div>

        <FilterBar onSearch={setSearchQuery} />

        {loading && filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Loading prescriptions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
            <div className="text-6xl mb-6">📜</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No prescriptions issued yet</h3>
            <p className="text-slate-400 max-w-sm mx-auto font-medium">
              You haven't issued any digital prescriptions. Click the button above to create one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(prescription => (
              <PrescriptionCard 
                key={prescription.id} 
                prescription={prescription} 
                onPreview={setPreviewFile}
                onDownload={() => alert('Download starting...')}
              />
            ))}
          </div>
        )}
      </div>

      <FilePreview 
        file={previewFile} 
        isOpen={!!previewFile} 
        onClose={() => setPreviewFile(null)} 
      />
    </div>
  );
};

export default DoctorPrescriptionsPage;
