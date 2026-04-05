import React, { useState, useEffect } from "react";
import PrescriptionCard from "../components/PrescriptionCard";
import FilePreview from "../components/FilePreview";
import FilterBar from "../components/FilterBar";
import { useMedical } from "../MedicalContext";

const MOCK_PRESCRIPTIONS = [
  { id: 1, doctorName: "Arjun Sharma", appointmentRef: "#APT-9821", date: "2026-03-10", validUntil: "2026-06-10", fileName: "rx_sharma_mar10.pdf" },
  { id: 2, doctorName: "Priya Nair", appointmentRef: "#APT-7723", date: "2026-01-15", validUntil: "2026-04-15", fileName: "rx_nair_jan15.pdf" },
];

const PatientPrescriptionsPage = () => {
  const { prescriptions, fetchPrescriptions, loading } = useMedical();
  const [localPres, setLocalPres] = useState(MOCK_PRESCRIPTIONS);
  const [previewFile, setPreviewFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPrescriptions().catch(() => {});
  }, [fetchPrescriptions]);

  useEffect(() => {
    if (prescriptions.length > 0) setLocalPres(prescriptions);
  }, [prescriptions]);

  const filtered = localPres.filter(p => 
    p.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.appointmentRef.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Prescriptions</h1>
          <p className="text-slate-500 font-medium mt-1">View and download prescriptions issued by your doctors.</p>
        </div>

        <FilterBar onSearch={setSearchQuery} />

        {loading && filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Loading prescriptions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
            <div className="text-6xl mb-6">💊</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No prescriptions yet</h3>
            <p className="text-slate-400 max-w-sm mx-auto font-medium">
              Your doctors haven't issued any digital prescriptions yet. 
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

export default PatientPrescriptionsPage;
