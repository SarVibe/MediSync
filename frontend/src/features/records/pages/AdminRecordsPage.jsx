import React, { useState, useEffect } from "react";
import RecordCard from "../components/RecordCard";
import FilePreview from "../components/FilePreview";
import FilterBar from "../components/FilterBar";
import { useMedical } from "../MedicalContext";

const AdminRecordsPage = () => {
  const { fetchRecords, loading } = useMedical();
  const [records, setRecords] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRecords({ admin: true }).catch(() => {});
    
    // Mocking all system records
    const mockData = [
      { id: 1, type: "Lab Report", description: "Blood test for Rahul Verma.", date: "2026-03-15", fileName: "blood_test.pdf", patientName: "Rahul Verma" },
      { id: 2, type: "X-Ray", description: "Chest X-Ray for Ananya Singh.", date: "2026-02-10", fileName: "chest_xray.jpg", patientName: "Ananya Singh" },
      { id: 3, type: "Scan", description: "MRI Scan for Kiran Rao.", date: "2026-01-20", fileName: "mri_scan.pdf", patientName: "Kiran Rao" },
    ];
    setRecords(mockData);
  }, [fetchRecords]);

  const filtered = records.filter(r => 
    r.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Records Monitor</h1>
          <p className="text-slate-500 font-medium mt-1">Global view of all medical records uploaded to the platform.</p>
        </div>

        <FilterBar onSearch={setSearchQuery} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Fethcing records...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(record => (
              <div key={record.id} className="relative group">
                <div className="absolute -top-2 left-6 px-2 py-0.5 bg-slate-800 text-white text-[10px] font-black uppercase rounded z-10 shadow-lg">
                  Patient: {record.patientName}
                </div>
                <RecordCard record={record} onPreview={setPreviewFile} />
              </div>
            ))}
          </div>
        )}
      </div>

      <FilePreview file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
};

export default AdminRecordsPage;
