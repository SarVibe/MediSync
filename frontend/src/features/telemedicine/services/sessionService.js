import axios from "../../../app/axios";

export const getSessionInfo = (appointmentId) => axios.get(`/video-session/${appointmentId}`).then(r => r.data);
export const startSession = (appointmentId) => axios.post("/video-session/start", { appointmentId }).then(r => r.data);
export const joinSession = (appointmentId) => axios.post("/video-session/join", { appointmentId }).then(r => r.data);
export const endSession = (appointmentId) => axios.post("/video-session/end", { appointmentId }).then(r => r.data);
