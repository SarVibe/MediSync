import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import StatusBadge from "../components/StatusBadge";
import ConfirmationModal from "../components/ConfirmationModal";
import CalendarView from "../components/CalendarView";
import TimeSlotPicker from "../components/TimeSlotPicker";
import {
  getAllAppointments,
  rescheduleAppointment,
  updateAppointmentStatus,
} from "../services/appointmentService";
import { getDoctorAvailability } from "../services/doctorService";
import { getTransactionHistory, refundTransaction } from "../../payment/services/paymentService";

const ALL_STATUSES = ["All", "BOOKED", "ACCEPTED", "RESCHEDULED", "COMPLETED", "REJECTED", "CANCELLED", "EXPIRED"];

const buildBookingBoundaryDate = (days) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
};

const buildAppointmentTransactionMap = (transactions) => {
  return (Array.isArray(transactions) ? transactions : []).reduce((acc, transaction) => {
    if (!transaction?.appointmentId) {
      return acc;
    }

    const current = acc[transaction.appointmentId];
    const currentTime = current?.createdAt ? new Date(current.createdAt).getTime() : 0;
    const nextTime = transaction?.createdAt ? new Date(transaction.createdAt).getTime() : 0;

    if (!current || nextTime >= currentTime) {
      acc[transaction.appointmentId] = transaction;
    }
    return acc;
  }, {});
};

