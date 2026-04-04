import React, { useState, useEffect } from "react";
import AppointmentCard from "../components/AppointmentCard";
import ConfirmationModal from "../components/ConfirmationModal";
import { useAppointment } from "../AppointmentContext";

// ── Mock data ─────────────────────────────────────────────────────────────
const MOCK_APPOINTMENTS = [
  { id:1, patientName:"Rahul Verma",  date:"2026-04-02", time:"09:00 AM", reason:"Chest pain",          status:"PENDING"   },
  { id:2, patientName:"Ananya Singh", date:"2026-04-03", time:"10:30 AM", reason:"Routine check-up",     status:"ACCEPTED"  },
  { id:3, patientName:"Kiran Rao",    date:"2026-04-02", time:"02:00 PM", reason:"Shortness of breath",  status:"PENDING"   },
  { id:4, patientName:"Deepak Nair",  date:"2026-03-28", time:"11:00 AM", reason:"Follow-up ECG",        status:"COMPLETED" },
  { id:5, patientName:"Sneha Pillai", date:"2026-04-05", time:"03:00 PM", reason:"Blood pressure check", status:"ACCEPTED"  },
];

const GROUPS = [
  { key:"PENDING",   label:"Pending",   color:"bg-yellow-500" },
  { key:"ACCEPTED",  label:"Accepted",  color:"bg-teal-500"   },
  { key:"COMPLETED", label:"Completed", color:"bg-green-500"  },
];

/**
 * DoctorAppointmentsPage – /doctor/appointments
 * Shows all appointments grouped by status with Accept / Reject / Complete actions.
 */
const DoctorAppointmentsPage = () => {
  const { appointments, fetchAppointments, changeAppointment } = useAppointment();
  const [local,       setLocal]       = useState(MOCK_APPOINTMENTS);
  const [modal,       setModal]       = useState({ open:false, appt:null, action:null });
  const [actionLoad,  setActionLoad]  = useState(false);

  useEffect(() => {
    fetchAppointments().catch(() => {});
  }, []);                       // eslint-disable-line
  useEffect(() => {
    if (appointments.length > 0) setLocal(appointments);
  }, [appointments]);

  const openModal = (appt, action) => setModal({ open:true, appt, action });
  const closeModal = () => setModal({ open:false, appt:null, action:null });

  const handleConfirm = async () => {
    const { appt, action } = modal;
    const newStatus = action === "accept" ? "ACCEPTED" : action === "reject" ? "CANCELLED" : "COMPLETED";
    setActionLoad(true);
    try {
      await changeAppointment(appt.id, { status: newStatus });
    } catch {/* ok */} finally {
      setLocal((p) => p.map((a) => a.id === appt.id ? { ...a, status: newStatus } : a));
      setActionLoad(false);
      closeModal();
    }
  };

  const actionFor = (appt) => {
    const s = appt.status?.toUpperCase();
    const actions = [];
    if (s === "PENDING") {
      actions.push({ label:"✔ Accept", onClick:(a) => openModal(a,"accept"), style:"success" });
      actions.push({ label:"✘ Reject", onClick:(a) => openModal(a,"reject"), style:"danger"  });
    }
    if (s === "ACCEPTED") {
      actions.push({ label: "Start Session 📹", onClick: (a) => window.open(`/doctor/session/${a.id}`, '_blank'), style: "primary" });
      actions.push({ label: "Mark Complete", onClick: (a) => openModal(a, "complete") });
    }
    return actions;
  };

  const MODAL_META = {
    accept:   { title:"Accept Appointment",       msg:"Accept this appointment?",              label:"Accept",   style:"primary" },
    reject:   { title:"Reject Appointment",       msg:"Reject this appointment?",              label:"Reject",   style:"danger"  },
    complete: { title:"Mark as Completed",        msg:"Mark this appointment as completed?",   label:"Complete", style:"primary" },
  };
  const meta = MODAL_META[modal.action] || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">

        <div className="mb-7">
          <h1 className="text-3xl font-bold text-slate-800">Appointment Requests</h1>
          <p className="text-slate-500 text-sm mt-1">Review and respond to patient appointments.</p>
        </div>

        {/* Summary counts */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {GROUPS.map((g) => (
            <div key={g.key} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
              <div className={`w-2 h-2 rounded-full ${g.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-slate-800">
                {local.filter((a) => a.status?.toUpperCase() === g.key).length}
              </p>
              <p className="text-xs text-slate-500 font-medium">{g.label}</p>
            </div>
          ))}
        </div>

        {/* Grouped sections */}
        {GROUPS.map((g) => {
          const items = local.filter((a) => a.status?.toUpperCase() === g.key);
          return (
            <div key={g.key} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${g.color}`} />
                <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
                  {g.label} ({items.length})
                </h2>
              </div>
              {items.length === 0 ? (
                <p className="text-slate-400 text-sm pl-5">None</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((appt) => (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      viewMode="doctor"
                      actions={actionFor(appt)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmationModal
        isOpen={modal.open}
        onClose={closeModal}
        onConfirm={handleConfirm}
        loading={actionLoad}
        title={meta.title}
        message={meta.msg}
        confirmLabel={meta.label}
        confirmStyle={meta.style}
      />
    </div>
  );
};

export default DoctorAppointmentsPage;
