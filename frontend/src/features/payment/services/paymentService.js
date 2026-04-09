import axios from "../../../app/axios";

export const getPaymentConfig = () =>
  axios.get("/api/payments/config").then((response) => response.data);

export const updatePaymentConfig = (payload) =>
  axios.put("/api/payments/config", payload).then((response) => response.data);

export const createCheckoutSession = (payload) =>
  axios
    .post("/api/payments/checkout-session", payload)
    .then((response) => response.data);

export const confirmCheckout = (payload) =>
  axios
    .post("/api/payments/confirm-checkout", payload)
    .then((response) => response.data);

export const cancelCheckout = (payload) =>
  axios
    .post("/api/payments/cancel-checkout", payload)
    .then((response) => response.data);

export const getTransactionHistory = (params) =>
  axios.get("/api/payments", { params }).then((response) => response.data);
