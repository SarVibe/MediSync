import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import PrescriptionCard from "../components/PrescriptionCard";
import FilePreview from "../components/FilePreview";
import ConfirmationModal from "../../appointment/components/ConfirmationModal";
import { useMedical } from "../MedicalContext";
import { getAllPrescriptions } from "../services/recordService";
import {
  getDoctorOptions,
  getPatientOptions,
} from "../../profile/services/profileService";
import {
  organizeByMonth,
  getSortedMonthKeys,
  getMonthLabel,
  getValidityStatus,
} from "../utils/dateUtils";

/**
 * AdminPrescriptionsPage - Admin monitors all system prescriptions
 * Can view, filter, sort, and delete inappropriate prescriptions
 * Prescriptions organized by month
 */

const AdminPrescriptionsPage = () => {
  const { removePrescription } = useMedical();
  const [prescriptions, setPrescriptions] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterPatient, setFilterPatient] = useState("");
  const [loading, setLoading] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [presRes, docRes, patRes] = await Promise.all([
          getAllPrescriptions(),
          getDoctorOptions(),
          getPatientOptions(),
        ]);

        const doctorOptions = Array.isArray(docRes?.data)
          ? docRes.data.map((d) => ({ id: d.userId, name: d.fullName }))
          : [];
        const patientOptions = Array.isArray(patRes?.data)
          ? patRes.data.map((p) => ({ id: p.userId, name: p.fullName }))
          : [];

        const doctorNameById = new Map(doctorOptions.map((d) => [d.id, d.name]));
        const patientNameById = new Map(patientOptions.map((p) => [p.id, p.name]));

        const rows = Array.isArray(presRes)
          ? presRes.map((rx) => ({
              ...rx,
              doctorName: doctorNameById.get(rx.doctorId) || `Doctor #${rx.doctorId}`,
              patientName: patientNameById.get(rx.patientId) || `Patient #${rx.patientId}`,
              appointmentRef: rx.appointmentId ? `APT-${rx.appointmentId}` : "-",
            }))
          : [];

        setDoctors(doctorOptions);
        setPatients(patientOptions);
        setPrescriptions(rows);
      } catch (err) {
        toast.error("Failed to load prescriptions");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDelete = async () => {
    try {
      await removePrescription(deleteId);
      setPrescriptions((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success("Prescription deleted successfully");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete prescription"
      );
    } finally {
      setDeleteId(null);
    }
  };

  // Filter prescriptions
  const filtered = prescriptions.filter((p) => {
    const matchesSearch =
      p.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.appointmentRef?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDoctor =
      !filterDoctor || p.doctorId === Number(filterDoctor);
    const matchesPatient =
      !filterPatient || p.patientId === Number(filterPatient);

    return matchesSearch && matchesDoctor && matchesPatient;
  });

  // Organize by month
  const organizedPrescriptions = organizeByMonth(filtered);
  const sortedMonths = getSortedMonthKeys(organizedPrescriptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
            Prescription Monitoring
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Audit and manage all prescriptions issued on the platform.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-white rounded-3xl border border-slate-100 shadow-xl p-8">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search by patient name, doctor name, or reference..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium text-slate-700 placeholder-slate-400 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                  Filter by Doctor
                </label>
                <select
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold text-slate-700 cursor-pointer shadow-sm"
                  value={filterDoctor}
                  onChange={(e) => setFilterDoctor(e.target.value)}
                >
                  <option value="">All Doctors</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                  Filter by Patient
                </label>
                <select
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold text-slate-700 cursor-pointer shadow-sm"
                  value={filterPatient}
                  onChange={(e) => setFilterPatient(e.target.value)}
                >
                  <option value="">All Patients</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Prescriptions Display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-16 h-16 mb-6">
              <div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-spin"
                style={{ maskImage: "conic-gradient(transparent 25%, black)" }}
              />
            </div>
            <div className="text-center">
              <p className="text-slate-700 font-black text-lg">Scanning prescriptions...</p>
              <p className="text-slate-500 font-medium mt-1">This may take a moment</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-16 md:p-24 text-center">
            <div className="text-7xl mb-6">💊</div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
              No prescriptions found
            </h3>
            <p className="text-slate-600 max-w-md mx-auto font-medium text-lg">
              No prescriptions match your search criteria.
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
                    {organizedPrescriptions[monthKey].length} prescription
                    {organizedPrescriptions[monthKey].length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Prescriptions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {organizedPrescriptions[monthKey].map((prescription) => (
                    <div key={prescription.id} className="relative group">
                      {/* Validity Status Badge */}
                      {prescription.validUntil && (
                        <div className="absolute -top-3 left-5 z-20">
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md transition-all duration-200 group-hover:shadow-lg ${
                              getValidityStatus(prescription.validUntil).status === "ACTIVE"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700"
                                : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700"
                            }`}
                          >
                            {getValidityStatus(prescription.validUntil).status}
                          </span>
                        </div>
                      )}

                      <PrescriptionCard
                        prescription={prescription}
                        onPreview={setPreviewFile}
                        isAdmin
                        onDelete={(rx) => setDeleteId(rx.id)}
                      />
                    </div>
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
        title="Delete Prescription"
        message="This will permanently revoke/delete this prescription. Are you sure? This action cannot be undone."
        confirmLabel="Confirm Deletion"
        confirmStyle="danger"
      />
    </div>
  );
};

export default AdminPrescriptionsPage;
