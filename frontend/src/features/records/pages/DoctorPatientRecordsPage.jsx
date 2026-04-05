import React, { useState, useEffect } from "react";
import RecordCard from "../components/RecordCard";
import FilePreview from "../components/FilePreview";
import FilterBar from "../components/FilterBar";
import { useMedical } from "../MedicalContext";

const MOCK_PATIENTS = [
  { id: 1, name: "Rahul Verma" },
  { id: 2, name: "Ananya Singh" },
];

const DoctorPatientRecordsPage = () => {
  const { fetchRecords, loading } = useMedical();
  const [records, setRecords] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0].id);
  const [previewFile, setPreviewFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // In a real app, we'd fetch records for the selected patient
    fetchRecords({ patientId: selectedPatient }).catch(() => {});
    
    // Mocking patient-specific data
    const mockData = [
      { id: 101, type: "Lab Report", description: "Blood work for Rahul Verma.", date: "2026-03-20", fileName: "rahul_blood_test.pdf", patientId: 1 },
      { id: 102, type: "X-Ray", description: "Chest X-Ray for Rahul Verma.", date: "2026-03-22", fileName: "rahul_xray.jpg", patientId: 1 },
      { id: 103, type: "MRI Scan", description: "Brain scan for Ananya Singh.", date: "2026-03-25", fileName: "ananya_mri.pdf", patientId: 2 },
    ];
    setRecords(mockData.filter(r => r.patientId === selectedPatient));
  }, [selectedPatient, fetchRecords]);

  const filtered = records.filter(r => 
    r.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Patient Records</h1>
            <p className="text-slate-500 font-medium mt-1">Review medical history and documents uploaded by patients.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Select Patient:</label>
            <select 
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 shadow-sm transition-all"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(Number(e.target.value))}
            >
              {MOCK_PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <FilterBar onSearch={setSearchQuery} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Fetching records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
            <div className="text-6xl mb-6">🩺</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No records found</h3>
            <p className="text-slate-400 max-w-sm mx-auto font-medium">
              This patient hasn't uploaded any documents or there are no records matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(record => (
              <RecordCard 
                key={record.id} 
                record={record} 
                onPreview={setPreviewFile}
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

export default DoctorPatientRecordsPage;
