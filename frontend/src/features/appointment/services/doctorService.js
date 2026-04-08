import axios from "./appointmentApi";

function normalizeAvailability(slot) {
  if (!slot) {
    return slot;
  }

  return {
    ...slot,
    id: slot.id ?? `${slot.date || "slot"}-${String(slot.startTime || slot.time || "").slice(0, 5)}`,
    day: slot.day || slot.dayOfWeek,
    date: slot.date || null,
    startTime: String(slot.startTime || "").slice(0, 5),
    endTime: String(slot.endTime || "").slice(0, 5),
    time: String(slot.startTime || slot.time || "").slice(0, 5),
    available:
      typeof slot.available === "boolean"
        ? slot.available
        : String(slot.status || "").toUpperCase() === "AVAILABLE",
  };
}

function normalizeAvailabilityDay(payload) {
  if (!payload) {
    return {
      slots: [],
      unavailable: false,
      fullyBooked: false,
    };
  }

  return {
    doctorId: payload.doctorId,
    date: payload.date || null,
    unavailable: Boolean(payload.unavailable),
    fullyBooked: Boolean(payload.fullyBooked),
    slots: Array.isArray(payload.slots) ? payload.slots.map(normalizeAvailability) : [],
  };
}

function normalizeTimeSlot(slot) {
  if (!slot) {
    return slot;
  }

  return {
    startTime: String(slot.startTime || "").slice(0, 5),
    endTime: String(slot.endTime || "").slice(0, 5),
  };
}

function normalizeDateOverride(override) {
  if (!override) {
    return override;
  }

  return {
    ...override,
    date: override.date,
    dayOfWeek: override.dayOfWeek,
    unavailable: Boolean(override.unavailable),
    slots: Array.isArray(override.slots) ? override.slots.map(normalizeTimeSlot) : [],
  };
}

function normalizeAvailabilityConfig(config) {
  if (!config) {
    return config;
  }

  return {
    doctorId: config.doctorId,
    availableDays: Array.isArray(config.availableDays) ? config.availableDays : [],
    defaultSlots: Array.isArray(config.defaultSlots)
      ? config.defaultSlots.map(normalizeTimeSlot)
      : [],
    dateOverrides: Array.isArray(config.dateOverrides)
      ? config.dateOverrides.map(normalizeDateOverride)
      : [],
    usingDefaultSchedule: Boolean(config.usingDefaultSchedule),
  };
}

function normalizeDoctor(doctor) {
  if (!doctor) {
    return doctor;
  }

  const normalizedName = String(doctor.name || `Doctor ${doctor.id}`).replace(/^dr\.\s*/i, "");

  return {
    id: Number(doctor.id),
    name: normalizedName,
    specialization: doctor.specialization || "",
    qualifications: doctor.qualifications || "",
    experience: doctor.experience ?? null,
    availability: doctor.availability || "Availability updated in appointment service",
  };
}

export const getDoctors = (params = {}) =>
  axios
    .get("/doctors", { params })
    .then((r) => (Array.isArray(r.data) ? r.data.map(normalizeDoctor) : []));

export const getDoctorById = (id) =>
  axios.get(`/doctors/${id}`).then((r) => normalizeDoctor(r.data));

export const getDoctorAvailability = (doctorId, params = {}) =>
  axios
    .get(`/doctors/${doctorId}/availability`, { params })
    .then((r) => normalizeAvailabilityDay(r.data));

export const getMyAvailability = () =>
  axios
    .get("/doctors/availability/me")
    .then((r) => (Array.isArray(r.data) ? r.data.map(normalizeAvailability) : []));

export const getMyAvailabilityConfig = () =>
  axios
    .get("/doctors/availability/config/me")
    .then((r) => normalizeAvailabilityConfig(r.data));

export const saveWeeklyAvailability = (payload) =>
  axios
    .put("/doctors/availability/config", payload)
    .then((r) => normalizeAvailabilityConfig(r.data));

export const saveDateOverride = (payload) =>
  axios
    .put("/doctors/availability/override", payload)
    .then((r) => normalizeDateOverride(r.data));

export const deleteDateOverride = (date) =>
  axios.delete(`/doctors/availability/override/${date}`).then((r) => r.data);

export const addAvailabilitySlot = (payload) =>
  axios.post("/doctors/availability", payload).then((r) => normalizeAvailability(r.data));

export const updateAvailabilitySlot = (slotId, payload) =>
  axios
    .put(`/doctors/availability/${slotId}`, payload)
    .then((r) => normalizeAvailability(r.data));

export const deleteAvailabilitySlot = (slotId) =>
  axios.delete(`/doctors/availability/${slotId}`).then((r) => r.data);
