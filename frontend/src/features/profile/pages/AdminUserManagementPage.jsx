import React, { useState } from "react";

const MOCK_USERS = [
  { id: 1, name: "Rahul Verma", role: "PATIENT", status: "ACTIVE", email: "rahul@example.com" },
  { id: 2, name: "Dr. Arjun Sharma", role: "DOCTOR", status: "PENDING", email: "arjun@example.com" },
  { id: 3, name: "Ananya Singh", role: "PATIENT", status: "BLOCKED", email: "ananya@example.com" },
  { id: 4, name: "Dr. Priya Nair", role: "DOCTOR", status: "ACTIVE", email: "priya@example.com" },
];

const AdminUserManagementPage = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [filterRole, setFilterRole] = useState("ALL");
  const [search, setSearch] = useState("");

  const updateStatus = (id, newStatus) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
  };

  const filtered = users.filter(u => {
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">User Directory</h1>
          <p className="text-slate-500 font-medium mt-1">Manage platform users, approve doctor registrations, and control access.</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-4 mb-8 flex flex-col md:flex-row gap-4 shadow-xl shadow-slate-200/30">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text" placeholder="Search by name or email..." 
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 text-sm font-bold text-slate-700"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="px-6 py-3 rounded-2xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-600 cursor-pointer"
            value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="PATIENT">Patients</option>
            <option value="DOCTOR">Doctors</option>
          </select>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-400 font-bold">{u.email}</p>
                  </td>
                  <td className="px-4 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest ${
                      u.role === 'DOCTOR' ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-6">
                    <span className={`flex items-center gap-1.5 text-xs font-black ${
                      u.status === 'ACTIVE' ? 'text-green-500' : u.status === 'PENDING' ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-green-500' : u.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.status === 'PENDING' && (
                        <button 
                          onClick={() => updateStatus(u.id, 'ACTIVE')}
                          className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase hover:bg-green-100 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {u.status === 'ACTIVE' ? (
                        <button 
                          onClick={() => updateStatus(u.id, 'BLOCKED')}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase hover:bg-red-100 transition-colors"
                        >
                          Block
                        </button>
                      ) : u.status === 'BLOCKED' ? (
                        <button 
                          onClick={() => updateStatus(u.id, 'ACTIVE')}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase hover:bg-blue-100 transition-colors"
                        >
                          Unblock
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-4xl mb-4">🕵️‍♂️</p>
              <p className="text-slate-400 font-bold">No users found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagementPage;
