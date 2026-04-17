import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import RecordCard from "../components/RecordCard";
import FilePreview from "../components/FilePreview";
import FilterBar from "../components/FilterBar";
import { getPatientOptions } from "../../profile/services/profileService";
import { getMedicalRecords } from "../services/recordService";

/**
 * AdminRecordsPage - Admin can view all system medical records
 * Admin can view, filter, and sort but cannot delete (only doctors can delete)
 * Records are organized by patient and month
 */

const AdminRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPatientId, setFilterPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        const response = await getPatientOptions();
        const options = Array.isArray(response?.data)
          ? response.data.map((p) => ({ id: p.userId, name: p.fullName }))
          : [];
        setPatients(options);

        const results = await Promise.allSettled(
          options.map((p) => getMedicalRecords(p.id))
        );

        const mergedRecords = results.flatMap((result, index) => {
          if (result.status !== "fulfilled" || !Array.isArray(result.value)) {
            return [];
          }

          const patient = options[index];
          return result.value.map((record) => ({
            ...record,
            patientId: record.patientId ?? patient.id,
            patientName: patient.name,
          }));
        });

        setRecords(mergedRecords);
      } catch (err) {
        toast.error("Failed to load records");
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  // Filter records
  const filtered = records.filter((r) => {
    const matchesSearch =
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.recordType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !filterType || r.recordType === filterType;
    const matchesPatient = !filterPatientId || r.patientId === Number(filterPatientId);

    return matchesSearch && matchesType && matchesPatient;
  });

  // Organize records by patient
  const recordsByPatient = {};
  filtered.forEach((record) => {
    if (!recordsByPatient[record.patientId]) {
      recordsByPatient[record.patientId] = [];
    }
    recordsByPatient[record.patientId].push(record);
  });

  // Sort records within each patient by date (newest first)
  Object.keys(recordsByPatient).forEach((patientId) => {
    recordsByPatient[patientId].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
  });

  // Get unique record types for filter
  const recordTypes = [...new Set(records.map((r) => r.recordType))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
            System Records Monitor
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Global view of all medical records uploaded to the platform.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-white rounded-3xl border border-slate-100 shadow-xl p-8">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search by patient name, description, or record type..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium text-slate-700 placeholder-slate-400 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                  Filter by Patient
                </label>
                <select
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold text-slate-700 cursor-pointer shadow-sm"
                  value={filterPatientId}
                  onChange={(e) => setFilterPatientId(e.target.value)}
                >
                  <option value="">All Patients</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                  Filter by Type
                </label>
                <select
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold text-slate-700 cursor-pointer shadow-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {recordTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Records Display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-16 h-16 mb-6">
              <div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-spin"
                style={{ maskImage: "conic-gradient(transparent 25%, black)" }}
              />
            </div>
            <div className="text-center">
              <p className="text-slate-700 font-black text-lg">Fetching records...</p>
              <p className="text-slate-500 font-medium mt-1">This may take a moment</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-16 md:p-24 text-center">
            <div className="text-7xl mb-6">📁</div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
              No records found
            </h3>
            <p className="text-slate-600 max-w-md mx-auto font-medium text-lg">
              No records match your search criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {Object.keys(recordsByPatient).map((patientId) => {
              const patientRecords = recordsByPatient[patientId];
              const patient = patients.find((p) => p.id === Number(patientId));

              return (
                <div
                  key={patientId}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-t-2 border-gradient from-blue-200 via-indigo-200 to-transparent pt-8"
                >
                  {/* Patient Header */}
                  <div className="mb-8 pb-6 border-b-2 border-slate-100 flex items-center gap-4">
                    <h2 className="text-2xl md:text-3xl font-black text-blue-700 tracking-tighter">
                      👤 {patient?.name}
                    </h2>
                    <div className="flex-grow h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-transparent rounded-full" />
                    <p className="text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 rounded-full shadow-md">
                      {patientRecords.length} record
                      {patientRecords.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Records Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patientRecords.map((record) => (
                      <div key={record.id} className="relative group">
                        <div className="absolute top-0 left-0 right-0 px-4 pt-2 z-20">
                          <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-[10px] font-black rounded-full shadow-sm tracking-wide uppercase">
                            {record.recordType?.replace(/_/g, " ")}
                          </span>
                        </div>

                        <RecordCard
                          record={record}
                          onPreview={setPreviewFile}
                          canDelete={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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

export default AdminRecordsPage;
