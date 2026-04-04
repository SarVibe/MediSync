import React, { useState } from "react";

const DoctorProfilePage = () => {
  const [formData, setFormData] = useState({
    name: "Arjun Sharma",
    gender: "Male",
    specialization: "Cardiology",
    qualifications: "MBBS, MD (Cardiology), DM",
    experience: "12",
    profilePic: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=254"
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
      alert("Doctor profile updated successfully!");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <img 
                src={formData.profilePic} 
                alt="Profile" 
                className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl shadow-blue-100"
              />
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-xl shadow-lg flex items-center justify-center text-sm border-2 border-white hover:scale-110 transition-transform">
                📷
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dr. {formData.name}</h1>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{formData.specialization}</p>
            </div>
          </div>
          {!editing && (
            <button 
              onClick={() => setEditing(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              Edit Professional Bio
            </button>
          )}
        </div>

        <form onSubmit={handleUpdate} className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-50 pb-4">Basic Info</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Display Name</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange} disabled={!editing}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 disabled:bg-transparent transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Gender</label>
                <select 
                  name="gender" value={formData.gender} onChange={handleChange} disabled={!editing}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 disabled:bg-transparent transition-all"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-50 pb-4">Professional Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Specialization</label>
                <input 
                  type="text" name="specialization" value={formData.specialization} onChange={handleChange} disabled={!editing}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 disabled:bg-transparent transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Experience (Years)</label>
                  <input 
                    type="number" name="experience" value={formData.experience} onChange={handleChange} disabled={!editing}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 disabled:bg-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Qualifications</label>
            <textarea 
              name="qualifications" value={formData.qualifications} onChange={handleChange} disabled={!editing} rows="3"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 disabled:bg-transparent resize-none transition-all"
            />
          </div>

          {editing && (
            <div className="md:col-span-2 flex items-center justify-end gap-4 pt-10 border-t border-slate-50">
              <button 
                type="button" onClick={() => setEditing(false)}
                className="px-8 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" disabled={loading}
                className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
