import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppointment } from "../../appointment/AppointmentContext";

const PaymentCheckoutPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { markAsPaid } = useAppointment();
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  const handlePay = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      markAsPaid(appointmentId);
      setLoading(false);
      navigate(`/patient/payment-status?id=${appointmentId}&success=true`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Order Summary */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-50">
          <h2 className="text-2xl font-black text-slate-800 mb-8">Checkout</h2>
          
          <div className="space-y-6">
            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Appointment Detail</p>
              <div className="flex items-center gap-4 mb-4">
                <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100" className="w-12 h-12 rounded-xl object-cover" alt="Doc" />
                <div>
                  <p className="font-black text-slate-800">Dr. Arjun Sharma</p>
                  <p className="text-xs font-bold text-slate-500">Cardiology Specialist</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm py-3 border-t border-blue-100/30">
                <span className="font-bold text-slate-400">Date & Time</span>
                <span className="font-black text-blue-900">May 15, 2026 · 10:30 AM</span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                <span>Consultation Fee</span>
                <span>$50.00</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                <span>Platform Fee</span>
                <span>$2.50</span>
              </div>
              <div className="h-px bg-slate-100 my-4" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-black text-slate-800">Total Payable</span>
                <span className="text-2xl font-black text-blue-600">$52.50</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Method */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-50 flex flex-col">
          <h3 className="text-lg font-black text-slate-800 mb-8">Select Payment Method</h3>
          
          <form onSubmit={handlePay} className="flex-1 flex flex-col">
            <div className="space-y-4 mb-8">
              <label className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer ${method === 'card' ? 'border-blue-600 bg-blue-50/30' : 'border-slate-50 hover:bg-slate-50'}`}>
                <input type="radio" name="method" value="card" checked={method === 'card'} onChange={() => setMethod('card')} className="w-5 h-5 accent-blue-600" />
                <div className="flex-1">
                  <p className="font-black text-slate-800 text-sm">Credit / Debit Card</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 whitespace-nowrap overflow-hidden">Visa, Mastercard, Amex</p>
                </div>
                <div className="text-2xl">💳</div>
              </label>

              <label className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer ${method === 'upi' ? 'border-blue-600 bg-blue-50/30' : 'border-slate-50 hover:bg-slate-50'}`}>
                <input type="radio" name="method" value="upi" checked={method === 'upi'} onChange={() => setMethod('upi')} className="w-5 h-5 accent-blue-600" />
                <div className="flex-1">
                  <p className="font-black text-slate-800 text-sm">UPI / Digital Wallet</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Google Pay, PhonePe, etc.</p>
                </div>
                <div className="text-2xl">🏦</div>
              </label>
            </div>

            {method === 'card' && (
              <div className="space-y-4 mb-8">
                <input type="text" placeholder="Cardholder Name" className="w-full px-5 py-4 rounded-2xl bg-slate-50 font-bold text-sm outline-none focus:ring-1 focus:ring-blue-500" required />
                <input type="text" placeholder="Card Number" className="w-full px-5 py-4 rounded-2xl bg-slate-50 font-bold text-sm outline-none focus:ring-1 focus:ring-blue-500" required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="MM / YY" className="w-full px-5 py-4 rounded-2xl bg-slate-50 font-bold text-sm outline-none focus:ring-1 focus:ring-blue-500" required />
                  <input type="password" placeholder="CVV" className="w-full px-5 py-4 rounded-2xl bg-slate-50 font-bold text-sm outline-none focus:ring-1 focus:ring-blue-500" required />
                </div>
              </div>
            )}

            <button 
              type="submit" disabled={loading}
              className="mt-auto w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black tracking-[0.2em] uppercase text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Processing Transaction...' : 'Complete Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckoutPage;
