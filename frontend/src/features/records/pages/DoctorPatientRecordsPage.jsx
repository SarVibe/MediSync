import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import RecordCard from "../components/RecordCard";
import FilePreview from "../components/FilePreview";
import FilterBar from "../components/FilterBar";
import ConfirmationModal from "../../appointment/components/ConfirmationModal";
import { useMedical } from "../MedicalContext";
import { useAuth } from "../../auth/context/AuthContext";
import { organizeByMonth, getSortedMonthKeys, getMonthLabel } from "../utils/dateUtils";
import { getPatientOptions } from "../../profile/services/profileService";

const DoctorPatientRecordsPage = () => {
  const { user } = useAuth();
  const { records, fetchRecords, removeRecord, loading } = useMedical();
  
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await getPatientOptions();
        const options = Array.isArray(response?.data)
          ? response.data.map((p) => ({ id: p.userId, name: p.fullName }))
          : [];
        setPatients(options);
        if (options.length > 0) {
          setSelectedPatientId(options[0].id);
        }
      } catch (err) {
        toast.error("Failed to load patient list");
      }
    };

    loadPatients();
  }, []);

  // Fetch records for selected patient
  useEffect(() => {
    if (selectedPatientId) {
      fetchRecords(selectedPatientId).catch((err) => {
        console.error("Failed to fetch patient records:", err);
        toast.error("Failed to load patient records");
      });
    }
  }, [selectedPatientId, fetchRecords]);

  const handleDelete = async () => {
    try {
      await removeRecord(deleteId);
      toast.success("Record deleted successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete record");
    } finally {
      setDeleteId(null);
    }
  };

  // Filter records
  const filtered = records.filter((r) => {
    const matchesSearch =
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.recordType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.fileUrl?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Organize by month
  const organizedRecords = organizeByMonth(filtered);
  const sortedMonths = getSortedMonthKeys(organizedRecords);

  // Get selected patient name
  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              Patient Medical Records
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Review and manage patient medical documents.
            </p>
          </div>

          {patients.length > 0 && (
            <div className="flex items-center gap-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-xl">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Select Patient:
              </label>
              <select
                className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-bold text-slate-700 shadow-sm transition-all cursor-pointer"
                value={selectedPatientId || ""}
                onChange={(e) => setSelectedPatientId(Number(e.target.value))}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedPatient && (
          <div className="mb-8 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-2xl shadow-md">
            <p className="text-base font-semibold text-blue-900">
              Viewing records for <span className="font-black text-blue-700">{selectedPatient.name}</span>
            </p>
          </div>
        )}

        <FilterBar onSearch={setSearchQuery} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-spin" style={{ maskImage: 'conic-gradient(transparent 25%, black)' }} />
            </div>
            <div className="text-center">
              <p className="text-slate-700 font-black text-lg">Fetching patient records...</p>
              <p className="text-slate-500 font-medium mt-1">This may take a moment</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-16 md:p-24 text-center">
            <div className="text-7xl mb-6">🩺</div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
              No records found
            </h3>
            <p className="text-slate-600 max-w-md mx-auto font-medium text-lg">
              {records.length === 0
                ? "This patient hasn't uploaded any documents yet."
                : "No records match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {sortedMonths.map((monthKey) => (
              <div key={monthKey} className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-t-2 border-gradient from-blue-200 via-indigo-200 to-transparent pt-8">
                {/* Month Header */}
                <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-slate-100">
                  <h2 className="text-2xl md:text-3xl font-black text-blue-700 tracking-tighter">
                    {getMonthLabel(monthKey)}
                  </h2>
                  <div className="flex-grow h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-transparent rounded-full" />
                  <span className="text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 rounded-full shadow-md">
                    {organizedRecords[monthKey].length} record
                    {organizedRecords[monthKey].length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Records Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {organizedRecords[monthKey].map((record) => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      onPreview={setPreviewFile}
                      onDelete={(r) => setDeleteId(r.id)}
                      canDelete={true}
                    />
                  ))}
                </div>
              </div>
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
        title="Delete Patient Record"
        message="Are you sure you want to delete this patient's medical record? This action cannot be undone."
        confirmLabel="Delete Record"
        confirmStyle="danger"
      />
    </div>
  );
};

export default DoctorPatientRecordsPage;
