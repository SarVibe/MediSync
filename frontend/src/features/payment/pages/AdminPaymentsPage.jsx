import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  getPaymentConfig,
  getTransactionHistory,
  refundTransaction,
  updatePaymentConfig,
} from "../services/paymentService";
import { getAllAppointments } from "../../appointment/services/appointmentService";

const FILTERS = [
  "ALL",
  "PAID",
  "PENDING",
  "PENDING_REFUNDS",
  "FAILED",
  "REFUNDED",
  "CANCELLED",
];

const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

const formatCurrency = (amount = 0) =>
  currencyFormatter.format(Number(amount) || 0);

const normalizeStatus = (status) =>
  String(status || "")
    .trim()
    .toUpperCase();

const isPendingRefundTransaction = (transaction, appointmentsById) => {
  const appointment = appointmentsById[transaction.appointmentId];
  const appointmentStatus = appointment?.status?.toUpperCase();
  const refundPending = (transaction.refundedAmountMinor || 0) === 0;
  const isCancelledOrRejected =
    appointmentStatus === "CANCELLED" || appointmentStatus === "REJECTED";

  return (
    Boolean(transaction.appointmentId) &&
    normalizeStatus(transaction.status) === "PAID" &&
    refundPending &&
    isCancelledOrRejected
  );
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDayLabel = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });

const statusStyles = {
  PAID: "bg-green-50 text-green-700",
  PENDING: "bg-amber-50 text-amber-700",
  REFUNDED: "bg-emerald-50 text-emerald-700",
  PARTIALLY_REFUNDED: "bg-cyan-50 text-cyan-700",
  FAILED: "bg-red-50 text-red-700",
  CANCEL: "bg-orange-50 text-orange-700",
  CANCELLED: "bg-orange-50 text-orange-700",
  REJECTED: "bg-violet-50 text-violet-700",
  UNKNOWN: "bg-slate-100 text-slate-700",
};

const AdminPaymentsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [config, setConfig] = useState(null);
  const [appointmentsById, setAppointmentsById] = useState({});
  const [feeInput, setFeeInput] = useState("500");
  const [refundPercentageInput, setRefundPercentageInput] = useState("100");
  const [autoRefundEnabled, setAutoRefundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refundingId, setRefundingId] = useState(null);
  const [isPendingRefundsExpanded, setIsPendingRefundsExpanded] = useState(false);
  const deferredSearch = useDeferredValue(searchQuery);
  const sortBy = "NEWEST";
  const hasActiveFilters = filter !== "ALL" || searchQuery.trim().length > 0;

  const getDisplayStatus = (transaction) => {
    const refundedMinor = Number(transaction?.refundedAmountMinor) || 0;
    const amountMinor =
      Number(transaction?.amountMinor) ||
      Math.round((Number(transaction?.amount) || 0) * 100);
    if (refundedMinor > 0) {
      return refundedMinor < amountMinor ? "PARTIALLY_REFUNDED" : "REFUNDED";
    }
    return normalizeStatus(transaction?.status) || "UNKNOWN";
  };

  const loadPage = async () => {
    setLoading(true);
    try {
      const [transactionData, configData] = await Promise.all([
        getTransactionHistory(),
        getPaymentConfig(),
      ]);

      setTransactions(Array.isArray(transactionData) ? transactionData : []);
      setConfig(configData);
      setFeeInput(String(configData?.consultationFee ?? 500));
      setRefundPercentageInput(String(configData?.refundPercentage ?? 100));
      setAutoRefundEnabled(configData?.autoRefundEnabled ?? true);

      const appointmentData = await getAllAppointments();
      const appointmentMap = (
        Array.isArray(appointmentData) ? appointmentData : []
      ).reduce((acc, appointment) => {
        if (appointment?.id) {
          acc[appointment.id] = appointment;
        }
        return acc;
      }, {});
      setAppointmentsById(appointmentMap);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to load payment dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const totalRevenue = useMemo(
    () =>
      transactions
        .filter(
          (transaction) => normalizeStatus(transaction.status) === "PAID",
        )
        .reduce((sum, transaction) => sum + (transaction.amount || 0), 0),
    [transactions],
  );

  const refundedAmountTotal = useMemo(
    () =>
      transactions.reduce(
        (sum, transaction) => sum + (transaction.refundedAmount || 0),
        0,
      ),
    [transactions],
  );

  const successRate = useMemo(() => {
    if (!transactions.length) {
      return 0;
    }
    const paid = transactions.filter(
      (transaction) => normalizeStatus(transaction.status) === "PAID",
    ).length;
    return Math.round((paid / transactions.length) * 100);
  }, [transactions]);

  const pendingRefundTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        isPendingRefundTransaction(transaction, appointmentsById),
      ),
    [transactions, appointmentsById],
  );

  const matchesSearch = (transaction, normalizedSearch) => {
    if (!normalizedSearch) return true;
    const rowText = [
      transaction.id,
      transaction.patientName,
      transaction.doctorName,
      transaction.appointmentId,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return rowText.includes(normalizedSearch);
  };

  const filteredPendingRefundTransactions = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    return pendingRefundTransactions.filter((transaction) =>
      matchesSearch(transaction, normalizedSearch),
    );
  }, [pendingRefundTransactions, deferredSearch]);

  const statusChartData = useMemo(() => {
    const buckets = [
      { key: "PAID", label: "Paid", color: "bg-green-500", count: 0 },
      { key: "PENDING", label: "Pending", color: "bg-amber-500", count: 0 },
      { key: "REFUNDED", label: "Refunded", color: "bg-emerald-500", count: 0 },
      { key: "FAILED", label: "Failed", color: "bg-rose-500", count: 0 },
      { key: "CANCELLED", label: "Cancelled", color: "bg-slate-500", count: 0 },
    ];

    transactions.forEach((transaction) => {
      const displayStatus = getDisplayStatus(transaction);
      const normalized =
        displayStatus === "PARTIALLY_REFUNDED" ? "REFUNDED" : displayStatus;
      const target = buckets.find((item) => item.key === normalized);
      if (target) {
        target.count += 1;
      }
    });

    const total = buckets.reduce((sum, item) => sum + item.count, 0);
    return { buckets, total };
  }, [transactions]);

  const recentTransactionsChart = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - (6 - index));
      return {
        key: day.toISOString().slice(0, 10),
        label: formatDayLabel(day),
        count: 0,
      };
    });

    const dayMap = days.reduce((acc, day) => {
      acc[day.key] = day;
      return acc;
    }, {});

    transactions.forEach((transaction) => {
      if (!transaction?.createdAt) return;
      const createdAt = new Date(transaction.createdAt);
      if (Number.isNaN(createdAt.getTime())) return;
      const key = createdAt.toISOString().slice(0, 10);
      if (dayMap[key]) {
        dayMap[key].count += 1;
      }
    });

    const maxCount = Math.max(...days.map((item) => item.count), 1);
    return { days, maxCount };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    return transactions
      .filter((transaction) => {
        const displayStatus = getDisplayStatus(transaction);
        const transactionStatus = normalizeStatus(transaction.status);
        const pendingRefundMatch =
          filter === "PENDING_REFUNDS" &&
          isPendingRefundTransaction(transaction, appointmentsById);
        const filterMatch =
          filter === "ALL" ||
          pendingRefundMatch ||
          displayStatus === filter ||
          transactionStatus === filter ||
          (filter === "REFUNDED" && displayStatus === "PARTIALLY_REFUNDED");
        if (!filterMatch) return false;

        return matchesSearch(transaction, normalizedSearch);
      })
      .sort((a, b) => {
        if (sortBy === "AMOUNT_HIGH") return (b.amount || 0) - (a.amount || 0);
        if (sortBy === "AMOUNT_LOW") return (a.amount || 0) - (b.amount || 0);
        if (sortBy === "OLDEST") {
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        }
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });
  }, [transactions, filter, deferredSearch, appointmentsById]);

  const handleSaveFee = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await updatePaymentConfig({
        consultationFee: Number(feeInput),
        autoRefundEnabled,
        refundPercentage: Number(refundPercentageInput),
      });
      setConfig(updated);
      setFeeInput(String(updated.consultationFee));
      setRefundPercentageInput(String(updated.refundPercentage ?? 100));
      setAutoRefundEnabled(updated.autoRefundEnabled ?? true);
      toast.success("Payment settings updated.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to update payment settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleManualRefund = async (transactionId) => {
    const shouldProceed = window.confirm(
      "Are you sure you want to process this refund?",
    );
    if (!shouldProceed) return;

    setRefundingId(transactionId);
    try {
      const refunded = await refundTransaction(transactionId);
      setTransactions((current) =>
        current.map((item) => (item.id === transactionId ? refunded : item)),
      );
      toast.success("Refund processed.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to process refund.");
    } finally {
      setRefundingId(null);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilter("ALL");
  };

  const togglePendingRefunds = () => {
    setIsPendingRefundsExpanded((value) => !value);
  };

  const getStatusStyleKey = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "CANCELLED") return "CANCEL";
    return normalized;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-800">
              Transaction History
            </h1>
            <p className="mt-1 font-medium text-slate-500">
              Review payment flow, process refunds, and manage consultation fee
              settings.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Status Split
                </p>
                <div className="space-y-2">
                  {statusChartData.buckets.map((item) => {
                    const percentage =
                      statusChartData.total > 0
                        ? Math.round((item.count / statusChartData.total) * 100)
                        : 0;
                    return (
                      <div key={item.key} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                          <span>{item.label}</span>
                          <span>{item.count}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full ${item.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Last 7 Days Transactions
                </p>
                <div className="grid grid-cols-7 items-end gap-2">
                  {recentTransactionsChart.days.map((day) => {
                    const height =
                      recentTransactionsChart.maxCount > 0
                        ? Math.max(
                            8,
                            Math.round(
                              (day.count / recentTransactionsChart.maxCount) * 56,
                            ),
                          )
                        : 8;
                    return (
                      <div key={day.key} className="text-center">
                        <div className="mb-1 text-[10px] font-black text-slate-500">
                          {day.count}
                        </div>
                        <div className="mx-auto flex h-16 w-5 items-end rounded-md bg-slate-100">
                          <div
                            className="w-full rounded-md bg-blue-500"
                            style={{ height: `${height}px` }}
                          />
                        </div>
                        <div className="mt-1 text-[9px] font-bold uppercase text-slate-400">
                          {day.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSaveFee}
            className="w-full max-w-md rounded-[2rem] border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/30"
          >
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Consultation Fee
            </p>
            <p className="mb-4 text-sm text-slate-500">
              Configure consultation fee and refund behavior for cancelled or
              rejected appointments.
            </p>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 font-black text-slate-500">
                LKR
              </div>
              <input
                type="number"
                min="1"
                value={feeInput}
                onChange={(event) => setFeeInput(event.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                <span className="text-xs font-bold text-slate-700">
                  Auto Refund
                </span>
                <button
                  type="button"
                  onClick={() => setAutoRefundEnabled((value) => !value)}
                  className={`h-7 w-14 rounded-full p-1 transition ${
                    autoRefundEnabled ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white transition ${
                      autoRefundEnabled ? "translate-x-7" : ""
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <span className="whitespace-nowrap text-xs font-bold text-slate-700">
                  Refund %
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={refundPercentageInput}
                  onChange={(event) => setRefundPercentageInput(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-4 w-full rounded-2xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50"
            >
              {saving ? "Saving" : "Update Settings"}
            </button>
            <p className="mt-3 text-xs text-slate-400">
              Current fee: {formatCurrency(config?.consultationFee ?? 500)}
            </p>
          </form>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Total Revenue
            </p>
            <p className="text-3xl font-black text-slate-800">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Refunded Total
            </p>
            <p className="text-3xl font-black text-emerald-600">
              {formatCurrency(refundedAmountTotal)}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Pending Refund
            </p>
            <p className="text-3xl font-black text-amber-600">
              {filteredPendingRefundTransactions.length}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Success Rate
            </p>
            <p className="text-3xl font-black text-green-500">{successRate}%</p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="grid w-full grid-cols-7 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 md:flex-1">
              {FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-2 py-2 text-center text-[10px] font-black tracking-normal transition-all ${
                    filter === item
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {item.replaceAll("_", " ")}
                </button>
              ))}
            </div>
            <div className="flex gap-2 md:shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search patient, doctor, appointment..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 md:w-80"
              />
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className="mb-8 cursor-pointer rounded-[2rem] border border-amber-100 bg-white p-6 shadow-lg shadow-amber-100/30"
          onClick={togglePendingRefunds}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              togglePendingRefunds();
            }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={isPendingRefundsExpanded}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-amber-500">
                Pending Refunds
              </p>
              <h2 className="text-lg font-black text-slate-800">
                Cancelled/Rejected Bookings Not Refunded
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-amber-100/80 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-amber-800">
              <span>{filteredPendingRefundTransactions.length}</span>
              <span>{isPendingRefundsExpanded ? "Collapse ▾" : "Expand ▸"}</span>
            </div>
          </div>

          {isPendingRefundsExpanded ? (
            filteredPendingRefundTransactions.length ? (
            <div className="space-y-3" onClick={(event) => event.stopPropagation()}>
              {filteredPendingRefundTransactions.map((transaction) => {
                const appointment = appointmentsById[transaction.appointmentId];
                return (
                  <div
                    key={`pending-${transaction.id}`}
                    className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-amber-50/40 px-4 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-black text-slate-800">
                        {transaction.patientName} | Dr. {transaction.doctorName}
                      </p>
                      <p className="mt-1 text-[11px] font-bold text-slate-500">
                        Appointment #{transaction.appointmentId} |{" "}
                        {appointment?.status || "-"} |{" "}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleManualRefund(transaction.id);
                      }}
                      disabled={refundingId === transaction.id}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50"
                    >
                      {refundingId === transaction.id ? "Refunding" : "Refund"}
                    </button>
                  </div>
                );
              })}
            </div>
            ) : (
              <p className="text-sm text-slate-500">No pending refunds found.</p>
            )
          ) : null}
        </div>

        <div className="hidden overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-lg shadow-slate-200/20 md:block">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Transaction
                </th>
                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Amount
                </th>
                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-400">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length ? (
                filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="transition-colors hover:bg-slate-50/30"
                  >
                    <td className="px-6 py-5">
                      <p className="text-sm font-black capitalize text-slate-800">
                        {transaction.patientName}
                      </p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        #{transaction.id} | Dr. {transaction.doctorName} | #
                        {transaction.appointmentId || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-5 text-sm font-black text-slate-800">
                      {formatCurrency(transaction.amount)}
                      {transaction.refundedAmount > 0 ? (
                        <p className="mt-1 text-[10px] font-black text-emerald-700">
                          Refunded: {formatCurrency(transaction.refundedAmount)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-5 text-sm font-bold text-slate-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {(() => {
                        const displayStatus = getDisplayStatus(transaction);
                        const styleKey = getStatusStyleKey(displayStatus);
                        return (
                      <span
                        className={`rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest ${
                          statusStyles[styleKey] ||
                          statusStyles.UNKNOWN
                        }`}
                      >
                        {displayStatus}
                      </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {normalizeStatus(transaction.status) === "PAID" &&
                      (transaction.refundedAmountMinor || 0) === 0 ? (
                        <button
                          type="button"
                          onClick={() => handleManualRefund(transaction.id)}
                          disabled={refundingId === transaction.id}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50"
                        >
                          {refundingId === transaction.id ? "Refunding" : "Refund"}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 md:hidden">
          {loading ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 text-sm text-slate-500">
              Loading transactions...
            </div>
          ) : filteredTransactions.length ? (
            filteredTransactions.map((transaction) => (
              <div
                key={`mobile-${transaction.id}`}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-800">
                      {transaction.patientName}
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-slate-500">
                      Dr. {transaction.doctorName}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black tracking-widest ${
                      statusStyles[getStatusStyleKey(getDisplayStatus(transaction))] ||
                      statusStyles.UNKNOWN
                    }`}
                  >
                    {getDisplayStatus(transaction)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600">
                  <p>Amount: {formatCurrency(transaction.amount)}</p>
                  <p>Date: {formatDate(transaction.createdAt)}</p>
                  <p>ID: #{transaction.id}</p>
                  <p>Appt: #{transaction.appointmentId || "-"}</p>
                </div>
                {transaction.refundedAmount > 0 ? (
                  <p className="mt-2 text-[11px] font-black text-emerald-700">
                    Refunded: {formatCurrency(transaction.refundedAmount)}
                  </p>
                ) : null}
                {normalizeStatus(transaction.status) === "PAID" &&
                (transaction.refundedAmountMinor || 0) === 0 ? (
                  <button
                    type="button"
                    onClick={() => handleManualRefund(transaction.id)}
                    disabled={refundingId === transaction.id}
                    className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50"
                  >
                    {refundingId === transaction.id ? "Refunding" : "Refund"}
                  </button>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 text-sm text-slate-500">
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
