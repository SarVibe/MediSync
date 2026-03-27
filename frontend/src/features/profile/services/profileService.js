import axios from "../../../app/axios";

export const getProfile = () => axios.get("/profile").then(r => r.data);
export const updateProfile = (data) => axios.put("/profile", data).then(r => r.data);
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return axios.post("/profile/avatar", formData).then(r => r.data);
};

// Admin User Management
export const getAllUsers = (params) => axios.get("/users", { params }).then(r => r.data);
export const updateUserStatus = (id, status) => axios.put(`/users/${id}/status`, { status }).then(r => r.data);
