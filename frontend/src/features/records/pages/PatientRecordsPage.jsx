import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import RecordCard from "../components/RecordCard";
import FilePreview from "../components/FilePreview";
import FilterBar from "../components/FilterBar";
import { useMedical } from "../MedicalContext";
import { useAuth } from "../../auth/context/AuthContext";
import ConfirmationModal from "../../appointment/components/ConfirmationModal";
import { organizeByMonth, getSortedMonthKeys, getMonthLabel } from "../utils/dateUtils";

const PatientRecordsPage = () => {
  const { user } = useAuth();
  const { records, fetchRecords, removeRecord, loading } = useMedical();
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");

  // Fetch records on page load
  useEffect(() => {
    if (user?.id) {
      fetchRecords(user.id).catch((err) => {
        console.error("Failed to fetch records:", err);
      });
    }
  }, [user?.id, fetchRecords]);

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

    const matchesType = !filterType || r.recordType === filterType;

    return matchesSearch && matchesType;
  });

  // Organize by month
  const organizedRecords = organizeByMonth(filtered);
  const sortedMonths = getSortedMonthKeys(organizedRecords);

  // Get unique record types for filter
  const recordTypes = [...new Set(records.map((r) => r.recordType))].sort();

  if (loading && records.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold">Loading your medical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              My Medical Records
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              View and upload your medical records.
            </p>
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
          onFilterChange={(key, val) =>
            key === "type" ? setFilterType(val) : null
          }
          types={recordTypes}
        />

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
            <div className="text-6xl mb-6">📁</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No records found
            </h3>
            <p className="text-slate-400 max-w-sm mx-auto mb-8 font-medium">
              {records.length === 0
                ? "You have no medical records yet. Use the upload button to add one."
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
        title="Delete Medical Record"
        message="Are you sure you want to permanently delete this record? This action cannot be undone."
        confirmLabel="Delete Permanently"
        confirmStyle="danger"
      />
    </div>
  );
};

export default PatientRecordsPage;
