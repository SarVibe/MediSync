import React from "react";
import { Link, useSearchParams } from "react-router-dom";

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";
  const txId = "TX-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-slate-200/50 border border-slate-50">
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-8 shadow-inner ${
          isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {isSuccess ? '✓' : '✕'}
        </div>

        <h1 className="text-3xl font-black text-slate-800 mb-4">
          {isSuccess ? 'Payment Successful' : 'Payment Failed'}
        </h1>
        <p className="text-slate-500 font-bold mb-10 px-8 leading-relaxed">
          {isSuccess 
            ? "Your appointment has been confirmed. You will receive a notification shortly with the session link."
            : "Something went wrong with your transaction. Please try again or contact support if the issue persists."}
        </p>

        <div className="bg-slate-50/80 rounded-3xl p-6 mb-10 flex flex-col gap-4">
          <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
            <span>Transaction ID</span>
            <span className="text-slate-800">{txId}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
            <span>Amount Paid</span>
            <span className="text-blue-600">$52.50</span>
          </div>
          <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
            <span>Status</span>
            <span className={isSuccess ? 'text-green-500' : 'text-red-500'}>{isSuccess ? 'COMPLETED' : 'FAILED'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link 
            to="/patient/appointments" 
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
          >
            My Appointments
          </Link>
          <button onClick={() => window.print()} className="w-full py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;
