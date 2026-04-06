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
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Prescription Monitoring
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Audit and manage all prescriptions issued on the platform.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search by patient name, doctor name, or reference..."
              className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 placeholder-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">
                  Filter by Doctor
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 cursor-pointer"
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
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">
                  Filter by Patient
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 cursor-pointer"
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
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Scanning prescriptions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
            <div className="text-6xl mb-6">💊</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No prescriptions found
            </h3>
            <p className="text-slate-400 max-w-sm mx-auto font-medium">
              No prescriptions match your search criteria.
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
                    {organizedPrescriptions[monthKey].length} prescription
                    {organizedPrescriptions[monthKey].length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Prescriptions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {organizedPrescriptions[monthKey].map((prescription) => (
                    <div key={prescription.id} className="relative">
                      {/* Validity Status Badge */}
                      {prescription.validUntil && (
                        <div className="absolute -top-3 left-4 z-20">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600">
                            {getValidityStatus(prescription.validUntil).status}
                          </span>
                        </div>
                      )}

                      {/* Doctor & Patient Info Badge */}
                      <div className="absolute top-4 right-4 z-20 text-right">
                        <p className="text-xs font-black text-slate-700 bg-white px-2 py-1 rounded shadow">
                          {prescription.doctorName}
                        </p>
                        <p className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded shadow mt-1">
                          Patient: {prescription.patientName}
                        </p>
                      </div>

                      <PrescriptionCard
                        prescription={prescription}
                        onPreview={setPreviewFile}
                        onDownload={() => {
                          if (prescription.prescriptionUrl) {
                            window.open(prescription.prescriptionUrl, "_blank");
                          } else {
                            toast.error(
                              "Prescription URL not available"
                            );
                          }
                        }}
                      />

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteId(prescription.id)}
                        className="absolute bottom-4 right-4 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-all"
                      >
                        🗑️ Delete
                      </button>
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
