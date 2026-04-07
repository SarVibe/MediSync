import React, { useEffect, useMemo, useState } from "react";
import AppointmentCard from "../components/AppointmentCard";
import ConfirmationModal from "../components/ConfirmationModal";
import { useAppointment } from "../AppointmentContext";

const GROUPS = [
  { key: "BOOKED", label: "New Requests", color: "bg-yellow-500" },
  { key: "ACCEPTED", label: "Accepted", color: "bg-teal-500" },
  { key: "COMPLETED", label: "Completed", color: "bg-green-500" },
  { key: "CANCELLED", label: "Cancelled", color: "bg-red-500" },
];

const DoctorAppointmentsPage = () => {
  const { appointments, fetchAppointments, changeAppointment, loading } = useAppointment();
  const [local, setLocal] = useState([]);
  const [modal, setModal] = useState({ open: false, appt: null, action: null });
  const [actionLoad, setActionLoad] = useState(false);

  useEffect(() => {
    fetchAppointments().catch(() => {
      setLocal([]);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLocal(Array.isArray(appointments) ? appointments : []);
  }, [appointments]);

  const groupedCounts = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        count: local.filter((appointment) => appointment.status?.toUpperCase() === group.key).length,
      })),
    [local],
  );

  const openModal = (appt, action) => setModal({ open: true, appt, action });
  const closeModal = () => setModal({ open: false, appt: null, action: null });

  const handleConfirm = async () => {
    const { appt, action } = modal;
    const newStatus =
      action === "accept" ? "ACCEPTED" : action === "reject" ? "CANCELLED" : "COMPLETED";

    setActionLoad(true);
    try {
      const updated = await changeAppointment(appt.id, { status: newStatus });
      setLocal((current) =>
        current.map((item) => (item.id === appt.id ? updated : item)),
      );
    } finally {
      setActionLoad(false);
      closeModal();
    }
  };

  const actionFor = (appointment) => {
    const status = appointment.status?.toUpperCase();
    const actions = [];

    if (status === "BOOKED") {
      actions.push({
        label: "Accept",
        onClick: (item) => openModal(item, "accept"),
        style: "success",
      });
      actions.push({
        label: "Reject",
        onClick: (item) => openModal(item, "reject"),
        style: "danger",
      });
    }

    if (status === "ACCEPTED") {
      actions.push({
        label: "Start Session",
        onClick: (item) => window.open(`/doctor/session/${item.id}`, "_blank"),
        style: "primary",
      });
      actions.push({
        label: "Mark Complete",
        onClick: (item) => openModal(item, "complete"),
      });
    }

    return actions;
  };

  const MODAL_META = {
    accept: {
      title: "Accept Appointment",
      msg: "Accept this appointment?",
      label: "Accept",
      style: "primary",
    },
    reject: {
      title: "Reject Appointment",
      msg: "Reject this appointment?",
      label: "Reject",
      style: "danger",
    },
    complete: {
      title: "Mark as Completed",
      msg: "Mark this appointment as completed?",
      label: "Complete",
      style: "primary",
    },
  };

  const meta = MODAL_META[modal.action] || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-slate-800">Appointment Requests</h1>
          <p className="mt-1 text-sm text-slate-500">Review and respond to patient appointments.</p>
        </div>

        <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
          {groupedCounts.map((group) => (
            <div key={group.key} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <div className={`mx-auto mb-2 h-2 w-2 rounded-full ${group.color}`} />
              <p className="text-2xl font-bold text-slate-800">{group.count}</p>
              <p className="text-xs font-medium text-slate-500">{group.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
        ) : local.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-400">
            No patient appointments for this doctor yet.
          </div>
        ) : (
          GROUPS.map((group) => {
            const items = local.filter((appointment) => appointment.status?.toUpperCase() === group.key);
            return (
              <div key={group.key} className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${group.color}`} />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                    {group.label} ({items.length})
                  </h2>
                </div>

                {items.length === 0 ? (
                  <p className="pl-5 text-sm text-slate-400">None</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {items.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        viewMode="doctor"
                        actions={actionFor(appointment)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
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
