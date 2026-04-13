import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  createCheckoutSession,
  getPaymentConfig,
} from "../services/paymentService";

const PENDING_BOOKING_KEY = "medisync.pendingBooking";
const PENDING_PAYMENT_SESSION_KEY = "medisync.pendingPaymentSession";
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#1e293b",
      fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
      fontSize: "16px",
      "::placeholder": {
        color: "#94a3b8",
      },
    },
    invalid: {
      color: "#dc2626",
    },
  },
};

const FIELD_LABEL_CLASS = "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2";

const CardPaymentForm = ({ booking, config, onPaymentComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!booking || !stripe || !elements) {
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);
    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      toast.error("Card form not ready. Please retry.");
      return;
    }

    setLoading(true);
    try {
      const response = await createCheckoutSession(booking);
      const clientSecret = response?.clientSecret;
      if (!clientSecret) {
        throw new Error("Missing Stripe client secret from payment service.");
      }

      window.localStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(booking));
      window.localStorage.setItem(
        PENDING_PAYMENT_SESSION_KEY,
        response.paymentIntentId || response.sessionId || "",
      );

      const stripeResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: booking.patientName || "MediSync Patient",
          },
        },
      });

      if (stripeResult.error) {
        throw new Error(stripeResult.error.message || "Payment failed.");
      }

      if (stripeResult.paymentIntent?.status !== "succeeded") {
        throw new Error("Payment not completed. Please try again.");
      }

      onPaymentComplete(stripeResult.paymentIntent.id);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to process payment. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-50 flex flex-col">
      <h3 className="text-lg font-black text-slate-800 mb-3">Card Payment</h3>
      <p className="text-sm font-medium text-slate-500 leading-7 mb-6">
        Enter your card details below and complete payment securely with Stripe.
      </p>

      <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 mb-6 space-y-4">
        <div>
          <p className={FIELD_LABEL_CLASS}>Card Number</p>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
        <div>
          <p className={FIELD_LABEL_CLASS}>Expiry Date</p>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
        <div>
          <p className={FIELD_LABEL_CLASS}>CVC</p>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 mb-8">
        <p className="text-xs text-slate-500 font-semibold">
          Payable amount: <span className="text-slate-800 font-black">LKR {config?.consultationFee ?? 500}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={handlePay}
        disabled={loading || !config || !stripe || !elements}
        className="mt-auto w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black tracking-[0.2em] uppercase text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
};

const PaymentCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const booking = useMemo(() => {
    const stateBooking = location.state?.booking;
    if (stateBooking) {
      return stateBooking;
    }

    const stored = window.localStorage.getItem(PENDING_BOOKING_KEY);
    return stored ? JSON.parse(stored) : null;
  }, [location.state]);

  useEffect(() => {
    if (location.state?.booking) {
      window.localStorage.setItem(
        PENDING_BOOKING_KEY,
        JSON.stringify(location.state.booking),
      );
    }
  }, [location.state]);

  useEffect(() => {
    getPaymentConfig()
      .then(setConfig)
      .catch(() => {
        toast.error("Unable to load payment details.");
      });
  }, []);

  useEffect(() => {
    if (!booking) {
      navigate("/patient/doctors", { replace: true });
    }
  }, [booking, navigate]);

  const handleBack = () => {
    navigate("/patient/doctors", { replace: true });
  };

  if (!booking) {
    return null;
  }

  const totalAmount = config?.consultationFee ?? 500;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-50">
          <h2 className="text-2xl font-black text-slate-800 mb-8">Checkout</h2>

          <div className="space-y-6">
            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">
                Appointment Detail
              </p>
              <div className="space-y-2">
                <p className="font-black text-slate-800">
                  Dr. {booking.doctorName}
                </p>
                <p className="text-xs font-bold text-slate-500">
                  {booking.doctorSpecialization || "Consultation"}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm py-3 border-t border-blue-100/30 mt-4">
                <span className="font-bold text-slate-400">Date</span>
                <span className="font-black text-blue-900">{booking.date}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-3 border-t border-blue-100/30">
                <span className="font-bold text-slate-400">Time</span>
                <span className="font-black text-blue-900">{booking.time}</span>
              </div>
              <div className="text-sm pt-3 border-t border-blue-100/30">
                <span className="font-bold text-slate-400">Reason</span>
                <p className="font-semibold text-slate-700 mt-2">{booking.reason}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                <span>Consultation Fee</span>
                <span>LKR {totalAmount}</span>
              </div>
              <div className="h-px bg-slate-100 my-4" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-black text-slate-800">
                  Total Payable
                </span>
                <span className="text-2xl font-black text-blue-600">
                  LKR {totalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <CardPaymentForm
              booking={booking}
              config={config}
              onPaymentComplete={(paymentIntentId) => {
                navigate(`/patient/payment-status?session_id=${paymentIntentId}`, {
                  replace: true,
                });
              }}
            />
          </Elements>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-50 flex flex-col">
            <h3 className="text-lg font-black text-slate-800 mb-4">
              Stripe Not Configured
            </h3>
            <p className="text-sm font-medium text-slate-500 leading-7">
              VITE_STRIPE_PUBLISHABLE_KEY is missing. The payment form cannot be loaded.
            </p>
            <button
              type="button"
              onClick={handleBack}
              className="mt-8 w-full py-5 bg-slate-400 text-white rounded-[1.5rem] font-black tracking-[0.2em] uppercase text-xs"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCheckoutPage;
