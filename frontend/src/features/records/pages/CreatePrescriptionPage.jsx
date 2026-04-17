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
};

const PREVIEW_ZOOM = 0.5;

const CreatePrescriptionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createPrescription } = useMedical();
  const prescriptionRef = useRef(null);

  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientId: "",
    appointmentId: "1",
    medicines: [{ ...DEFAULT_MEDICINE }],
    instructions: "",
    validMonths: "3",
  });

  const inputStyle =
    "w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm text-slate-700";

  const selectStyle =
    "w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold text-slate-700 shadow-sm";

  const labelStyle =
    "block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5";

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
    [patients, formData.patientId]
  );

  const updateMedicine = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.map((medicine, idx) =>
        idx === index ? { ...medicine, [field]: value } : medicine
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
    let exportFrame;
    try {
      const html2canvas = (await import("html2canvas")).default;

      if (!prescriptionRef.current) {
        throw new Error("Prescription preview is not ready");
      }

      const size = SIZE_CONFIG.A4;

      exportFrame = document.createElement("iframe");
      exportFrame.setAttribute("aria-hidden", "true");
      exportFrame.style.position = "fixed";
      exportFrame.style.left = "-10000px";
      exportFrame.style.top = "0";
      exportFrame.style.width = `${size.width}px`;
      exportFrame.style.height = `${size.minHeight}px`;
      exportFrame.style.border = "0";
      exportFrame.style.pointerEvents = "none";

      document.body.appendChild(exportFrame);

      const frameDoc = exportFrame.contentDocument || exportFrame.contentWindow?.document;
      if (!frameDoc) {
        throw new Error("Failed to initialize export document");
      }

      frameDoc.open();
      frameDoc.write(`<!doctype html><html><head><style>html,body{margin:0;padding:0;background:#fff;}</style></head><body></body></html>`);
      frameDoc.close();

      const medicines = formData.medicines.filter((medicine) =>
        medicine.medicineName.trim()
      );
      const validUntilDate = new Date();
      validUntilDate.setMonth(validUntilDate.getMonth() + Number(formData.validMonths));

      frameDoc.body.innerHTML = `
        <div style="width:${size.width}px;min-height:${size.minHeight}px;margin:0 auto;box-sizing:border-box;background:#ffffff;padding:50px 55px;border:1px solid #e2e8f0;box-shadow:0 25px 50px -12px rgba(0,0,0,0.15);font-family:Georgia,'Times New Roman',serif;position:relative;overflow:hidden;color:#0f172a;">
          <div style="text-align:center;border-bottom:2px solid #1e293b;padding-bottom:24px;margin-bottom:32px;">
            <div style="display:flex;justify-content:center;margin-bottom:6px;transform:translateY(-2px);">
              <div style="width:80px;height:80px;background:#2563eb;color:#ffffff;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:37px;line-height:1;font-weight:900;">
                <span style="position:relative;top:-10px;display:inline-block;">MS</span>
              </div>
            </div>
            <h1 style="margin:0;font-size:30px;font-weight:700;letter-spacing:-0.02em;color:#0f172a;">MEDISYNC HEALTHCARE HOSPITAL</h1>
            <p style="margin:4px 0 0;font-size:18px;color:#475569;">Kangesanthurai Road, Jaffna, Sri Lanka</p>
            <div style="display:flex;justify-content:center;gap:32px;margin-top:16px;font-size:14px;color:#475569;">
              <p style="margin:0;">077 172 7374</p>
              <p style="margin:0;">info@medisync.lk</p>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
            <div>
              <div style="display:inline-flex;align-items:flex-start;justify-content:center;background:#dc2626;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.2em;padding:6px 24px;border-radius:4px;transform:translateX(3px) translateY(-3px);line-height:1;">
                <span style="position:relative;top:-8px;display:inline-block;">PRESCRIPTION</span>
              </div>
              <p style="margin:5px 0 0;font-size:14px;color:#64748b;">Digital Medical Prescription</p>
            </div>
            <div style="text-align:right;">
              <p style="margin:0;font-size:14px;color:#64748b;">Date</p>
              <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#0f172a;">${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:40px;font-size:14px;">
            <div>
              <p style="margin:0 0 4px;color:#64748b;">Consulting Doctor</p>
              <p style="margin:0;font-weight:700;color:#0f172a;">${doctorDisplayName}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#64748b;">MBBS • MD (Internal Medicine)</p>
            </div>
            <div style="text-align:right;">
              <p style="margin:0 0 4px;color:#64748b;">Patient</p>
              <p style="margin:0;font-weight:700;color:#0f172a;">${selectedPatient?.fullName || "Patient Name"}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#64748b;">ID: ${selectedPatient?.userId || "—"}</p>
            </div>
          </div>

          <div style="margin-bottom:40px;">
            <div style="border:1px solid #cbd5e1;border-radius:12px;overflow:hidden;">
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <thead>
                  <tr style="background:#f1f5f9;">
                    <th style="text-align:left;padding:16px 24px;border-bottom:1px solid #cbd5e1;font-weight:600;color:#334155;">No</th>
                    <th style="text-align:left;padding:16px 24px;border-bottom:1px solid #cbd5e1;font-weight:600;color:#334155;">Medicine Name</th>
                    <th style="text-align:left;padding:16px 24px;border-bottom:1px solid #cbd5e1;font-weight:600;color:#334155;">Dosage</th>
                    <th style="text-align:left;padding:16px 24px;border-bottom:1px solid #cbd5e1;font-weight:600;color:#334155;">Frequency</th>
                    <th style="text-align:left;padding:16px 24px;border-bottom:1px solid #cbd5e1;font-weight:600;color:#334155;">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  ${medicines.length > 0 ? medicines.map((medicine, index) => `
                    <tr>
                      <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;font-weight:500;color:#475569;">${index + 1}</td>
                      <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;font-weight:500;color:#0f172a;">${medicine.medicineName}</td>
                      <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;color:#475569;">${medicine.dosage || "—"}</td>
                      <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;color:#475569;">${medicine.frequency || "—"}</td>
                      <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;color:#475569;">${medicine.duration || "—"}</td>
                    </tr>
                  `).join("") : `
                    <tr>
                      <td colspan="5" style="padding:48px 24px;text-align:center;color:#94a3b8;">No medicines added yet</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>

          ${formData.instructions ? `
            <div style="margin-bottom:40px;background:#fffbeb;border:1px solid #fcd34d;border-radius:16px;padding:24px;">
              <p style="margin:0 0 12px;font-weight:600;color:#92400e;">Special Instructions</p>
              <p style="margin:0;color:#334155;line-height:1.6;white-space:pre-line;">${formData.instructions}</p>
            </div>
          ` : ""}

          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:48px;">
            <div>
              <p style="margin:0;font-size:12px;color:#64748b;">Valid Until</p>
              <p style="margin:4px 0 0;font-size:18px;font-weight:600;color:#0f172a;">${validUntilDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <div style="text-align:right;">
              <p style="margin:0 0 4px;font-size:12px;color:#64748b;">Authorized Signature</p>
              <p style="margin:0 0 4px;font-size:24px;line-height:1;color:#475569;font-family:'Brush Script MT','Lucida Handwriting',cursive;">${doctorNameWithoutTitle}</p>
              <div style="display:inline-block;width:208px;border-bottom:1px solid #1e293b;"></div>
              <p style="margin:4px 0 0;font-size:12px;color:#475569;">${doctorDisplayName}</p>
            </div>
          </div>

          <div style="position:absolute;bottom:32px;left:0;right:0;text-align:center;">
            <div style="font-size:10px;color:#94a3b8;letter-spacing:0.2em;">MEDISYNC HEALTHCARE HOSPITAL • Jaffna • This is a computer generated prescription</div>
          </div>
        </div>
      `;

      const frameContainer = frameDoc.body.firstElementChild;
      if (!frameContainer) {
        throw new Error("Failed to build export document");
      }

      const canvas = await html2canvas(frameContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: size.width,
        windowWidth: size.width,
        height: size.minHeight,
      });

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to generate image blob"));
            return;
          }
          resolve(blob);
        }, "image/png", 0.95);
      });
    } catch (error) {
      throw new Error(error?.message || "Failed to convert prescription to image");
    } finally {
      if (exportFrame && exportFrame.parentNode) {
        exportFrame.parentNode.removeChild(exportFrame);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validMedicines = formData.medicines.filter((m) =>
      m.medicineName.trim()
    );

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
      multipartFormData.append(
        "image",
        imageBlob,
        `prescription_${Date.now()}.png`
      );

      const validUntilDate = new Date();
      validUntilDate.setMonth(
        validUntilDate.getMonth() + Number(formData.validMonths)
      );

      multipartFormData.append(
        "validUntil",
        validUntilDate.toISOString().split("T")[0]
      );

      await createPrescription(user.id, multipartFormData);

      toast.success("Prescription issued successfully");
      navigate("/doctor/prescriptions");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to issue prescription"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const previewSize = SIZE_CONFIG.A4;

  const previewViewport = {
    width: Math.round(previewSize.width * PREVIEW_ZOOM),
    height: Math.round(previewSize.minHeight * PREVIEW_ZOOM),
  };

  const rawDoctorName = (user?.name || "Medical Officer").trim();
  const doctorNameWithoutTitle =
    rawDoctorName.replace(/^dr\.?\s*/i, "").trim() || "Medical Officer";
  const doctorDisplayName = `Dr. ${doctorNameWithoutTitle}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              Issue Prescription
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Create professional digital prescriptions with real-time preview
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FORM SECTION */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
                {/* Patient Selection */}
                <div className="mb-10">
                  <label className={labelStyle}>Select Patient *</label>
                  <select
                    className={selectStyle}
                    value={formData.patientId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        patientId: e.target.value,
                      }))
                    }
                  >
                    <option value="">
                      {loadingPatients
                        ? "Loading patients..."
                        : "Choose a patient..."}
                    </option>
                    {patients.map((p) => (
                      <option key={p.userId} value={p.userId}>
                        {p.userId} — {p.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Medicines Section */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">Medicines</h3>
                    <button
                      type="button"
                      onClick={addMedicineRow}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-2xl transition-all shadow-md"
                    >
                      <span>+</span> Add Medicine
                    </button>
                  </div>

                  <div className="space-y-6">
                    {formData.medicines.map((medicine, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-5"
                      >
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-slate-600">
                            Medicine {index + 1}
                          </p>
                          {formData.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedicineRow(index)}
                              className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          placeholder="Medicine Name (e.g. Paracetamol 500mg)"
                          className={inputStyle}
                          value={medicine.medicineName}
                          onChange={(e) =>
                            updateMedicine(index, "medicineName", e.target.value)
                          }
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Dosage</label>
                            <input
                              type="text"
                              placeholder="e.g. 1 tablet"
                              className={inputStyle}
                              value={medicine.dosage}
                              onChange={(e) =>
                                updateMedicine(index, "dosage", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Frequency</label>
                            <input
                              type="text"
                              placeholder="e.g. Twice daily"
                              className={inputStyle}
                              value={medicine.frequency}
                              onChange={(e) =>
                                updateMedicine(index, "frequency", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Duration</label>
                            <input
                              type="text"
                              placeholder="e.g. 5 days"
                              className={inputStyle}
                              value={medicine.duration}
                              onChange={(e) =>
                                updateMedicine(index, "duration", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-10">
                  <label className={labelStyle}>Additional Instructions / Advice</label>
                  <textarea
                    rows={5}
                    className={`${inputStyle} resize-y`}
                    placeholder="Take after meals. Avoid alcohol. Drink plenty of water..."
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        instructions: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyle}>Valid For</label>
                    <select
                      className={selectStyle}
                      value={formData.validMonths}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          validMonths: e.target.value,
                        }))
                      }
                    >
                      <option value="1">1 Month</option>
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelStyle}>Size</label>
                    <div className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 font-semibold text-slate-700 shadow-sm">
                      A4
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white font-bold text-lg rounded-3xl shadow-lg transition-all flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <>Converting to Image & Issuing Prescription...</>
                ) : (
                  <>Issue Digital Prescription</>
                )}
              </button>
            </form>
          </div>

          {/* LIVE PREVIEW */}
          <div className="lg:col-span-5">
            <div className="sticky top-8">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                  <h3 className="font-semibold tracking-wide">LIVE PREVIEW — A4 Size</h3>
                  <div className="text-xs px-3 py-1 bg-slate-800 rounded-full">
                    Size: A4
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className="mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                    style={{
                      width: `${previewViewport.width}px`,
                      height: `${previewViewport.height}px`,
                    }}
                  >
                    <div
                      style={{
                        width: `${previewSize.width}px`,
                        minHeight: `${previewSize.minHeight}px`,
                        transform: `scale(${PREVIEW_ZOOM})`,
                        transformOrigin: "top left",
                      }}
                    >
                      <div
                        ref={prescriptionRef}
                        style={{
                          width: `${previewSize.width}px`,
                          minHeight: `${previewSize.minHeight}px`,
                          background: "#ffffff",
                          margin: "0",
                          padding: "50px 55px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)",
                          fontFamily: "'Georgia', 'Times New Roman', serif",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                    {/* Hospital Header */}
                    <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
                      <div className="flex justify-center mb-3">
                        <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-4xl font-black">
                          MS
                        </div>
                      </div>
                      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        MEDISYNC HEALTHCARE HOSPITAL
                      </h1>
                      <p className="text-slate-600 mt-1 text-lg">
                        Kangesanthurai Road, Jaffna, Sri Lanka
                      </p>
                      <div className="flex justify-center gap-8 mt-4 text-sm text-slate-600">
                        <p>📞 077 172 7374</p>
                        <p>✉️ info@medisync.lk</p>
                      </div>
                    </div>

                    {/* Prescription Title & Info */}
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <div className="inline-block bg-red-600 text-white text-xs font-bold tracking-widest px-6 py-1.5 rounded">
                          PRESCRIPTION
                        </div>
                        <p className="text-slate-500 mt-2 text-sm">Digital Medical Prescription</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-slate-500">Date</p>
                        <p className="font-semibold text-slate-800">
                          {new Date().toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Doctor & Patient Info */}
                    <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
                      <div>
                        <p className="text-slate-500 mb-1">Consulting Doctor</p>
                        <p className="font-semibold text-slate-800">
                          {doctorDisplayName}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">MBBS • MD (Internal Medicine)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500 mb-1">Patient</p>
                        <p className="font-semibold text-slate-800">
                          {selectedPatient?.fullName || "Patient Name"}
                        </p>
                        <p className="text-xs text-slate-500">
                          ID: {selectedPatient?.userId || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Medicines Table */}
                    <div className="mb-10">
                      <div className="border border-slate-300 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-100">
                              <th className="text-left py-4 px-6 font-semibold text-slate-700 border-b">No</th>
                              <th className="text-left py-4 px-6 font-semibold text-slate-700 border-b">Medicine Name</th>
                              <th className="text-left py-4 px-6 font-semibold text-slate-700 border-b">Dosage</th>
                              <th className="text-left py-4 px-6 font-semibold text-slate-700 border-b">Frequency</th>
                              <th className="text-left py-4 px-6 font-semibold text-slate-700 border-b">Duration</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {formData.medicines
                              .filter((m) => m.medicineName.trim())
                              .map((medicine, index) => (
                                <tr key={index} className="hover:bg-slate-50">
                                  <td className="py-4 px-6 font-medium text-slate-600">{index + 1}</td>
                                  <td className="py-4 px-6 font-medium">{medicine.medicineName}</td>
                                  <td className="py-4 px-6 text-slate-600">{medicine.dosage || "—"}</td>
                                  <td className="py-4 px-6 text-slate-600">{medicine.frequency || "—"}</td>
                                  <td className="py-4 px-6 text-slate-600">{medicine.duration || "—"}</td>
                                </tr>
                              ))}
                            {formData.medicines.filter((m) => m.medicineName.trim()).length === 0 && (
                              <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400">
                                  No medicines added yet
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Instructions */}
                    {formData.instructions && (
                      <div className="mb-10 bg-amber-50 border border-amber-200 rounded-2xl p-6">
                        <p className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                          <span>⚠️</span> Special Instructions
                        </p>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                          {formData.instructions}
                        </p>
                      </div>
                    )}

                    {/* Validity */}
                    <div className="flex justify-between items-end mt-12">
                      <div>
                        <p className="text-xs text-slate-500">Valid Until</p>
                        <p className="font-semibold text-lg text-slate-800">
                          {new Date(
                            new Date().setMonth(
                              new Date().getMonth() + Number(formData.validMonths)
                            )
                          ).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Authorized Signature</p>
                        <p
                          className="text-2xl text-slate-700 leading-none mb-1"
                          style={{
                            fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                          }}
                        >
                          {doctorNameWithoutTitle}
                        </p>
                        <div className="inline-block w-52 border-b border-slate-800"></div>
                        <p className="text-xs text-slate-600 mt-1">{doctorDisplayName}</p>
                      </div>
                    </div>

                        {/* Footer */}
                        <div className="absolute bottom-8 left-0 right-0 text-center">
                          <div className="text-[10px] text-slate-400 tracking-widest">
                            MEDISYNC HEALTHCARE HOSPITAL • Jaffna • This is a computer generated prescription
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-slate-400 mt-4">
                Preview shown at 50% zoom. Export keeps full-resolution A4 size.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePrescriptionPage;