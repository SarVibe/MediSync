import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import PrescriptionCard from "../components/PrescriptionCard";
import FilePreview from "../components/FilePreview";
import FilterBar from "../components/FilterBar";
import { useMedical } from "../MedicalContext";
import { useAuth } from "../../auth/context/AuthContext";
import {
  organizeByMonth,
  getSortedMonthKeys,
  getMonthLabel,
  getValidityStatus,
} from "../utils/dateUtils";

const PatientPrescriptionsPage = () => {
  const { user } = useAuth();
  const { prescriptions, fetchPrescriptions, loading } = useMedical();
  const [previewFile, setPreviewFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch prescriptions on page load
  useEffect(() => {
    if (user?.id) {
      fetchPrescriptions(user.id).catch((err) => {
        console.error("Failed to fetch prescriptions:", err);
      });
    }
  }, [user?.id, fetchPrescriptions]);

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
      <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            My Prescriptions
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            View and download prescriptions issued by your doctors.
          </p>
        </div>

        <FilterBar onSearch={setSearchQuery} />

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
            <div className="text-6xl mb-6">💊</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No prescriptions yet
            </h3>
            <p className="text-slate-400 max-w-sm mx-auto font-medium">
              {prescriptions.length === 0
                ? "Your doctors haven't issued any digital prescriptions yet."
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
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              getValidityStatus(prescription.validUntil).color.split(
                                "-"
                              ).length > 2
                                ? `text-${getValidityStatus(prescription.validUntil).color.split(
                                    "-"
                                  )[1]}-${getValidityStatus(prescription.validUntil).color.split(
                                    "-"
                                  )[2]} bg-${getValidityStatus(prescription.validUntil).color.split(
                                    "-"
                                  )[1]}-100`
                                : "text-slate-500 bg-slate-100"
                            }`}
                          >
                            {getValidityStatus(prescription.validUntil).status}
                          </span>
                        </div>
                      )}

                      <PrescriptionCard
                        key={prescription.id}
                        prescription={prescription}
                        onPreview={setPreviewFile}
                        onDownload={() => {
                          if (prescription.prescriptionUrl) {
                            window.open(prescription.prescriptionUrl, "_blank");
                          } else {
                            toast.error("Prescription URL not available");
                          }
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
