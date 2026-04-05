import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RecordCard from "../components/RecordCard";
import FilePreview from "../components/FilePreview";
import FilterBar from "../components/FilterBar";
import { useMedical } from "../MedicalContext";
import ConfirmationModal from "../../appointment/components/ConfirmationModal";

const MOCK_RECORDS = [
  { id: 1, type: "Lab Report", description: "Blood test results for routine annual checkup.", date: "2026-03-15", fileName: "blood_test_mar26.pdf" },
  { id: 2, type: "X-Ray", description: "Chest X-Ray for persistent cough symptoms.", date: "2026-02-10", fileName: "chest_xray.jpg" },
  { id: 3, type: "Scan", description: "MRI Scan of the lower back (L4-L5 region).", date: "2026-01-20", fileName: "mri_scan_back.pdf" },
];

const PatientRecordsPage = () => {
  const { records, fetchRecords, removeRecord, loading } = useMedical();
  const [localRecords, setLocalRecords] = useState(MOCK_RECORDS);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    fetchRecords().catch(() => {});
  }, [fetchRecords]);

  useEffect(() => {
    if (records.length > 0) setLocalRecords(records);
  }, [records]);

  const handleDelete = async () => {
    try {
      await removeRecord(deleteId);
      setLocalRecords(prev => prev.filter(r => r.id !== deleteId));
    } catch (err) { /* handled by context */ }
    setDeleteId(null);
  };

  const filtered = localRecords.filter(r => {
    const matchesSearch = r.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || r.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Medical Records</h1>
            <p className="text-slate-500 font-medium mt-1">Manage and view your uploaded health documents.</p>
          </div>
          <Link 
            to="/patient/upload-record" 
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            + Upload New
          </Link>
        </div>

        <FilterBar 
          onSearch={setSearchQuery} 
          onFilterChange={(key, val) => key === 'type' ? setFilterType(val) : null}
          types={["Lab Report", "X-Ray", "Scan", "Prescription", "Other"]}
        />

        {loading && filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Loading your records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
            <div className="text-6xl mb-6">📁</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No records found</h3>
            <p className="text-slate-400 max-w-sm mx-auto mb-8 font-medium">
              You haven't uploaded any medical records yet. Start by clicking the upload button above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(record => (
              <RecordCard 
                key={record.id} 
                record={record} 
                onPreview={setPreviewFile}
                onDelete={(r) => setDeleteId(r.id)}
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

      <ConfirmationModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete}
        title="Delete Medical Record"
        message="Are you sure you want to permanently delete this record? This action cannot be undone."
        confirmLabel="Delete Permanently"
        confirmStyle="danger"
      />
    </div>
  );
};

export default PatientRecordsPage;
