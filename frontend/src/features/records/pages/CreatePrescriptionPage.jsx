import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUploader from "../components/FileUploader";
import { useMedical } from "../MedicalContext";

const CreatePrescriptionPage = () => {
  const navigate = useNavigate();
  const { createPrescription } = useMedical();
  const [method, setMethod] = useState("manual"); // manual or upload
  const [formData, setFormData] = useState({ 
    patientId: "", 
    appointmentId: "", 
    details: "",
    validMonths: 3
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Mocks for dropdowns
  const PATIENTS = [
    { id: 1, name: "Rahul Verma" },
    { id: 2, name: "Ananya Singh" }
  ];
  const APPOINTMENTS = [
    { id: 101, patientId: 1, desc: "#APT-9821 (Mar 22)" },
    { id: 102, patientId: 2, desc: "#APT-7723 (Mar 25)" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (method === 'upload' && !selectedFile) return alert("Please upload a file.");
    if (method === 'manual' && !formData.details) return alert("Please enter prescription details.");
    
    setSubmitting(true);
    try {
      const payload = { 
        ...formData, 
        method,
        fileName: selectedFile?.name || 'prescription_manual.pdf',
        date: new Date().toISOString().split('T')[0],
        validUntil: new Date(new Date().setMonth(new Date().getMonth() + Number(formData.validMonths))).toISOString().split('T')[0]
      };
      await createPrescription(payload);
      navigate("/doctor/prescriptions");
    } catch (err) {
      alert("Failed to issue prescription.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="h-1.5 w-full bg-blue-600" />
        
        <div className="p-8 md:p-12">
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-black text-slate-800 mb-2">Issue New Prescription</h1>
              <p className="text-sm text-slate-500 font-medium">Create a digital prescription or upload a scanned copy.</p>
            </div>
            
            <div className="flex p-1 bg-slate-100 rounded-xl self-start">
              <button 
                onClick={() => setMethod("manual")}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${method === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                📝 MANUAL
              </button>
              <button 
                onClick={() => setMethod("upload")}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${method === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                📤 UPLOAD SCANNED
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Select Patient</label>
                <select 
                  className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 cursor-pointer appearance-none"
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                  required
                >
                  <option value="">Choose Patient...</option>
                  {PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Linked Appointment</label>
                <select 
                  className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 cursor-pointer appearance-none"
                  value={formData.appointmentId}
                  onChange={(e) => setFormData({...formData, appointmentId: e.target.value})}
                  required
                >
                  <option value="">Select Appointment...</option>
                  {APPOINTMENTS.map(a => <option key={a.id} value={a.id}>{a.desc}</option>)}
                </select>
              </div>
            </div>

            {method === 'manual' ? (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Prescription Details</label>
                <textarea 
                  rows="6"
                  placeholder="Enter medications, dosage, and instructions..."
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 resize-none leading-relaxed"
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                />
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Upload Scan File</label>
                <FileUploader onFileSelect={setSelectedFile} />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Validity Duration</label>
              <div className="flex gap-4">
                {[1, 3, 6, 12].map(m => (
                  <button 
                    key={m}
                    type="button"
                    onClick={() => setFormData({...formData, validMonths: m})}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.validMonths === m ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'
                    }`}
                  >
                    {m} Month{m > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-4 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-xl font-black text-sm tracking-widest uppercase shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {submitting ? 'Issuing...' : 'Issue Prescription'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePrescriptionPage;
