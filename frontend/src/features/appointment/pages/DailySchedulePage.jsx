import React, { useEffect, useMemo, useState } from "react";
import CalendarView from "../components/CalendarView";
import StatusBadge from "../components/StatusBadge";
import { useAppointment } from "../AppointmentContext";
import { useAuth } from "../../auth/context/AuthContext";
import { Video } from "lucide-react";

/**
 * Helper to convert Date to YYYY-MM-DD key
 */
const toKey = (d) =>
  d instanceof Date && !isNaN(d)
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    : "";

/**
 * Parse HH:mm:ss or HH:mm into minutes from midnight
 */
const parseTimeToMinutes = (t) => {
  if (!t) return 0;
  // Handle both "09:00:00" and "09:00 AM" if needed, 
  // though real data is likely HH:mm:ss
  if (t.includes("AM") || t.includes("PM")) {
    const [timePart, period] = t.split(" ");
    let [h, m] = timePart.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h * 60 + m;
  }
  
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const formatTime12h = (t) => {
  if (!t) return "";
  const minutes = parseTimeToMinutes(t);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
};

/**
 * DailySchedulePage – /doctor/schedule
 * Calendar date selector + timeline for that day's appointments.
 */
const DailySchedulePage = () => {
  const { user } = useAuth();
  const { appointments, fetchAppointments, loading } = useAppointment();
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchAppointments().catch(() => {});
  }, [fetchAppointments]);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayKey = toKey(now);

  const schedule = useMemo(() => {
    const key = toKey(selectedDate);
    return appointments
      .filter((a) => a.date === key)
      .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
  }, [appointments, selectedDate]);

  const highlightDates = useMemo(() => {
    const dates = new Set();
    appointments.forEach((a) => {
      if (a.date) dates.add(a.date);
    });
    return Array.from(dates);
  }, [appointments]);

  // Find current/next appointment for TODAY only
  const isSelectedDateToday = toKey(selectedDate) === todayKey;
  
  const current = useMemo(() => {
    if (!isSelectedDateToday) return null;
    return schedule.find((a) => {
      const t = parseTimeToMinutes(a.time);
      return t <= nowMinutes && nowMinutes < t + 30; // 30 min window
    });
  }, [isSelectedDateToday, schedule, nowMinutes]);

  const next = useMemo(() => {
    if (!isSelectedDateToday) return null;
    return schedule.find((a) => parseTimeToMinutes(a.time) > nowMinutes);
  }, [isSelectedDateToday, schedule, nowMinutes]);

  return (
    <div className="px-4 py-8 min-h-screen to-blue-50 bg-linear-to-br from-slate-50">
      <div className="mx-auto max-w-4xl">
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-slate-800">Daily Schedule</h1>
          <p className="mt-1 text-sm text-slate-500">
            View your appointments and patient volume for any selected day.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Calendar Picker */}
          <div className="md:col-span-2">
            <CalendarView
              selected={selectedDate}
              onSelect={setSelectedDate}
              highlightDates={highlightDates}
            />
            
            <div className="p-5 mt-6 bg-white rounded-2xl border shadow-sm border-slate-200">
              <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400">
                Day Summary
              </h3>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Total Booked</span>
                  <span className="text-lg font-bold text-slate-800">{schedule.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Pending Requests</span>
                  <span className="text-lg font-bold text-amber-600">
                    {schedule.filter(a => a.status === "BOOKED").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Confirmed</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {schedule.filter(a => a.status === "ACCEPTED").length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline View */}
          <div className="md:col-span-3">
            <div className="overflow-hidden bg-white rounded-2xl border shadow-sm border-slate-200">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800">
                  {selectedDate.toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-500">
                    {schedule.length} Appt{schedule.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-24">
                  <div className="w-8 h-8 rounded-full border-4 border-slate-100 animate-spin border-t-blue-600" />
                </div>
              ) : schedule.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <div className="inline-flex justify-center items-center mb-4 w-16 h-16 rounded-full bg-slate-50">
                    <span className="text-3xl">📅</span>
                  </div>
                  <p className="font-medium">No appointments for this day</p>
                  <p className="mt-1 text-xs">Dates with dots on the calendar have bookings</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {schedule.map((appt) => {
                    const isCurrent = current?.id === appt.id;
                    const isNext = !current && next?.id === appt.id;
                    const status = appt.status?.toUpperCase();

                    return (
                      <div
                        key={appt.id}
                        className={`group relative flex items-start gap-5 px-6 py-5 transition-all
                          ${isCurrent ? "bg-blue-50/50" : "hover:bg-slate-50/50"}`}
                      >
                        {/* Indicative Sidebar for priority */}
                        {(isCurrent || isNext) && (
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                            isCurrent ? "bg-blue-500" : "bg-amber-400"
                          }`} />
                        )}

                        {/* Time column */}
                        <div className="w-20 pt-1 shrink-0">
                          <p className="text-sm font-black text-slate-800">
                            {formatTime12h(appt.time)}
                          </p>
                          {isCurrent && (
                            <span className="inline-block px-1.5 py-0.5 mt-1 text-[10px] font-black uppercase tracking-tighter rounded bg-blue-100 text-blue-600">
                              Active
                            </span>
                          )}
                          {isNext && (
                            <span className="inline-block px-1.5 py-0.5 mt-1 text-[10px] font-black uppercase tracking-tighter rounded bg-amber-100 text-amber-600">
                              Up Next
                            </span>
                          )}
                        </div>

                        {/* Info column */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-2 justify-between items-start mb-1">
                            <h3 className="text-base font-bold text-slate-900 truncate">
                              {appt.patientName}
                            </h3>
                            <StatusBadge status={appt.status} />
                          </div>
                          
                          <p className="text-sm leading-relaxed text-slate-500 line-clamp-2">
                            {appt.reason || "No consultation reason provided."}
                          </p>

                          {/* Quick Actions for Schedule */}
                          {status === "ACCEPTED" && (
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => window.open(`/doctor/session/${appt.id}`, "_blank", "noopener,noreferrer")}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-blue-600 rounded-lg border border-blue-200 transition-colors bg-blue-50 hover:bg-blue-600 hover:text-white"
                              >
                                <Video className="w-3.5 h-3.5" />
                                Open Video Session
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 px-1 mt-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Currently Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Up Next</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center w-1.5 h-1.5 bg-blue-500 rounded-full outline-offset-2 outline-slate-200 outline-1" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Has Bookings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySchedulePage;
