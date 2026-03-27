import axios from "../../../app/axios";

export const getNotifications = () => axios.get("/notifications").then(r => r.data);
export const markAsRead = (id) => axios.put(`/notifications/${id}/read`).then(r => r.data);
export const clearNotifications = () => axios.delete("/notifications").then(r => r.data);
