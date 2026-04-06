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
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Patient Medical Records
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Review and manage patient medical documents.
            </p>
          </div>

          {patients.length > 0 && (
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Select Patient:
              </label>
              <select
                className="px-4 py-2.5 rounded-lg bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 shadow-sm transition-all cursor-pointer"
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
          <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm font-semibold text-blue-900">
              Viewing records for <span className="font-black">{selectedPatient.name}</span>
            </p>
          </div>
        )}

        <FilterBar onSearch={setSearchQuery} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Fetching patient records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
            <div className="text-6xl mb-6">🩺</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No records found
            </h3>
            <p className="text-slate-400 max-w-sm mx-auto font-medium">
              {records.length === 0
                ? "This patient hasn't uploaded any documents yet."
                : "No records match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {sortedMonths.map((monthKey) => (
              <div key={monthKey}>
                {/* Month Header */}
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-lg font-black text-slate-800">
                    {getMonthLabel(monthKey)}
                  </h2>
                  <div className="flex-grow h-px bg-gradient-to-r from-slate-200 to-transparent" />
                  <span className="text-sm font-bold text-slate-400">
                    {organizedRecords[monthKey].length} record
                    {organizedRecords[monthKey].length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Records Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