const DetailModal = ({ appt, tx, refunding, onRefund, onClose }) => {
  if (!appt) return null;
  const status = appt.status?.toUpperCase();
  const refundedAmountMinor = tx?.refundedAmountMinor || 0;
  const canRefundFromDetails =
    (status === "CANCELLED" || status === "REJECTED") &&
    tx?.status === "PAID" &&
    refundedAmountMinor === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-sky-400" />
        <div className="px-6 pt-6 pb-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Appointment Details</h2>
            <button onClick={onClose} className="text-xl leading-none text-slate-400 hover:text-slate-600">
              x
            </button>
          </div>
          <dl className="space-y-3 text-sm">
            {[
              ["Patient", appt.patientName],
              ["Doctor", appt.doctorName],
              ["Date", appt.date],
              ["Time", appt.time],
              ["Reason", appt.reason],
              ["Status Reason", appt.cancellationReason],
            ]
              .filter(([, value]) => value)
              .map(([key, value]) => (
                <div key={key} className="flex justify-between gap-2">
                  <dt className="font-medium text-slate-500">{key}</dt>
                  <dd className="text-right font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            <div className="flex items-center justify-between gap-2">
              <dt className="font-medium text-slate-500">Status</dt>
              <dd><StatusBadge status={appt.status} /></dd>
            </div>
            {tx ? (
              <>
                <div className="flex justify-between gap-2">
                  <dt className="font-medium text-slate-500">Payment</dt>
                  <dd className="text-right font-semibold text-slate-800">LKR {tx.amount || 0}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="font-medium text-slate-500">Refunded</dt>
                  <dd className="text-right font-semibold text-emerald-700">
                    LKR {(tx.refundedAmountMinor || 0) / 100}
                  </dd>
                </div>
              </>
            ) : null}
          </dl>
          {canRefundFromDetails ? (
            <button
              type="button"
              onClick={() => onRefund(appt.id)}
              disabled={refunding}
              className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {refunding ? "Processing Refund..." : "Refund Payment"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const AdminAppointmentsPage = () => {
  const minBookingDate = buildBookingBoundaryDate(0);
  const maxBookingDate = buildBookingBoundaryDate(30);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [filterDoc, setFilterDoc] = useState("");
  const [filterPat, setFilterPat] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [detailAppt, setDetailAppt] = useState(null);
  const [transactionsByAppointment, setTransactionsByAppointment] = useState({});
  const [refundingAppointmentId, setRefundingAppointmentId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [reschedDate, setReschedDate] = useState(null);
  const [reschedSlot, setReschedSlot] = useState(null);
  const [reschedSlots, setReschedSlots] = useState([]);
  const [reschedSlotState, setReschedSlotState] = useState("idle");
  const [reschedError, setReschedError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllAppointments(), getTransactionHistory({ status: "ALL" })])
      .then(([appointmentData, transactionData]) => {
        setAppointments(Array.isArray(appointmentData) ? appointmentData : []);
        setTransactionsByAppointment(buildAppointmentTransactionMap(transactionData));
      })
      .catch((error) => {
        setAppointments([]);
        setTransactionsByAppointment({});
        setPageError(error?.response?.data?.message || "Unable to load appointments.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!rescheduleAppt || !reschedDate) {
      return;
    }

    getDoctorAvailability(rescheduleAppt.doctorId, {
      date: `${reschedDate.getFullYear()}-${String(reschedDate.getMonth() + 1).padStart(2, "0")}-${String(reschedDate.getDate()).padStart(2, "0")}`,
    })
      .then((data) => {
        setReschedSlots(Array.isArray(data?.slots) ? data.slots : []);
        setReschedSlotState(
          data?.unavailable ? "unavailable" : data?.fullyBooked ? "fullyBooked" : "available",
        );
      })
      .catch(() => {
        setReschedSlots([]);
        setReschedSlotState("fullyBooked");
      });

    setReschedSlot(null);
    setReschedError("");
  }, [reschedDate, rescheduleAppt]);

  const filtered = useMemo(
    () =>
      appointments.filter((appointment) => {
        const doctorMatch = (appointment.doctorName || "")
          .toLowerCase()
          .includes(filterDoc.toLowerCase());
        const patientMatch = (appointment.patientName || "")
          .toLowerCase()
          .includes(filterPat.toLowerCase());
        const statusMatch =
          filterStatus === "All" || appointment.status?.toUpperCase() === filterStatus;
        const dateMatch = !filterDate || appointment.date === filterDate;
        return doctorMatch && patientMatch && statusMatch && dateMatch;
      }),
    [appointments, filterDoc, filterPat, filterStatus, filterDate],
  );

  const statusColor = (status) => {
    const map = {
      BOOKED: "text-blue-600",
      ACCEPTED: "text-teal-600",
      RESCHEDULED: "text-amber-600",
      COMPLETED: "text-green-600",
      REJECTED: "text-rose-500",
      CANCELLED: "text-red-500",
      EXPIRED: "text-slate-600",
    };
    return map[status?.toUpperCase()] || "text-slate-600";
  };

  const canReschedule = (appointment) =>
    !["CANCELLED", "REJECTED", "COMPLETED", "EXPIRED"].includes(appointment.status?.toUpperCase());

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError("Please enter a rejection reason.");
      return;
    }

    setActionLoading(true);
    try {
      const updated = await updateAppointmentStatus(rejectTarget.id, {
        status: "REJECTED",
        reason: rejectReason.trim(),
      });
      setAppointments((current) =>
        current.map((item) => (item.id === rejectTarget.id ? updated : item)),
      );
      setRejectTarget(null);
      setRejectReason("");
      setRejectError("");
    } catch (error) {
      setRejectError(error?.response?.data?.message || "Unable to reject appointment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleAppt || !reschedDate || !reschedSlot) {
      setReschedError("Please select a date and time slot.");
      return;
    }

    setActionLoading(true);
    const dateKey = `${reschedDate.getFullYear()}-${String(reschedDate.getMonth() + 1).padStart(2, "0")}-${String(reschedDate.getDate()).padStart(2, "0")}`;

    try {
      const updated = await rescheduleAppointment(rescheduleAppt.id, {
        newDateTime: `${dateKey}T${reschedSlot.time}`,
      });
      setAppointments((current) =>
        current.map((item) => (item.id === rescheduleAppt.id ? updated : item)),
      );
      setRescheduleAppt(null);
      setReschedDate(null);
      setReschedSlot(null);
      setReschedSlots([]);
      setReschedSlotState("idle");
      setReschedError("");
    } catch (error) {
      setReschedError(error?.response?.data?.message || "Unable to reschedule appointment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefundFromDetails = async (appointmentId) => {
    const tx = transactionsByAppointment[appointmentId];
    if (!tx?.id) {
      toast.error("Paid transaction not found for this appointment.");
      return;
    }

    setRefundingAppointmentId(appointmentId);
    try {
      const updatedTx = await refundTransaction(tx.id);
      setTransactionsByAppointment((current) => ({
        ...current,
        [appointmentId]: updatedTx,
      }));
      toast.success("Refund processed successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to process refund.");
    } finally {
      setRefundingAppointmentId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-slate-800">Appointment Monitor</h1>
          <p className="mt-1 text-sm text-slate-500">View and manage all appointments across the platform.</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-6">
          {ALL_STATUSES.filter((status) => status !== "All").map((status) => (
            <div key={status} className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <p className={`text-xl font-bold ${statusColor(status)}`}>
                {appointments.filter((item) => item.status?.toUpperCase() === status).length}
              </p>
              <p className="text-xs text-slate-500 capitalize">{status.toLowerCase()}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
          <input
            placeholder="Filter by doctor"
            value={filterDoc}
            onChange={(event) => setFilterDoc(event.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Filter by patient"
            value={filterPat}
            onChange={(event) => setFilterPat(event.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ALL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All Statuses" : status}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(event) => setFilterDate(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {filterDate ? (
              <button
                type="button"
                onClick={() => setFilterDate("")}
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {pageError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {pageError}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["Patient", "Doctor", "Date", "Time", "Status", "Actions"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading appointments...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                filtered.map((appointment) => (
                  <tr key={appointment.id} className="transition-colors hover:bg-blue-50/40">
                    <td className="px-4 py-3 font-medium text-slate-800">{appointment.patientName}</td>
                    <td className="px-4 py-3 text-slate-600">{appointment.doctorName}</td>
                    <td className="px-4 py-3 text-slate-600">{appointment.date}</td>
                    <td className="px-4 py-3 text-slate-600">{appointment.time}</td>
                    <td className="px-4 py-3"><StatusBadge status={appointment.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => setDetailAppt(appointment)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                        >
                          View
                        </button>
                        {!["CANCELLED", "REJECTED", "COMPLETED", "EXPIRED"].includes(appointment.status?.toUpperCase()) && (
                          <button
                            onClick={() => {
                              setRejectTarget(appointment);
                              setRejectReason("");
                              setRejectError("");
                            }}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-2 text-right text-xs text-slate-400">
          Showing {filtered.length} of {appointments.length} appointments
        </p>
      </div>

      <DetailModal
        appt={detailAppt}
        tx={detailAppt ? transactionsByAppointment[detailAppt.id] : null}
        refunding={refundingAppointmentId === detailAppt?.id}
        onRefund={handleRefundFromDetails}
        onClose={() => setDetailAppt(null)}
      />

      <ConfirmationModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        loading={actionLoading}
        title="Reject Appointment"
        message={`Reject appointment for ${rejectTarget?.patientName} with ${rejectTarget?.doctorName}?`}
        confirmLabel="Reject"
        confirmStyle="danger"
      >
        <div className="mt-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Rejection Reason
          </label>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(event) => {
              setRejectReason(event.target.value);
              setRejectError("");
            }}
            placeholder="Enter the reason for rejection"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          {rejectError && <p className="mt-2 text-xs text-red-500">{rejectError}</p>}
        </div>
      </ConfirmationModal>

    </div>
  );
};

export default AdminAppointmentsPage;
