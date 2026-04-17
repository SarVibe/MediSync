import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import PrescriptionCard from "../components/PrescriptionCard";
import FilePreview from "../components/FilePreview";
import { useMedical } from "../MedicalContext";
import { useAuth } from "../../auth/context/AuthContext";
import { getDoctorOptions } from "../../profile/services/profileService";
import {
  organizeByMonth,
  getSortedMonthKeys,
  getMonthLabel,
  getValidityStatus,
} from "../utils/dateUtils";

const PatientPrescriptionsPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";
  const { user } = useAuth();
  const { prescriptions, fetchPrescriptions, loading } = useMedical();
  const [previewFile, setPreviewFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [doctorOptions, setDoctorOptions] = useState([]);

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

  // Fetch prescriptions on page load
  useEffect(() => {
    if (user?.id) {
      fetchPrescriptions(user.id).catch((err) => {
        console.error("Failed to fetch prescriptions:", err);
      });
    }
  }, [user?.id, fetchPrescriptions]);

  useEffect(() => {
    getDoctorOptions()
      .then((res) => {
        setDoctorOptions(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => {
        setDoctorOptions([]);
      });
  }, []);

  const doctorNameById = new Map(
    doctorOptions.map((doctor) => [doctor.userId, doctor.fullName]),
  );

  // Filter prescriptions
  const filtered = prescriptions.filter((p) => {
    const matchesSearch =
      p.doctorId?.toString().includes(searchQuery) ||
      p.appointmentId?.toString().includes(searchQuery) ||
      p.prescriptionUrl?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Organize by month
  const organizedPrescriptions = organizeByMonth(filtered);
  const sortedMonths = getSortedMonthKeys(organizedPrescriptions);

  if (loading && prescriptions.length === 0) {
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
            <p className="text-slate-700 font-black text-lg">Loading prescriptions...</p>
            <p className="text-slate-500 font-medium mt-1">This may take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 p-6 md:p-8 shadow-lg shadow-blue-100/40">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
            Digital Prescription Vault
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
            My Prescriptions
          </h1>
          <p className="text-slate-600 mt-3 text-lg font-medium">
            View and download prescriptions issued by your doctors.
          </p>
        </div>

        <div className="mb-8 bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block">
            Search Prescriptions
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search by doctor id, appointment id, or prescription URL..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium text-slate-700 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-16 md:p-24 text-center">
            <div className="text-7xl mb-6">💊</div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
              No prescriptions yet
            </h3>
            <p className="text-slate-600 max-w-md mx-auto font-medium text-lg">
              {prescriptions.length === 0
                ? "Your doctors haven't issued any digital prescriptions yet."
                : "No prescriptions match your search criteria."}
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
                                : getValidityStatus(prescription.validUntil).status.includes("EXPIRED")
                                  ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-700"
                                  : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700"
                            }`}
                          >
                            {getValidityStatus(prescription.validUntil).status}
                          </span>
                        </div>
                      )}

                      <PrescriptionCard
                        key={prescription.id}
                        prescription={{
                          ...prescription,
                          doctorName:
                            doctorNameById.get(prescription.doctorId) ||
                            prescription.doctorName ||
                            `Doctor #${prescription.doctorId}`,
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

export default PatientPrescriptionsPage;
