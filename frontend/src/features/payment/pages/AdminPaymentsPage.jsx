import React, { useState } from "react";

const MOCK_TRANS = [
  { id: 1, patient: "Rahul Verma", doctor: "Arjun Sharma", amount: 52.50, status: "SUCCESS", date: "2026-03-25" },
  { id: 2, patient: "Ananya Singh", doctor: "Priya Nair", amount: 52.50, status: "SUCCESS", date: "2026-03-26" },
  { id: 3, patient: "Kiran Rao", doctor: "Arjun Sharma", amount: 52.50, status: "FAILED", date: "2026-03-27" },
];

const AdminPaymentsPage = () => {
  const [transactions, setTransactions] = useState(MOCK_TRANS);
  const [filter, setFilter] = useState("ALL");

  const filtered = transactions.filter(t => filter === "ALL" || t.status === filter);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Transaction History</h1>
            <p className="text-slate-500 font-medium mt-1">Audit platform revenue and monitor payment health.</p>
          </div>
          
          <div className="flex h-12 p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
            {["ALL", "SUCCESS", "FAILED"].map(f => (
              <button 
                key={f} onClick={() => setFilter(f)}
                className={`px-5 rounded-xl text-[10px] font-black tracking-widest transition-all ${filter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Revenue</p>
            <p className="text-3xl font-black text-slate-800">$105.00</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Success Rate</p>
            <p className="text-3xl font-black text-green-500">67%</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Today's Transactions</p>
             <p className="text-3xl font-black text-blue-600">12</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-800 capitalize">{t.patient}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Payment to Dr. {t.doctor}</p>
                  </td>
                  <td className="px-4 py-6 text-sm font-black text-slate-800">${t.amount.toFixed(2)}</td>
                  <td className="px-4 py-6 text-sm font-bold text-slate-500">{t.date}</td>
                  <td className="px-8 py-6 text-right">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${
                      t.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
