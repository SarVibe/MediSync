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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-spin" style={{ maskImage: 'conic-gradient(transparent 25%, black)' }} />
          </div>
          <div className="text-center">
            <p className="text-slate-700 font-black text-lg">Loading your prescriptions...</p>
            <p className="text-slate-500 font-medium mt-1">This may take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              All Prescriptions
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              View and filter all prescriptions by doctor and patient.
            </p>
          </div>
          <Link
            to="/doctor/prescriptions/create"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-3xl shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            + New Prescription
          </Link>
        </div>

        <div className="mb-8 bg-white rounded-3xl border border-slate-100 shadow-xl p-8">
          <input
            type="text"
            placeholder="Search by doctor name, patient name, ID or appointment"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm text-slate-700 mb-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold text-slate-700 shadow-sm"
            >
              <option value="">All Doctors</option>
              {doctorOptions.map((doctor) => (
                <option key={doctor.userId} value={doctor.userId}>{`${doctor.userId} - ${doctor.fullName}`}</option>
              ))}
            </select>

            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold text-slate-700 shadow-sm"
            >
              <option value="">All Patients</option>
              {patientOptions.map((patient) => (
                <option key={patient.userId} value={patient.userId}>{`${patient.userId} - ${patient.fullName}`}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-16 md:p-24 text-center">
            <div className="text-7xl mb-6">📜</div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
              No prescriptions issued yet
            </h3>
            <p className="text-slate-600 max-w-md mx-auto font-medium text-lg">
              {prescriptions.length === 0
                ? "You haven't issued any digital prescriptions. Click the button above to create one."
                : "No prescriptions match your search criteria."}
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
