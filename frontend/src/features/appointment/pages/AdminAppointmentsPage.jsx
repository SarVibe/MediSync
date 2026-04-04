import React, { useState, useEffect } from "react";
import StatusBadge from "../components/StatusBadge";
import ConfirmationModal from "../components/ConfirmationModal";
import { useAppointment } from "../AppointmentContext";

// ── Mock data ─────────────────────────────────────────────────────────────
const MOCK_ALL = [
  { id:1, patientName:"Rahul Verma",  doctorName:"Dr. Arjun Sharma",  date:"2026-04-02", time:"09:00 AM", status:"BOOKED",    reason:"Chest pain"         },
  { id:2, patientName:"Ananya Singh", doctorName:"Dr. Priya Nair",    date:"2026-04-03", time:"10:30 AM", status:"ACCEPTED",  reason:"Routine check-up"   },
  { id:3, patientName:"Kiran Rao",    doctorName:"Dr. Ravi Kumar",    date:"2026-04-02", time:"02:00 PM", status:"PENDING",   reason:"Headaches"          },
  { id:4, patientName:"Deepak Nair",  doctorName:"Dr. Suresh Menon",  date:"2026-03-22", time:"11:00 AM", status:"COMPLETED", reason:"Follow-up ECG"      },
  { id:5, patientName:"Sneha Pillai", doctorName:"Dr. Lakshmi Rao",   date:"2026-04-05", time:"03:00 PM", status:"BOOKED",    reason:"Skin rash"          },
  { id:6, patientName:"Pradeep Iyer", doctorName:"Dr. Meena Pillai",  date:"2026-03-25", time:"09:30 AM", status:"CANCELLED", reason:"Fever"              },
  { id:7, patientName:"Nisha Thomas", doctorName:"Dr. Arjun Sharma",  date:"2026-04-08", time:"11:30 AM", status:"PENDING",   reason:"BP monitoring"      },
];

const ALL_STATUSES = ["All","BOOKED","PENDING","ACCEPTED","COMPLETED","CANCELLED"];

