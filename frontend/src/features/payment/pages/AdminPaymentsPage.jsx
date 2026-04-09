import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  getPaymentConfig,
  getTransactionHistory,
  updatePaymentConfig,
} from "../services/paymentService";

const FILTERS = ["ALL", "PENDING", "PAID", "CANCELLED", "FAILED"];

const AdminPaymentsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [config, setConfig] = useState(null);
  const [feeInput, setFeeInput] = useState("500");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      });
      setConfig(updated);
      setFeeInput(String(updated.consultationFee));
      toast.success("Consultation fee updated.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to update consultation fee.",
      );
    } finally {
      setSaving(false);
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
              This default amount is charged when a patient books an appointment.
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
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-3 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
              >
                {saving ? "Saving" : "Update"}
              </button>
            </div>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
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
                    </td>
                    <td className="px-4 py-6 text-sm font-bold text-slate-500">
                      {transaction.createdAt?.slice?.(0, 10) || "-"}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${
                          transaction.status === "PAID"
                            ? "bg-green-50 text-green-600"
                            : transaction.status === "PENDING"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-red-50 text-red-600"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
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
