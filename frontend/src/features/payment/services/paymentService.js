import axios from "../../../app/axios";

export const createPaymentIntent = (appointmentId) => axios.post("/payments/create-intent", { appointmentId }).then(r => r.data);
export const confirmPayment = (payload) => axios.post("/payments/confirm", payload).then(r => r.data);
export const getTransactionHistory = (params) => axios.get("/payments", { params }).then(r => r.data);
export const getTransactionDetail = (id) => axios.get(`/payments/${id}`).then(r => r.data);
