import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import PrescriptionCard from "../components/PrescriptionCard";
import FilePreview from "../components/FilePreview";
import { useMedical } from "../MedicalContext";
import { useAuth } from "../../auth/context/AuthContext";
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

const DoctorPrescriptionsPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";
  const { user } = useAuth();
  const { prescriptions, fetchAllPrescriptions, loading } = useMedical();
  const [previewFile, setPreviewFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [patientFilter, setPatientFilter] = useState("");
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);

  const toAbsoluteUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const downloadPrescription = async (prescriptionUrl) => {
    if (!prescriptionUrl) {
      toast.error("Prescription URL not available");
      return;
    }

    const resolvedUrl = toAbsoluteUrl(prescriptionUrl);
    try {
      const response = await fetch(resolvedUrl);
      if (!response.ok) {
        throw new Error("Failed to download prescription");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const fileName = prescriptionUrl.split("/").pop() || "prescription";
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(resolvedUrl, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    fetchAllPrescriptions().catch(() => {
      toast.error("Failed to fetch prescriptions");
    });
    getDoctorOptions().then((res) => {
      setDoctorOptions(Array.isArray(res?.data) ? res.data : []);
    }).catch(() => setDoctorOptions([]));
    getPatientOptions().then((res) => {
      setPatientOptions(Array.isArray(res?.data) ? res.data : []);
    }).catch(() => setPatientOptions([]));
  }, [fetchAllPrescriptions]);

  const doctorNameById = new Map(
    doctorOptions.map((doctor) => [doctor.userId, doctor.fullName]),
  );
  const patientNameById = new Map(
    patientOptions.map((patient) => [patient.userId, patient.fullName]),
  );

  const filtered = prescriptions.filter((p) => {
    const doctorName = doctorNameById.get(p.doctorId) || "";
    const patientName = patientNameById.get(p.patientId) || "";
    const matchesSearch =
      p.patientId?.toString().includes(searchQuery) ||
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.appointmentId?.toString().includes(searchQuery) ||
      p.prescriptionUrl?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDoctor = !doctorFilter || p.doctorId === Number(doctorFilter);
    const matchesPatient = !patientFilter || p.patientId === Number(patientFilter);

    return matchesSearch && matchesDoctor && matchesPatient;
  });

  // Organize by month
  const organizedPrescriptions = organizeByMonth(filtered);
  const sortedMonths = getSortedMonthKeys(organizedPrescriptions);

  if (loading && prescriptions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold">Loading your issued prescriptions...</p>
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
              All Prescriptions
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              View and filter all prescriptions by doctor and patient.
            </p>
          </div>
          <Link
            to="/doctor/prescriptions/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            + New Prescription
          </Link>
        </div>

        <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
          <input
            type="text"
            placeholder="Search by doctor name, patient name, ID or appointment"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Doctors</option>
              {doctorOptions.map((doctor) => (
                <option key={doctor.userId} value={doctor.userId}>{`${doctor.userId} - ${doctor.fullName}`}</option>
              ))}
            </select>

            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Patients</option>
              {patientOptions.map((patient) => (
                <option key={patient.userId} value={patient.userId}>{`${patient.userId} - ${patient.fullName}`}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
            <div className="text-6xl mb-6">📜</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No prescriptions issued yet
            </h3>
            <p className="text-slate-400 max-w-sm mx-auto font-medium">
              {prescriptions.length === 0
                ? "You haven't issued any digital prescriptions. Click the button above to create one."
                : "No prescriptions match your search criteria."}
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
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600`}
                          >
                            {getValidityStatus(prescription.validUntil).status}
                          </span>
                        </div>
                      )}

                      <PrescriptionCard
                        prescription={{
                          ...prescription,
                          doctorName: doctorNameById.get(prescription.doctorId),
                          patientName: patientNameById.get(prescription.patientId),
                        }}
                        onPreview={setPreviewFile}
                        onDownload={() => {
                          downloadPrescription(prescription.prescriptionUrl);
                        }}
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
    </div>
  );
};

export default DoctorPrescriptionsPage;
