import React, { useState, useEffect } from "react";
import { useMedical } from "../../records/MedicalContext"; // Reusing FileUploader if needed or just styling
import FileUploader from "../../records/components/FileUploader";

const PatientProfilePage = () => {
  const [formData, setFormData] = useState({
    name: "Rahul Verma",
    contact: "+91 98765 43210",
    address: "123, Green Park, South Delhi, 110016",
    bloodGroup: "O+",
    gender: "Male",
    dob: "1992-05-15",
    healthInfo: "No known allergies. Regular exercise.",
    profilePic: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=254"
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setEditing(false);
      setLoading(false);
      alert("Profile updated successfully!");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <img 
                src={formData.profilePic} 
                alt="Profile" 
                className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover border-4 border-white shadow-xl shadow-blue-100"
              />
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-xl shadow-lg flex items-center justify-center text-sm border-2 border-white hover:scale-110 transition-transform">
                📷
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">{formData.name}</h1>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Patient ID: #P-88291</p>
            </div>
          </div>
          {!editing && (
            <button 
              onClick={() => setEditing(true)}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Info */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-50 pb-4">Personal Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Name</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange} disabled={!editing}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 disabled:bg-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">DOB</label>
                  <input 
                    type="date" name="dob" value={formData.dob} onChange={handleChange} disabled={!editing}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 disabled:bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Gender</label>
                  <select 
                    name="gender" value={formData.gender} onChange={handleChange} disabled={!editing}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 disabled:bg-transparent cursor-pointer"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Address</label>
                <textarea 
                  name="address" value={formData.address} onChange={handleChange} disabled={!editing} rows="3"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 disabled:bg-transparent resize-none h-24"
                />
              </div>
            </div>
          </div>

          {/* Health Info */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-50 pb-4">Health Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Blood Group</label>
                <select 
                  name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} disabled={!editing}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 disabled:bg-transparent cursor-pointer"
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contact Number</label>
                <input 
                  type="text" name="contact" value={formData.contact} onChange={handleChange} disabled={!editing}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 disabled:bg-transparent"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Medical Notes</label>
                <textarea 
                  name="healthInfo" value={formData.healthInfo} onChange={handleChange} disabled={!editing} rows="3"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 disabled:bg-transparent resize-none h-36"
                />
              </div>
            </div>
          </div>

          {editing && (
            <div className="md:col-span-2 flex items-center justify-end gap-4 mt-4">
              <button 
                type="button" onClick={() => setEditing(false)}
                className="px-8 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-sm tracking-widest uppercase shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PatientProfilePage;
