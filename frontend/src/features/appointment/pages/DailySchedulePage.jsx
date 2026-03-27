import React, { useState, useEffect } from "react";
import CalendarView from "../components/CalendarView";
import StatusBadge from "../components/StatusBadge";

// ── Mock data ─────────────────────────────────────────────────────────────
const MOCK_SCHEDULE = {
  "2026-03-27": [
    { id:1, patientName:"Rahul Verma",  time:"09:00 AM", reason:"Chest pain",       status:"ACCEPTED"  },
    { id:2, patientName:"Ananya Singh", time:"10:30 AM", reason:"Routine check-up", status:"COMPLETED" },
    { id:3, patientName:"Kiran Rao",    time:"02:00 PM", reason:"BP monitoring",    status:"ACCEPTED"  },
  ],
  "2026-04-02": [
    { id:4, patientName:"Deepak Nair",  time:"09:30 AM", reason:"Follow-up ECG",   status:"ACCEPTED"  },
    { id:5, patientName:"Sneha Pillai", time:"12:00 PM", reason:"Skin rash",        status:"ACCEPTED"  },
  ],
};

const toKey = (d) =>
  d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` : "";

const now = new Date();
const nowMinutes = now.getHours() * 60 + now.getMinutes();

const parseTime = (t) => {
  const [timePart, period] = t.split(" ");
  let [h, m] = timePart.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

/**
 * DailySchedulePage – /doctor/schedule
 * Calendar date selector + timeline for that day's appointments.
 */
const DailySchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule,     setSchedule]     = useState([]);

  useEffect(() => {
    const key  = toKey(selectedDate);
    const data = MOCK_SCHEDULE[key] || [];
    setSchedule([...data].sort((a, b) => parseTime(a.time) - parseTime(b.time)));
  }, [selectedDate]);

  const highlightDates = Object.keys(MOCK_SCHEDULE);

  // Find current/next appointment
  const current = schedule.find((a) => {
    const t = parseTime(a.time);
    return t <= nowMinutes && nowMinutes < t + 30;
  });
  const next = schedule.find((a) => parseTime(a.time) > nowMinutes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-7">
          <h1 className="text-3xl font-bold text-slate-800">Daily Schedule</h1>
          <p className="text-slate-500 text-sm mt-1">View your appointments for any selected day.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Calendar */}
          <div className="md:col-span-2">
            <CalendarView
              selected={selectedDate}
              onSelect={setSelectedDate}
              highlightDates={highlightDates}
            />
          </div>

          {/* Timeline */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-700">
                  {selectedDate.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}
                </h2>
                <span className="text-xs text-slate-400">
                  {schedule.length} appointment{schedule.length !== 1 ? "s" : ""}
                </span>
              </div>

              {schedule.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-4xl mb-2">📅</p>
                  <p className="text-sm">No appointments for this day.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {schedule.map((appt) => {
                    const isCurrent = current?.id === appt.id;
                    const isNext    = !current && next?.id === appt.id;
                    return (
                      <div
                        key={appt.id}
                        className={`flex items-start gap-4 px-5 py-4 transition-colors
                          ${isCurrent ? "bg-blue-50 border-l-4 border-blue-500" : ""}
                          ${isNext    ? "bg-yellow-50 border-l-4 border-yellow-400" : ""}`}
                      >
                        {/* Time column */}
                        <div className="w-20 shrink-0 text-center pt-0.5">
                          <p className="text-sm font-bold text-blue-700">{appt.time}</p>
                          {isCurrent && (
                            <span className="text-xs text-blue-500 font-medium">Now</span>
                          )}
                          {isNext && (
                            <span className="text-xs text-yellow-600 font-medium">Next</span>
                          )}
                        </div>

                        {/* Connector */}
                        <div className="flex flex-col items-center pt-1.5">
                          <div className={`w-3 h-3 rounded-full border-2 ${
                            isCurrent ? "border-blue-500 bg-blue-500" :
                            isNext    ? "border-yellow-400 bg-yellow-300" :
                                        "border-slate-300 bg-white"
                          }`} />
                          <div className="w-px flex-1 bg-slate-200 mt-1" />
                        </div>

                        {/* Appointment info */}
                        <div className="flex-1 pb-3">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="font-semibold text-slate-800">{appt.patientName}</p>
                            <StatusBadge status={appt.status} />
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">{appt.reason}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Current
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-yellow-400 inline-block" /> Next
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> Has appointments (calendar)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySchedulePage;
