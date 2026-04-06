import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Eye } from "lucide-react";
import { useModals } from "../ModalsContext";
import { useMedical } from "../../MedicalContext";
import { useAuth } from "../../../auth/context/AuthContext";
import toast from "react-hot-toast";
import { getPatientOptions } from "../../../profile/services/profileService";

/**
 * PrescriptionModal - Quick prescription issue/view modal for video consulting
 * Allows doctor to issue prescriptions without leaving video session
 */

const PrescriptionModal = () => {
  const { prescriptionModalOpen, closePrescriptionModal } = useModals();
  const { user } = useAuth();
  const { prescriptions, fetchAllPrescriptions, createPrescription } = useMedical();
  const previewRef = useRef(null);

  const [activeTab, setActiveTab] = useState("view");
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: "",
    appointmentId: "1",
    medicines: [{ medicineName: "", dosage: "", frequency: "", duration: "" }],
    instructions: "",
    validMonths: 3,
    prescriptionSize: "A4",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (prescriptionModalOpen) {
      fetchAllPrescriptions();
      getPatientOptions()
        .then((res) => setPatients(Array.isArray(res?.data) ? res.data : []))
        .catch(() => setPatients([]));
    }
  }, [prescriptionModalOpen, fetchAllPrescriptions]);

  if (!prescriptionModalOpen) return null;

  const updateMedicine = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.map((medicine, idx) =>
        idx === index ? { ...medicine, [field]: value } : medicine,
      ),
    }));
  };

  const addMedicineRow = () => {
    setFormData((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { medicineName: "", dosage: "", frequency: "", duration: "" }],
    }));
  };

  const removeMedicineRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, idx) => idx !== index),
    }));
  };

  const convertToImage = async () => {
    const html2canvas = (await import("html2canvas")).default;
    if (!previewRef.current) {
      throw new Error("Preview is not ready");
    }

    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
    });
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    const validMedicines = formData.medicines.filter((medicine) => medicine.medicineName.trim());

    if (!formData.patientId || validMedicines.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!user?.id) {
      toast.error("Doctor ID not found");
      return;
    }

    setSubmitting(true);
    try {
      const imageBlob = await convertToImage();
      const multipartFormData = new FormData();
      multipartFormData.append("patientId", formData.patientId);
      multipartFormData.append("appointmentId", formData.appointmentId);
      const validUntilDate = new Date();
      validUntilDate.setMonth(validUntilDate.getMonth() + Number(formData.validMonths));
      multipartFormData.append("image", imageBlob, `prescription_${Date.now()}.png`);
      multipartFormData.append("validUntil", validUntilDate.toISOString().split("T")[0]);

      await createPrescription(user.id, multipartFormData);

      toast.success("Prescription issued!");
      setFormData({
        patientId: "",
        appointmentId: "1",
        medicines: [{ medicineName: "", dosage: "", frequency: "", duration: "" }],
        instructions: "",
        validMonths: 3,
        prescriptionSize: "A4",
      });
      setActiveTab("view");
      fetchAllPrescriptions();
    } catch (err) {
      toast.error(err?.message || "Failed to issue prescription");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full h-[90vh] md:h-auto md:max-h-[80vh] md:w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
          <h3 className="text-lg md:text-xl font-black text-slate-800">
            💊 Prescription Manager
          </h3>
          <button
            onClick={closePrescriptionModal}
            className="p-2 hover:bg-slate-200 rounded-lg transition-all"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-4 md:px-6 bg-slate-50">
          <button
            onClick={() => setActiveTab("view")}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === "view"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Eye size={16} className="inline mr-1" /> View Prescriptions
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === "create"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Plus size={16} className="inline mr-1" /> Issue Prescription
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === "view" ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-500 mb-4">
                {prescriptions?.length || 0} prescription(s) issued
              </p>
              {prescriptions && prescriptions.length > 0 ? (
                prescriptions.map((rx, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <p className="font-bold text-slate-800">Patient #{rx.patientId}</p>
                    <p className="text-xs text-slate-500 mt-1">Doctor #{rx.doctorId}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Date: {new Date(rx.createdAt).toLocaleDateString()}
                    </p>
                    {rx.prescriptionUrl && (
                      <a
                        href={rx.prescriptionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        View Prescription
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">No prescriptions yet</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                  Patient *
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  value={formData.patientId}
                  onChange={(e) =>
                    setFormData({ ...formData, patientId: e.target.value })
                  }
                  required
                >
                  <option value="">Choose patient</option>
                  {patients.map((patient) => (
                    <option key={patient.userId} value={patient.userId}>{`${patient.userId} - ${patient.fullName}`}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400 uppercase">Medicines *</label>
                  <button type="button" onClick={addMedicineRow} className="text-xs font-bold text-blue-600 hover:text-blue-700">+ Add</button>
                </div>

                {formData.medicines.map((medicine, index) => (
                  <div key={`modal-medicine-${index}`} className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500">Medicine {index + 1}</p>
                      {formData.medicines.length > 1 && (
                        <button type="button" onClick={() => removeMedicineRow(index)} className="text-xs font-bold text-red-600 hover:text-red-700">Remove</button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Medicine name"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                      value={medicine.medicineName}
                      onChange={(e) => updateMedicine(index, "medicineName", e.target.value)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Dosage"
                        className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                        value={medicine.dosage}
                        onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Frequency"
                        className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                        value={medicine.frequency}
                        onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Duration"
                        className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                        value={medicine.duration}
                        onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Appointment ID
                  </label>
                  <input
                    type="text"
                    readOnly
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    value={formData.appointmentId}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Prescription Size
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    value={formData.prescriptionSize}
                    onChange={(e) =>
                      setFormData({ ...formData, prescriptionSize: e.target.value })
                    }
                  >
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                  Instructions
                </label>
                <textarea
                  rows="2"
                  placeholder="Special instructions..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                  Valid For
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  value={formData.validMonths}
                  onChange={(e) =>
                    setFormData({ ...formData, validMonths: e.target.value })
                  }
                >
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">1 Year</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all text-sm"
              >
                {submitting ? "Issuing..." : "Issue Prescription"}
              </button>

              <div ref={previewRef} style={{ position: "absolute", left: "-9999px", top: 0, width: formData.prescriptionSize === "A4" ? "794px" : "559px", background: "#fff", padding: "24px" }}>
                <h3 style={{ margin: 0, fontSize: "22px", fontWeight: 900 }}>PRESCRIPTION</h3>
                <p style={{ margin: "4px 0 12px", fontSize: "12px" }}>Doctor: {user?.name || "Doctor"}</p>
                <p style={{ margin: "4px 0 12px", fontSize: "12px" }}>Patient ID: {formData.patientId}</p>
                {formData.medicines.filter((m) => m.medicineName.trim()).map((m, i) => (
                  <p key={`modal-preview-${i}`} style={{ margin: "4px 0", fontSize: "12px" }}>{`${i + 1}. ${m.medicineName} | ${m.dosage || "-"} | ${m.frequency || "-"} | ${m.duration || "-"}`}</p>
                ))}
                {formData.instructions && <p style={{ marginTop: "10px", fontSize: "12px" }}>Instructions: {formData.instructions}</p>}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;
