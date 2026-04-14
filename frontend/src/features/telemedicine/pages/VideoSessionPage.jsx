import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getAppointmentById } from "../../appointment/services/appointmentService";
import {
  createVideoSession,
  endVideoSession,
  getVideoSession,
  joinVideoSession,
} from "../services/sessionService";
import { useAuth } from "../../auth/context/AuthContext";
 
function formatDateTime(value) {
  if (!value) {
    return "-";
  }
 
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
 
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
 
function formatCountdown(targetDate) {
  if (!targetDate) {
    return null;
  }
 
  const diffMs = targetDate.getTime() - Date.now();
  if (diffMs <= 0) {
    return "Join window is open";
  }
 
  const totalMinutes = Math.ceil(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
 
  if (hours <= 0) {
    return `Join available in ${minutes} min`;
  }
 
  return `Join available in ${hours}h ${minutes}m`;
}
 
function getReturnRoute(role) {
  switch (String(role || "").toUpperCase()) {
    case "DOCTOR":
      return "/doctor/appointments";
    case "PATIENT":
      return "/patient/appointments";
    case "ADMIN":
      return "/admin/appointments";
    default:
      return "/auth/login";
  }
}
 
const VideoSessionPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
 
  const [appointment, setAppointment] = useState(null);
  const [session, setSession] = useState(null);
  const [joinWindowStartsAt, setJoinWindowStartsAt] = useState(null);
  const [iframeSrc, setIframeSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");
 
  useEffect(() => {
    let active = true;
 
    async function loadSessionShell() {
      setLoading(true);
      setError("");
 
      try {
        const [appointmentData, sessionData] = await Promise.all([
          getAppointmentById(appointmentId),
          getVideoSession(appointmentId).catch(() => null),
        ]);
 
        if (!active) {
          return;
        }
 
        setAppointment(appointmentData);
 
        if (sessionData) {
          setSession(sessionData);
          if (sessionData.scheduledTime) {
            setJoinWindowStartsAt(new Date(new Date(sessionData.scheduledTime).getTime() - 10 * 60000));
          }
          return;
        }
 
        const createdSession = await createVideoSession(appointmentId);
        if (!active) {
          return;
        }
 
        setSession(createdSession);
        if (createdSession?.scheduledTime) {
          setJoinWindowStartsAt(new Date(new Date(createdSession.scheduledTime).getTime() - 10 * 60000));
        }
      } catch (requestError) {
        if (!active) {
          return;
        }
 
        setError(
          requestError?.response?.data?.message ||
            "Unable to load the telemedicine session for this appointment.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
 
    loadSessionShell();
    return () => {
      active = false;
    };
  }, [appointmentId]);
 
  const canJoin = useMemo(() => {
    if (!session?.scheduledTime) {
      return false;
    }
    return Date.now() >= new Date(session.scheduledTime).getTime() - 10 * 60000;
  }, [session]);
 
  const joinStatusText = useMemo(() => {
    if (!session) {
      return null;
    }
    if (session.status === "COMPLETED") {
      return "This consultation has already been completed.";
    }
    if (session.status === "CANCELLED") {
      return "This consultation was cancelled.";
    }
    return formatCountdown(joinWindowStartsAt);
  }, [joinWindowStartsAt, session]);
 
  async function handleJoin() {
    setJoining(true);
    setError("");
 
    try {
      const response = await joinVideoSession(appointmentId);
      setSession(response.session);
      setJoinWindowStartsAt(response.joinWindowStartsAt ? new Date(response.joinWindowStartsAt) : null);
      setIframeSrc(response.session?.meetingLink || "");
      toast.success("Session joined.");
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to join the session right now.",
      );
    } finally {
      setJoining(false);
    }
  }
 
  async function handleEnd() {
    const confirmed = window.confirm("End this consultation session?");
    if (!confirmed) {
      return;
    }
 
    setEnding(true);
    setError("");
 
    try {
      const endedSession = await endVideoSession(appointmentId, "COMPLETED");
      setSession(endedSession);
      setIframeSrc("");
      toast.success("Session ended.");
      navigate(getReturnRoute(user?.role));
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to end the session right now.",
      );
    } finally {
      setEnding(false);
    }
  }
 
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
          <span className="text-sm font-semibold tracking-wide">Preparing your consultation room...</span>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)] px-4 py-6 text-white md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300/80">
              Telemedicine Session
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
              Appointment #{appointmentId}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {appointment?.doctorName || session?.doctorName || "Doctor"} with{" "}
              {appointment?.patientName || session?.patientName || "Patient"}
            </p>
          </div>
 
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">
              {session?.status || appointment?.status || "Unknown"}
            </span>
            <button
              onClick={() => navigate(getReturnRoute(user?.role))}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5"
            >
              Back
            </button>
          </div>
        </div>
 
        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}
 
        <div className="grid gap-6 lg:grid-cols-[1.65fr_0.85fr]">
          <section className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/60 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            {iframeSrc ? (
              <iframe
                title={`Jitsi session for appointment ${appointmentId}`}
                src={iframeSrc}
                allow="camera; microphone; fullscreen; display-capture"
                className="h-[72vh] w-full border-0"
              />
            ) : (
              <div className="flex h-[72vh] flex-col items-center justify-center gap-5 px-6 text-center">
                <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.35em] text-cyan-200">
                  Jitsi Room Ready
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-white">
                    {session?.status === "COMPLETED"
                      ? "Session completed"
                      : session?.status === "CANCELLED"
                        ? "Session cancelled"
                        : "Join when the window opens"}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                    {joinStatusText ||
                      "The session room is being prepared. Once joined, the Jitsi conference will load here."}
                  </p>
                </div>
 
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleJoin}
                    disabled={joining || !canJoin || session?.status === "COMPLETED" || session?.status === "CANCELLED"}
                    className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                  >
                    {joining ? "Joining..." : "Join Session"}
                  </button>
                  {session?.meetingLink && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/35 hover:bg-white/5"
                    >
                      Open in New Tab
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>
 
          <aside className="space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Session Details
              </p>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="text-slate-400">Scheduled Time</p>
                  <p className="mt-1 font-semibold text-white">
                    {formatDateTime(session?.scheduledTime || appointment?.scheduledAt)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Join Window Opens</p>
                  <p className="mt-1 font-semibold text-white">
                    {formatDateTime(joinWindowStartsAt)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Room ID</p>
                  <p className="mt-1 break-all font-mono text-xs text-cyan-100">
                    {session?.roomId || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Meeting Link</p>
                  <p className="mt-1 break-all text-xs text-slate-200">
                    {session?.meetingLink || "-"}
                  </p>
                </div>
              </div>
            </div>
 
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Appointment Context
              </p>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="text-slate-400">Doctor</p>
                  <p className="mt-1 font-semibold text-white">
                    {appointment?.doctorName || session?.doctorName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Patient</p>
                  <p className="mt-1 font-semibold text-white">
                    {appointment?.patientName || session?.patientName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Reason</p>
                  <p className="mt-1 leading-6 text-slate-200">
                    {appointment?.reason || "No reason provided."}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Appointment Status</p>
                  <p className="mt-1 font-semibold text-white">
                    {appointment?.status || "-"}
                  </p>
                </div>
              </div>
            </div>
 
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Actions
              </p>
              <div className="mt-4 grid gap-3">
                <button
                  onClick={handleJoin}
                  disabled={joining || !canJoin || Boolean(iframeSrc) || session?.status === "COMPLETED" || session?.status === "CANCELLED"}
                  className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {joining ? "Joining..." : iframeSrc ? "Joined" : "Join Consultation"}
                </button>
                <button
                  onClick={handleEnd}
                  disabled={ending || session?.status === "COMPLETED" || session?.status === "CANCELLED"}
                  className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {ending ? "Ending..." : "End Session"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
 
export default VideoSessionPage;
 
 