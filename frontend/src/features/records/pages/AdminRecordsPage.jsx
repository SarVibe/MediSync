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
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            System Records Monitor
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Global view of all medical records uploaded to the platform.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search by patient name, description, or record type..."
              className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 placeholder-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">
                  Filter by Patient
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 cursor-pointer"
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
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">
                  Filter by Type
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 cursor-pointer"
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
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Fetching records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
            <div className="text-6xl mb-6">📁</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No records found
            </h3>
            <p className="text-slate-400 max-w-sm mx-auto font-medium">
              No records match your search criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.keys(recordsByPatient).map((patientId) => {
              const patientRecords = recordsByPatient[patientId];
              const patient = patients.find((p) => p.id === Number(patientId));

              return (
                <div key={patientId}>
                  {/* Patient Header */}
                  <div className="mb-4 pb-3 border-b-2 border-blue-200">
                    <h2 className="text-xl font-black text-slate-800">
                      👤 {patient?.name}
                    </h2>
                    <p className="text-sm text-slate-400 font-medium mt-1">
                      {patientRecords.length} record
                      {patientRecords.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Records Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {patientRecords.map((record) => (
                      <div key={record.id} className="relative">
                        <div className="absolute top-0 left-0 right-0 px-4 pt-2 z-20">
                          <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full">
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
