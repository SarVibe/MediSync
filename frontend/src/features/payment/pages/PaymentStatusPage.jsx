import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  cancelCheckout,
  confirmCheckout,
} from "../services/paymentService";

const PENDING_BOOKING_KEY = "medisync.pendingBooking";
const PENDING_PAYMENT_SESSION_KEY = "medisync.pendingPaymentSession";

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const isCancelled = searchParams.get("cancelled") === "true";
  const [status, setStatus] = useState(isCancelled ? "cancelled" : "loading");
  const [transaction, setTransaction] = useState(null);
  const [message, setMessage] = useState("");
  const verificationStartedRef = useRef(false);

  useEffect(() => {
    if (verificationStartedRef.current) {
      return;
    }
    verificationStartedRef.current = true;

    const run = async () => {
      const storedSessionId = window.localStorage.getItem(
        PENDING_PAYMENT_SESSION_KEY,
      );
      const activeSessionId = sessionId || storedSessionId;

      if (!activeSessionId) {
        setStatus("error");
        setMessage("Payment session not found.");
        return;
      }

      try {
        if (isCancelled) {
          const response = await cancelCheckout({ sessionId: activeSessionId });
          setTransaction(response);
          setStatus("cancelled");
          setMessage("Payment was cancelled. The slot reservation has been released.");
        } else {
          const response = await confirmCheckout({ sessionId: activeSessionId });
          setTransaction(response);
          setStatus("success");
          setMessage("Payment successful. Your appointment is now confirmed.");
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          error?.response?.data?.message ||
            "Unable to verify payment. Please contact support.",
        );
      } finally {
        window.localStorage.removeItem(PENDING_BOOKING_KEY);
        window.localStorage.removeItem(PENDING_PAYMENT_SESSION_KEY);
      }
    };

    run();
  }, [isCancelled, sessionId]);

  const isSuccess = status === "success";
  const isLoading = status === "loading";
  const icon = isSuccess ? "OK" : status === "cancelled" ? "!" : isLoading ? "..." : "X";

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-slate-200/50 border border-slate-50">
        <div
          className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-8 shadow-inner ${
            isSuccess
              ? "bg-green-100 text-green-600"
              : isLoading
                ? "bg-blue-100 text-blue-600"
              : status === "cancelled"
                ? "bg-amber-100 text-amber-600"
                : "bg-red-100 text-red-600"
          }`}
        >
          {icon}
        </div>

        <h1 className="text-3xl font-black text-slate-800 mb-4">
          {status === "loading"
            ? "Verifying Payment"
            : isSuccess
              ? "Payment Successful"
              : status === "cancelled"
                ? "Payment Cancelled"
                : "Payment Failed"}
        </h1>
        <p className="text-slate-500 font-bold mb-10 px-8 leading-relaxed">
          {status === "loading"
            ? "Please wait while we confirm your Stripe payment."
            : message}
        </p>

        <div className="bg-slate-50/80 rounded-3xl p-6 mb-10 flex flex-col gap-4">
          <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
            <span>Transaction ID</span>
            <span className="text-slate-800">
              {transaction?.sessionId || sessionId || "-"}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
            <span>Amount</span>
            <span className="text-blue-600">
              LKR {transaction?.amount ?? "-"}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
            <span>Status</span>
            <span
              className={
                isSuccess
                  ? "text-green-500"
                  : isLoading
                    ? "text-blue-500"
                  : status === "cancelled"
                    ? "text-amber-500"
                    : "text-red-500"
              }
            >
              {status === "loading"
                ? "PROCESSING"
                : transaction?.status || status.toUpperCase()}
            </span>
          </div>
          {transaction?.appointmentId && (
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
              <span>Appointment ID</span>
              <span className="text-slate-800">{transaction.appointmentId}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to={isSuccess ? "/patient/appointments" : "/patient/doctors"}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
          >
            {isSuccess ? "My Appointments" : "Back to Doctors"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;
