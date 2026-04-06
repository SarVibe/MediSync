import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useMedical } from "../MedicalContext";
import { useAuth } from "../../auth/context/AuthContext";
import { getPatientOptions } from "../../profile/services/profileService";

const DEFAULT_MEDICINE = {
  medicineName: "",
  dosage: "",
  frequency: "",
  duration: "",
};

const SIZE_CONFIG = {
  A4: { width: 794, minHeight: 1123 },
  A5: { width: 559, minHeight: 794 },
};

const CreatePrescriptionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createPrescription } = useMedical();
  const prescriptionRef = useRef(null);

  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientId: "",
    appointmentId: "1",
    medicines: [{ ...DEFAULT_MEDICINE }],
    instructions: "",
    validMonths: "3",
    prescriptionSize: "A4",
  });

  useEffect(() => {
    const loadPatients = async () => {
      setLoadingPatients(true);
      try {
        const response = await getPatientOptions();
        setPatients(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        toast.error("Failed to load patients");
      } finally {
        setLoadingPatients(false);
      }
    };
    loadPatients();
  }, []);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.userId === Number(formData.patientId)),
    [patients, formData.patientId],
  );

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
      medicines: [...prev.medicines, { ...DEFAULT_MEDICINE }],
    }));
  };

  const removeMedicineRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, idx) => idx !== index),
    }));
  };

  const convertToImage = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      if (!prescriptionRef.current) {
        throw new Error("Prescription form not found");
      }

      const size = SIZE_CONFIG[formData.prescriptionSize] || SIZE_CONFIG.A4;
      const canvas = await html2canvas(prescriptionRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: size.width,
        windowWidth: size.width,
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
      });
    } catch (error) {
      throw new Error("Failed to convert prescription to image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validMedicines = formData.medicines.filter((m) => m.medicineName.trim());
    if (!formData.patientId) {
      toast.error("Please select a patient");
      return;
    }
    if (validMedicines.length === 0) {
      toast.error("Add at least one medicine");
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
      multipartFormData.append("image", imageBlob, `prescription_${Date.now()}.png`);

      const validUntilDate = new Date();
      validUntilDate.setMonth(validUntilDate.getMonth() + Number(formData.validMonths));
      multipartFormData.append("validUntil", validUntilDate.toISOString().split("T")[0]);

      await createPrescription(user.id, multipartFormData);
      toast.success("Prescription issued successfully");
      navigate("/doctor/prescriptions");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to issue prescription");
    } finally {
      setSubmitting(false);
    }
  };

  const previewSize = SIZE_CONFIG[formData.prescriptionSize] || SIZE_CONFIG.A4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Issue Prescription</h1>
          <p className="text-slate-500 font-medium">Use patient profile data and add one or more medicines.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-800">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Select Patient *</label>
                      <select
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700"
                        value={formData.patientId}
                        onChange={(e) => setFormData((prev) => ({ ...prev, patientId: e.target.value }))}
                        disabled={loadingPatients}
                        required
                      >
                        <option value="">{loadingPatients ? "Loading patients..." : "Choose Patient..."}</option>
                        {patients.map((p) => (
                          <option key={p.userId} value={p.userId}>{`${p.userId} - ${p.fullName}`}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Appointment ID</label>
                      <input
                        type="text"
                        readOnly
                        value={formData.appointmentId}
                        className="w-full px-4 py-3 rounded-xl bg-slate-100 border-none outline-none font-bold text-slate-600"
                      />
                      <p className="mt-1 text-xs text-slate-400">Defaulted to 1 for now. You can integrate dynamic appointments later.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-800">Medicines</h3>
                    <button type="button" onClick={addMedicineRow} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200">+ Add Medicine</button>
                  </div>

                  {formData.medicines.map((medicine, index) => (
                    <div key={`medicine-${index}`} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/60">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Medicine {index + 1}</p>
                        {formData.medicines.length > 1 && (
                          <button type="button" onClick={() => removeMedicineRow(index)} className="text-xs font-bold text-red-600 hover:text-red-700">Remove</button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Medicine name"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                        value={medicine.medicineName}
                        onChange={(e) => updateMedicine(index, "medicineName", e.target.value)}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Dosage"
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                          value={medicine.dosage}
                          onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Frequency"
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                          value={medicine.frequency}
                          onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Duration"
                          className="px-3 py-2 rounded-lg bg-white border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                          value={medicine.duration}
                          onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Special Instructions</label>
                  <textarea
                    rows="3"
                    placeholder="Instructions for patient"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.instructions}
                    onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Valid For (Months)</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700"
                      value={formData.validMonths}
                      onChange={(e) => setFormData((prev) => ({ ...prev, validMonths: e.target.value }))}
                    >
                      <option value="1">1 Month</option>
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">1 Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Prescription Size</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700"
                      value={formData.prescriptionSize}
                      onChange={(e) => setFormData((prev) => ({ ...prev, prescriptionSize: e.target.value }))}
                    >
                      <option value="A4">A4</option>
                      <option value="A5">A5</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => navigate("/doctor/prescriptions")} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="button" onClick={() => setPreviewMode((prev) => !prev)} className="px-6 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200">
                  {previewMode ? "Close Preview" : "Preview"}
                </button>
                <button type="submit" disabled={submitting} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? "Converting & Uploading..." : "Issue Prescription"}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className={`sticky top-8 transition-all duration-300 ${previewMode ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-auto p-4">
                <div className="mb-3">
                  <h4 className="font-black text-slate-800">Prescription Preview</h4>
                  <p className="text-xs text-slate-500">Saved as PNG ({formData.prescriptionSize})</p>
                </div>

                <div style={{ width: "100%", overflowX: "auto" }}>
                  <div
                    ref={prescriptionRef}
                    style={{
                      width: `${previewSize.width}px`,
                      minHeight: `${previewSize.minHeight}px`,
                      background: "#ffffff",
                      padding: "32px",
                      boxSizing: "border-box",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      color: "#1e293b",
                    }}
                  >
                    <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 900 }}>PRESCRIPTION</h2>
                    <p style={{ marginTop: "6px", fontSize: "12px", color: "#64748b" }}>Digital Medical Prescription</p>
                    <hr style={{ margin: "16px 0 20px", borderColor: "#cbd5e1" }} />

                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Doctor</p>
                    <p style={{ margin: "2px 0 12px", fontWeight: 700 }}>{user?.name || "Doctor"}</p>

                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Patient</p>
                    <p style={{ margin: "2px 0 12px", fontWeight: 700 }}>{selectedPatient ? `${selectedPatient.userId} - ${selectedPatient.fullName}` : "Not selected"}</p>

                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Date</p>
                    <p style={{ margin: "2px 0 16px", fontWeight: 700 }}>{new Date().toLocaleDateString("en-IN")}</p>

                    <h3 style={{ margin: "16px 0 8px", fontSize: "15px", letterSpacing: "0.3px" }}>Medicines</h3>
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px" }}>
                      {formData.medicines.filter((m) => m.medicineName.trim()).length === 0 ? (
                        <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>[Medicine details will appear here]</p>
                      ) : (
                        formData.medicines
                          .filter((m) => m.medicineName.trim())
                          .map((medicine, index) => (
                            <div key={`preview-med-${index}`} style={{ marginBottom: index === formData.medicines.length - 1 ? 0 : "10px" }}>
                              <p style={{ margin: 0, fontWeight: 700 }}>{`${index + 1}. ${medicine.medicineName}`}</p>
                              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#475569" }}>{`Dosage: ${medicine.dosage || "-"} | Frequency: ${medicine.frequency || "-"} | Duration: ${medicine.duration || "-"}`}</p>
                            </div>
                          ))
                      )}
                    </div>

                    {formData.instructions && (
                      <>
                        <h3 style={{ margin: "16px 0 8px", fontSize: "15px" }}>Instructions</h3>
                        <p style={{ margin: 0, fontSize: "13px", color: "#334155", whiteSpace: "pre-wrap" }}>{formData.instructions}</p>
                      </>
                    )}

                    <p style={{ marginTop: "18px", fontSize: "12px", color: "#475569" }}>
                      Valid Until: {new Date(new Date().setMonth(new Date().getMonth() + Number(formData.validMonths))).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePrescriptionPage;
