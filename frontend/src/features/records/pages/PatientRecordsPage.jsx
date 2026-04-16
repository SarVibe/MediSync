import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import RecordCard from "../components/RecordCard";
import FilePreview from "../components/FilePreview";
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

    return matchesSearch;
  });

  // Organize by month
  const organizedRecords = organizeByMonth(filtered);
  const sortedMonths = getSortedMonthKeys(organizedRecords);

  if (loading && records.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-spin"
              style={{ maskImage: "conic-gradient(transparent 25%, black)" }}
            />
          </div>
          <div className="text-center">
            <p className="text-slate-700 font-black text-lg">Loading your medical records...</p>
            <p className="text-slate-500 font-medium mt-1">This may take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 p-6 md:p-8 shadow-lg shadow-blue-100/40 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
              Personal Medical Archive
            </p>
            <h1 className="mt-2 text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              My Medical Records
            </h1>
            <p className="text-slate-600 mt-3 text-lg font-medium">
              View and upload your medical records.
            </p>
          </div>
          <Link
            to="/patient/upload-record"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
          >
            + Upload New
          </Link>
        </div>

        <div className="mb-8 bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block">
            Search Records
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search by description, record type, or file URL..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium text-slate-700 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-16 md:p-24 text-center shadow-xl">
            <div className="text-7xl mb-6">📁</div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
              No records found
            </h3>
            <p className="text-slate-600 max-w-md mx-auto text-lg font-medium">
              {records.length === 0
                ? "You have no medical records yet. Use the upload button to add one."
                : "No records match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {sortedMonths.map((monthKey) => (
              <div
                key={monthKey}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-t-2 border-gradient from-blue-200 via-indigo-200 to-transparent pt-8"
              >
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
        title="Delete Medical Record"
        message="Are you sure you want to permanently delete this record? This action cannot be undone."
        confirmLabel="Delete Permanently"
        confirmStyle="danger"
      />
    </div>
  );
};

export default PatientRecordsPage;
