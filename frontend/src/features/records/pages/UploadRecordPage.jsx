import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUploader from "../components/FileUploader";
import { useMedical } from "../MedicalContext";

const UploadRecordPage = () => {
  const navigate = useNavigate();
  const { uploadRecord } = useMedical();
  const [formData, setFormData] = useState({ type: "Lab Report", description: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a file.");
    
    setUploading(true);
    try {
      // In real scenario, we'd use FormData for multipart upload
      const payload = { ...formData, fileName: selectedFile.name, date: new Date().toISOString().split('T')[0] };
      await uploadRecord(payload);
      navigate("/patient/records");
    } catch (err) {
      alert("Failed to upload record.");
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
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Record Type</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 appearance-none cursor-pointer"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option>Lab Report</option>
                  <option>X-Ray</option>
                  <option>MRI Scan</option>
                  <option>Doctor Note</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
              <textarea 
                rows="3"
                placeholder="Briefly describe what this record is about..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">File Upload</label>
              <FileUploader onFileSelect={setSelectedFile} />
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
                ) : 'Confirm Upload'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadRecordPage;
