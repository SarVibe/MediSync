import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  getPaymentConfig,
  getTransactionHistory,
  refundTransaction,
  updatePaymentConfig,
} from "../services/paymentService";

const FILTERS = [
  "ALL",
  "PENDING",
  "PAID",
  "CANCELLED",
  "FAILED",
];

const AdminPaymentsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [config, setConfig] = useState(null);
  const [feeInput, setFeeInput] = useState("500");
  const [refundPercentageInput, setRefundPercentageInput] = useState("100");
  const [autoRefundEnabled, setAutoRefundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refundingId, setRefundingId] = useState(null);

  const getDisplayStatus = (transaction) => {
    const refundedMinor = transaction?.refundedAmountMinor || 0;
    const amountMinor = transaction?.amountMinor || 0;
    if (refundedMinor > 0) {
      return refundedMinor < amountMinor ? "PARTIALLY_REFUNDED" : "REFUNDED";
    }
    return transaction?.status || "UNKNOWN";
  };

  const loadPage = async (status = filter) => {
    setLoading(true);
    try {
      const [transactionData, configData] = await Promise.all([
        getTransactionHistory({ status }),
        getPaymentConfig(),
      ]);
      setTransactions(Array.isArray(transactionData) ? transactionData : []);
      setConfig(configData);
      setFeeInput(String(configData?.consultationFee ?? 500));
      setRefundPercentageInput(String(configData?.refundPercentage ?? 100));
      setAutoRefundEnabled(configData?.autoRefundEnabled ?? true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to load payment dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(filter);
  }, [filter]);

  const totalRevenue = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.status === "PAID")
        .reduce((sum, transaction) => sum + (transaction.amount || 0), 0),
    [transactions],
  );

  const successRate = useMemo(() => {
    if (!transactions.length) {
      return 0;
    }
    const paid = transactions.filter(
      (transaction) => transaction.status === "PAID",
    ).length;
    return Math.round((paid / transactions.length) * 100);
  }, [transactions]);

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

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Transaction History
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Stripe payment records and appointment consultation fee control.
            </p>
          </div>

          <form
            onSubmit={handleSaveFee}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 p-6 w-full max-w-md"
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Consultation Fee
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Configure consultation fee and refund behavior for cancelled/rejected appointments.
            </p>
            <div className="flex items-center gap-3">
              <div className="px-4 py-3 rounded-2xl bg-slate-50 font-black text-slate-500">
                LKR
              </div>
              <input
                type="number"
                min="1"
                value={feeInput}
                onChange={(event) => setFeeInput(event.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                <span className="text-xs font-bold text-slate-700">Auto Refund</span>
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
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                  Refund %
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={refundPercentageInput}
                  onChange={(event) => setRefundPercentageInput(event.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-4 w-full px-5 py-3 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
            >
              {saving ? "Saving" : "Update Settings"}
            </button>
            <p className="text-xs text-slate-400 mt-3">
              Current fee: LKR {config?.consultationFee ?? 500}
            </p>
          </form>
        </div>

        <div className="flex h-12 p-1 bg-white rounded-2xl shadow-sm border border-slate-100 mb-8 overflow-x-auto">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-5 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                filter === item
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Total Revenue
            </p>
            <p className="text-3xl font-black text-slate-800">LKR {totalRevenue}</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Success Rate
            </p>
            <p className="text-3xl font-black text-green-500">{successRate}%</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Transactions
            </p>
            <p className="text-3xl font-black text-blue-600">{transactions.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Transaction
                </th>
                <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Amount
                </th>
                <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Date
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-8 py-10 text-center text-sm text-slate-400"
                  >
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length ? (
                transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-slate-50/30 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-800 capitalize">
                        {transaction.patientName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        Dr. {transaction.doctorName} | {transaction.appointmentDate}{" "}
                        {transaction.appointmentTime}
                      </p>
                    </td>
                    <td className="px-4 py-6 text-sm font-black text-slate-800">
                      LKR {transaction.amount}
                      {transaction.refundedAmount > 0 ? (
                        <p className="text-[10px] font-black text-emerald-600 mt-1">
                          Refunded: LKR {transaction.refundedAmount}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-6 text-sm font-bold text-slate-500">
                      {transaction.createdAt?.slice?.(0, 10) || "-"}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${
                          getDisplayStatus(transaction) === "PAID"
                            ? "bg-green-50 text-green-600"
                            : getDisplayStatus(transaction) === "PENDING"
                              ? "bg-amber-50 text-amber-600"
                              : getDisplayStatus(transaction) === "REFUNDED" ||
                                  getDisplayStatus(transaction) === "PARTIALLY_REFUNDED"
                                ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-600"
                        }`}
                      >
                        {getDisplayStatus(transaction)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {transaction.status === "PAID" &&
                      (transaction.refundedAmountMinor || 0) === 0 ? (
                        <button
                          type="button"
                          onClick={() => handleManualRefund(transaction.id)}
                          disabled={refundingId === transaction.id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                        >
                          {refundingId === transaction.id ? "Refunding" : "Refund"}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-8 py-10 text-center text-sm text-slate-400"
                  >
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
