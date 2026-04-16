import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FileUploader from "../components/FileUploader";
import { useMedical } from "../MedicalContext";
import { useAuth } from "../../auth/context/AuthContext";

const RECORD_TYPES = [
  { value: "LAB_REPORT", label: "Lab Report" },
  { value: "XRAY", label: "X-Ray" },
  { value: "MRI", label: "MRI Scan" },
  { value: "CT_SCAN", label: "CT Scan" },
  { value: "ULTRASOUND", label: "Ultrasound" },
  { value: "PRESCRIPTION", label: "Prescription" },
  { value: "DISCHARGE_SUMMARY", label: "Discharge Summary" },
  { value: "OTHER", label: "Other" },
];

const UploadRecordPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { uploadRecord } = useMedical();
  
  const [formData, setFormData] = useState({
    recordType: "LAB_REPORT",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      toast.error("User not authenticated");
      navigate("/auth/login");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    try {
      // Create FormData for multipart upload
      const multipartFormData = new FormData();
      multipartFormData.append("medicalDocument", selectedFile);
      multipartFormData.append("recordType", formData.recordType);
      multipartFormData.append("description", formData.description);

      // Upload using the context
      await uploadRecord(user.id, multipartFormData);
      
      toast.success("Record uploaded successfully!");
      navigate("/patient/records");
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to upload record";
      toast.error(errorMsg);
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 md:p-8">
      <div className="overflow-hidden w-full max-w-3xl bg-white rounded-3xl border shadow-2xl shadow-blue-100/40 border-slate-100">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />

        <div className="p-8 md:p-12">
          <div className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 p-6 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
              Personal Medical Archive
            </p>
            <h1 className="mt-2 mb-2 text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
              Upload Medical Record
            </h1>
            <p className="text-sm md:text-base font-medium text-slate-600">
              Securely store your health documents for future reference.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-xs font-black tracking-widest uppercase text-slate-500">
                  Record Type *
                </label>
                <select
                  className="px-4 py-3 w-full font-bold rounded-2xl border border-slate-200 appearance-none cursor-pointer outline-none bg-slate-50 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-700 transition-all duration-200"
                  value={formData.recordType}
                  onChange={(e) =>
                    setFormData({ ...formData, recordType: e.target.value })
                  }
                  required
                >
                  {RECORD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-xs font-black tracking-widest uppercase text-slate-500">
                Description
              </label>
              <textarea
                rows="3"
                placeholder="Briefly describe what this record is about (optional)..."
                className="px-4 py-3 w-full font-medium rounded-2xl border border-slate-200 outline-none resize-none bg-slate-50 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-700 transition-all duration-200"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block mb-2 text-xs font-black tracking-widest uppercase text-slate-500">
                File Upload *
              </label>
              <FileUploader onFileSelect={setSelectedFile} />
              {selectedFile && (
                <p className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 inline-flex px-3 py-1.5 rounded-full">
                  ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex gap-4 items-center pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 font-bold rounded-2xl transition-all text-slate-600 border border-slate-200 bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="flex-1 px-6 py-3 font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg transition-all shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:shadow-none"
              >
                {uploading ? (
                  <span className="flex gap-2 justify-center items-center">
                    <div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent" />
                    Uploading...
                  </span>
                ) : (
                  "Confirm Upload"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadRecordPage;
