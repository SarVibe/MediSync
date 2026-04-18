import React, { useEffect, useMemo } from "react";
import {
  Users,
  Calendar,
  Clock,
  ClipboardList,
  TrendingUp,
  ChevronRight,
  Activity,
  CalendarCheck,
  Search,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { useAppointment } from "../AppointmentContext";
import { useMedical } from "../../records/MedicalContext";
import { getMyDoctorProfile } from "../../profile/services/profileService";
import { resolveProfileImageUrl, getInitials } from "../../profile/utils/profileUtils";
import { useState } from "react";

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const StatCard = ({ title, value, icon: Icon, color, trend, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color.bg} ${color.text}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
          <TrendingUp size={12} />
          {trend}
        </div>
      )}
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
    </div>
  </motion.div>
);

const AppointmentSummaryCard = ({ appointment }) => {
  const statusColors = {
    BOOKED: "bg-yellow-50 text-yellow-700 border-yellow-100",
    ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    COMPLETED: "bg-blue-50 text-blue-700 border-blue-100",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-100",
    REJECTED: "bg-slate-50 text-slate-700 border-slate-100",
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
          {appointment.patientName?.charAt(0) || "P"}
        </div>
        <div>
          <h4 className="font-semibold text-slate-800">{appointment.patientName}</h4>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {appointment.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {appointment.time}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[appointment.status] || "bg-slate-50"}`}>
          {appointment.status}
        </span>
        <Link to="/doctor/appointments" className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
          <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  );
};

const DoctorDashboardPage = () => {
  const { user } = useAuth();
  const { appointments, fetchAppointments, loading: apptLoading } = useAppointment();
  const { prescriptions, fetchDoctorPrescriptions, loading: medLoading } = useMedical();

  const [doctorProfile, setDoctorProfile] = useState(null);

  useEffect(() => {
    fetchAppointments();
    if (user?.id) {
      fetchDoctorPrescriptions(user.id);
      
      // Fetch doctor profile for image and other details
      getMyDoctorProfile()
        .then(res => setDoctorProfile(res?.data))
        .catch(() => setDoctorProfile(null));
    }
  }, [fetchAppointments, fetchDoctorPrescriptions, user?.id]);

  const todayStr = getTodayString();

  const stats = useMemo(() => {
    const todayAppts = appointments.filter((a) => a.date === todayStr);
    const pendingRequests = appointments.filter((a) => a.status === "BOOKED");
    const uniquePatients = new Set(appointments.map((a) => a.patientId)).size;

    return [
      {
        title: "Today's Appointments",
        value: todayAppts.length,
        icon: Clock,
        color: { bg: "bg-blue-50", text: "text-blue-600" },
        delay: 0.1,
      },
      {
        title: "Pending Requests",
        value: pendingRequests.length,
        icon: Activity,
        color: { bg: "bg-amber-50", text: "text-amber-600" },
        delay: 0.2,
      },
      {
        title: "Total Patients",
        value: uniquePatients,
        icon: Users,
        color: { bg: "bg-emerald-50", text: "text-emerald-600" },
        delay: 0.3,
      },
      {
        title: "Prescriptions Issued",
        value: prescriptions.length,
        icon: ClipboardList,
        color: { bg: "bg-indigo-50", text: "text-indigo-600" },
        delay: 0.4,
      },
    ];
  }, [appointments, prescriptions, todayStr]);

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.status === "ACCEPTED" || a.status === "BOOKED")
      .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
      .slice(0, 5);
  }, [appointments]);

  const recentActivity = useMemo(() => {
    return appointments
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }, [appointments]);

  if (apptLoading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-blue-50 flex items-center justify-center">
              {(doctorProfile?.profilePictureUrl || doctorProfile?.profileImageUrl) ? (
                <img 
                  src={resolveProfileImageUrl(doctorProfile.profilePictureUrl || doctorProfile.profileImageUrl)} 
                  alt={user?.name || "Doctor"} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/unknown.jpg";
                  }}
                />
              ) : (
                <span className="text-2xl font-black text-blue-600">
                  {getInitials(user?.name || user?.fullName || "Doctor")}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-xl border-4 border-white shadow-sm flex items-center justify-center">
               <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Welcome back, <span className="text-blue-600">Dr. {user?.name || user?.fullName || "Doctor"}</span>
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Here's what's happening with your practice today.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/doctor/schedule"
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Calendar size={18} />
            View Schedule
          </Link>
          <Link
            to="/doctor/prescriptions/create"
            className="flex items-center gap-2 bg-blue-600 px-4 py-2.5 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <Plus size={18} />
            New Prescription
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarCheck className="text-blue-600" size={24} />
              Upcoming Appointments
            </h2>
            <Link to="/doctor/appointments" className="text-sm font-bold text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-2">
            {upcomingAppointments.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {upcomingAppointments.map((appt) => (
                  <AppointmentSummaryCard key={appt.id} appointment={appt} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Calendar size={32} />
                </div>
                <h3 className="text-slate-800 font-bold mb-1">No upcoming appointments</h3>
                <p className="text-slate-500 text-sm">Your schedule is clear for now.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity or Side Panel */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="text-indigo-600" size={24} />
              Recent Activity
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-6">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {idx !== recentActivity.length - 1 && (
                      <div className="absolute left-[11px] top-7 bottom-0 w-[2px] bg-slate-100" />
                    )}
                    <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center z-10 ${activity.status === 'COMPLETED' ? 'bg-blue-100 text-blue-600' :
                        activity.status === 'BOOKED' ? 'bg-amber-100 text-amber-600' :
                          'bg-slate-100 text-slate-600'
                      }`}>
                      <div className="w-2 h-2 rounded-full bg-current" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {activity.status === 'BOOKED' ? 'New booking request' :
                          activity.status === 'COMPLETED' ? 'Appointment completed' :
                            `Appointment ${activity.status.toLowerCase()}`}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Patient: {activity.patientName}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase">
                        {activity.date} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No recent activity.</p>
            )}
          </div>

          {/* <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-blue-200">
            <h3 className="font-bold mb-2">Need help?</h3>
            <p className="text-blue-100 text-xs leading-relaxed mb-4">
              Access the help center for guides on managing appointments and prescriptions.
            </p>
            <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors">
              Go to Help Center
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
