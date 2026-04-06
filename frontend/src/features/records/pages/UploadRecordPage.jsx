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
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-sky-400" />

        <div className="p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-800 mb-2">Upload Medical Record</h1>
            <p className="text-sm text-slate-500 font-medium">Securely store your health documents for future reference.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Record Type *
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 appearance-none cursor-pointer"
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
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Description
              </label>
              <textarea
                rows="3"
                placeholder="Briefly describe what this record is about (optional)..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                File Upload *
              </label>
              <FileUploader onFileSelect={setSelectedFile} />
              {selectedFile && (
                <p className="text-xs text-green-600 font-bold mt-2">
                  ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