const DetailModal = ({ appt, onClose }) => {
  if (!appt) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-sky-400" />
        <div className="px-6 pt-6 pb-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Appointment Details</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
          </div>
          <dl className="space-y-3 text-sm">
            {[
              ["Patient",  appt.patientName],
              ["Doctor",   appt.doctorName],
              ["Date",     appt.date],
              ["Time",     appt.time],
              ["Reason",   appt.reason],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between gap-2">
                <dt className="text-slate-500 font-medium">{k}</dt>
                <dd className="text-slate-800 font-semibold text-right">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between items-center gap-2">
              <dt className="text-slate-500 font-medium">Status</dt>
              <dd><StatusBadge status={appt.status} /></dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

/**
 * AdminAppointmentsPage – /admin/appointments
 * Full appointment table with filters, cancel, override status, and detail modal.
 */
const AdminAppointmentsPage = () => {
  const { appointments, fetchAppointments, changeAppointment, cancelAppointment } = useAppointment();
  const [local,         setLocal]         = useState(MOCK_ALL);
  const [filterDoc,     setFilterDoc]     = useState("");
  const [filterPat,     setFilterPat]     = useState("");
  const [filterStatus,  setFilterStatus]  = useState("All");
  const [detailAppt,    setDetailAppt]    = useState(null);
  const [cancelTarget,  setCancelTarget]  = useState(null);
  const [overrideTarget,setOverrideTarget]= useState(null);
  const [newStatus,     setNewStatus]     = useState("BOOKED");
  const [actionLoad,    setActionLoad]    = useState(false);

  useEffect(() => {
    fetchAppointments().catch(() => {});
  }, []);                   // eslint-disable-line
  useEffect(() => {
    if (appointments.length > 0) setLocal(appointments);
  }, [appointments]);

  const filtered = local.filter((a) => {
    const docMatch = a.doctorName?.toLowerCase().includes(filterDoc.toLowerCase());
    const patMatch = a.patientName?.toLowerCase().includes(filterPat.toLowerCase());
    const stMatch  = filterStatus === "All" || a.status?.toUpperCase() === filterStatus;
    return docMatch && patMatch && stMatch;
  });

  // Cancel
  const handleCancel = async () => {
    setActionLoad(true);
    try { await cancelAppointment(cancelTarget.id); } catch {/* ok */}
    setLocal((p) => p.map((a) => a.id === cancelTarget.id ? { ...a, status:"CANCELLED" } : a));
    setActionLoad(false);
    setCancelTarget(null);
  };

  // Override
  const handleOverride = async () => {
    setActionLoad(true);
    try { await changeAppointment(overrideTarget.id, { status: newStatus }); } catch {/* ok */}
    setLocal((p) => p.map((a) => a.id === overrideTarget.id ? { ...a, status: newStatus } : a));
    setActionLoad(false);
    setOverrideTarget(null);
  };

  const statusColor = (s) => {
    const map = { BOOKED:"text-blue-600", PENDING:"text-yellow-600", ACCEPTED:"text-teal-600",
                  COMPLETED:"text-green-600", CANCELLED:"text-red-500" };
    return map[s?.toUpperCase()] || "text-slate-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-slate-800">Appointment Monitor</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage all appointments across the platform.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {ALL_STATUSES.filter(s => s !== "All").map((s) => (
            <div key={s} className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 text-center">
              <p className={`text-xl font-bold ${statusColor(s)}`}>
                {local.filter((a) => a.status?.toUpperCase() === s).length}
              </p>
              <p className="text-xs text-slate-500 capitalize">{s.toLowerCase()}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            placeholder="🔍 Filter by doctor…"
            value={filterDoc}
            onChange={(e) => setFilterDoc(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="🔍 Filter by patient…"
            value={filterPat}
            onChange={(e) => setFilterPat(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Patient","Doctor","Date","Time","Status","Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">No appointments found.</td>
                </tr>
              ) : (
                filtered.map((appt) => (
                  <tr key={appt.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{appt.patientName}</td>
                    <td className="px-4 py-3 text-slate-600">{appt.doctorName}</td>
                    <td className="px-4 py-3 text-slate-600">{appt.date}</td>
                    <td className="px-4 py-3 text-slate-600">{appt.time}</td>
                    <td className="px-4 py-3"><StatusBadge status={appt.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setDetailAppt(appt)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          View
                        </button>
                        {appt.status?.toUpperCase() !== "CANCELLED" && (
                          <button
                            onClick={() => setCancelTarget(appt)}
                            className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-200 hover:bg-red-100 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => { setOverrideTarget(appt); setNewStatus(appt.status || "BOOKED"); }}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-200 hover:bg-slate-100 transition-colors"
                        >
                          Override
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-right">
          Showing {filtered.length} of {local.length} appointments
        </p>
      </div>

      {/* Detail modal */}
      <DetailModal appt={detailAppt} onClose={() => setDetailAppt(null)} />

      {/* Cancel confirmation */}
      <ConfirmationModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        loading={actionLoad}
        title="Cancel Appointment"
        message={`Cancel appointment for ${cancelTarget?.patientName} with ${cancelTarget?.doctorName}?`}
        confirmLabel="Cancel Appointment"
        confirmStyle="danger"
      />

      {/* Override status modal */}
      {overrideTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOverrideTarget(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-sky-400" />
            <div className="px-6 pt-6 pb-7">
              <h2 className="text-lg font-bold text-slate-800 mb-1">Override Status</h2>
              <p className="text-sm text-slate-500 mb-4">
                Change status for <strong>{overrideTarget.patientName}</strong>&apos;s appointment.
              </p>
              <label className="text-xs font-medium text-slate-600 block mb-1">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white mb-5"
              >
                {["BOOKED","PENDING","ACCEPTED","COMPLETED","CANCELLED"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="flex justify-end gap-3">
                <button onClick={() => setOverrideTarget(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={handleOverride} disabled={actionLoad}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {actionLoad ? "Saving…" : "Apply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointmentsPage;
