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
  const [previewMode, setPreviewMode] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientId: "",
    appointmentId: "1",
    medicines: [{ ...DEFAULT_MEDICINE }],
    instructions: "",
    validMonths: "3",
    prescriptionSize: "A4",
  });

  const inputStyle =
    "w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm";

  const selectStyle =
    "w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-700 shadow-sm";

  const labelStyle =
    "block text-xs font-black text-slate-400 uppercase tracking-widest mb-2";

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
    try {
      const html2canvas = (await import("html2canvas")).default;

      const size =
        SIZE_CONFIG[formData.prescriptionSize] || SIZE_CONFIG.A4;

      const canvas = await html2canvas(prescriptionRef.current, {
        scale: 2,
        useCORS: true,
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

  const previewSize =
    SIZE_CONFIG[formData.prescriptionSize] || SIZE_CONFIG.A4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-2">
            Issue Prescription
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium">
            Create professional digital prescriptions with real-time preview.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORM */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white shadow-xl p-8 space-y-8">
                {/* Patient */}
                <div>
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
                        : "Choose Patient..."}
                    </option>
                    {patients.map((p) => (
                      <option key={p.userId} value={p.userId}>
                        {p.userId} - {p.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Medicines */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-slate-800">
                      Medicines
                    </h3>
                    <button
                      type="button"
                      onClick={addMedicineRow}
                      className="px-4 py-2 text-sm font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
                    >
                      + Add Medicine
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.medicines.map((medicine, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200 p-5 space-y-4 bg-white shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-black uppercase text-slate-500">
                            Medicine {index + 1}
                          </p>

                          {formData.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedicineRow(index)}
                              className="text-red-600 text-sm font-bold"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          placeholder="Medicine name"
                          className={inputStyle}
                          value={medicine.medicineName}
                          onChange={(e) =>
                            updateMedicine(
                              index,
                              "medicineName",
                              e.target.value
                            )
                          }
                        />

                        <div className="grid md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Dosage"
                            className={inputStyle}
                            value={medicine.dosage}
                            onChange={(e) =>
                              updateMedicine(
                                index,
                                "dosage",
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="text"
                            placeholder="Frequency"
                            className={inputStyle}
                            value={medicine.frequency}
                            onChange={(e) =>
                              updateMedicine(
                                index,
                                "frequency",
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="text"
                            placeholder="Duration"
                            className={inputStyle}
                            value={medicine.duration}
                            onChange={(e) =>
                              updateMedicine(
                                index,
                                "duration",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className={labelStyle}>Instructions</label>
                  <textarea
                    rows="4"
                    className={inputStyle}
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Valid Months</label>
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
                      <option value="12">1 Year</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelStyle}>Prescription Size</label>
                    <select
                      className={selectStyle}
                      value={formData.prescriptionSize}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          prescriptionSize: e.target.value,
                        }))
                      }
                    >
                      <option value="A4">A4</option>
                      <option value="A5">A5</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  {submitting
                    ? "Converting & Uploading..."
                    : "Issue Prescription"}
                </button>
              </div>
            </form>
          </div>

          {/* PREVIEW */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-3xl shadow-2xl p-5 overflow-auto">
                <h3 className="font-black text-slate-800 mb-4">
                  Live Preview
                </h3>

                <div className="overflow-x-auto">
                  <div
                    ref={prescriptionRef}
                    style={{
                      width: `${previewSize.width}px`,
                      minHeight: `${previewSize.minHeight}px`,
                      background: "#fff",
                      padding: "40px",
                      borderRadius: "16px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                      border: "1px solid #e2e8f0",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "30px",
                        fontWeight: 900,
                        color: "#1d4ed8",
                      }}
                    >
                      PRESCRIPTION
                    </h2>

                    <p style={{ color: "#64748b", marginTop: 8 }}>
                      Digital Medical Prescription
                    </p>

                    <hr style={{ margin: "20px 0" }} />

                    <p>
                      <strong>Doctor:</strong> {user?.name || "Doctor"}
                    </p>

                    <p>
                      <strong>Patient:</strong>{" "}
                      {selectedPatient
                        ? selectedPatient.fullName
                        : "Not selected"}
                    </p>

                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date().toLocaleDateString()}
                    </p>

                    <h3 style={{ marginTop: 20 }}>Medicines</h3>

                    {formData.medicines
                      .filter((m) => m.medicineName.trim())
                      .map((medicine, index) => (
                        <div key={index} style={{ marginBottom: 10 }}>
                          <strong>
                            {index + 1}. {medicine.medicineName}
                          </strong>
                          <p>
                            {medicine.dosage} | {medicine.frequency} |{" "}
                            {medicine.duration}
                          </p>
                        </div>
                      ))}

                    {formData.instructions && (
                      <>
                        <h3>Instructions</h3>
                        <p>{formData.instructions}</p>
                      </>
                    )}

                    <p style={{ marginTop: 30 }}>
                      <strong>Valid Until:</strong>{" "}
                      {new Date(
                        new Date().setMonth(
                          new Date().getMonth() +
                            Number(formData.validMonths)
                        )
                      ).toLocaleDateString()}
                    </p>

                    <div
                      style={{
                        marginTop: 80,
                        textAlign: "right",
                      }}
                    >
                      <p>Doctor Signature</p>
                      <div
                        style={{
                          width: 200,
                          borderBottom: "1px solid #000",
                          marginLeft: "auto",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* END PREVIEW */}
        </div>
      </div>
    </div>
  );
};

export default CreatePrescriptionPage;