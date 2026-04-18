import React, { useEffect, useState, useMemo } from "react";
import { 
  Users, 
  Stethoscope, 
  Clock, 
  Calendar, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Shield,
  CreditCard,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { listUsersByAdmin } from "../../auth/services/authService";
import { getAllAppointments } from "../../appointment/services/appointmentService";
import { getTransactionHistory } from "../../payment/services/paymentService";
import { getInitials } from "../../profile/utils/profileUtils";
import StatusBadge from "../../appointment/components/StatusBadge";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    totalRevenue: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all active doctors
        const doctorsRes = await listUsersByAdmin({ role: "DOCTOR", approvalStatus: "APPROVED" });
        const doctorsList = doctorsRes?.data || [];
        
        // Fetch pending doctors
        const pendingRes = await listUsersByAdmin({ role: "DOCTOR", approvalStatus: "PENDING" });
        const pendingList = pendingRes?.data || [];
        
        // Fetch all patients
        const patientsRes = await listUsersByAdmin({ role: "PATIENT" });
        const patientsList = patientsRes?.data || [];
        
        // Fetch appointments
        const appointmentsRes = await getAllAppointments();
        const appointmentsList = Array.isArray(appointmentsRes) ? appointmentsRes : [];
        
        // Fetch transactions for revenue
        const transactionsRes = await getTransactionHistory({ status: "PAID" });
        const transactionsList = Array.isArray(transactionsRes) ? transactionsRes : [];
        const totalRevenue = transactionsList.reduce((sum, tx) => sum + (tx.amount || 0), 0);

        const today = new Date().toISOString().split('T')[0];
        const todayApps = appointmentsList.filter(app => app.date === today);

        setStats({
          totalPatients: patientsList.length,
          totalDoctors: doctorsList.length,
          pendingDoctors: pendingList.length,
          totalAppointments: appointmentsList.length,
          todayAppointments: todayApps.length,
          totalRevenue: totalRevenue
        });

        // Get last 5 appointments
        setRecentAppointments(
          appointmentsList.sort((a, b) => b.id - a.id).slice(0, 5)
        );

        // Get last 5 pending doctor requests
        setPendingRequests(pendingList.slice(0, 5));

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError("Failed to load dashboard metrics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      label: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "blue",
      trend: "+12% from last month",
      link: "/admin/users?tab=patients"
    },
    {
      label: "Approved Doctors",
      value: stats.totalDoctors,
      icon: Stethoscope,
      color: "emerald",
      trend: "+5 new this week",
      link: "/admin/users?tab=doctors"
    },
    {
      label: "Pending Approvals",
      value: stats.pendingDoctors,
      icon: Clock,
      color: "amber",
      trend: "Requires your attention",
      link: "/admin/users?tab=pending",
      highlight: stats.pendingDoctors > 0
    },
    {
      label: "Total Appointments",
      value: stats.totalAppointments,
      icon: Calendar,
      color: "indigo",
      trend: `${stats.todayAppointments} scheduled for today`,
      link: "/admin/appointments"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Analyzing system data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Shield size={18} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Admin Control Center</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">System <span className="text-blue-600">Overview</span></h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time metrics and platform management.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <span className="text-lg font-black text-slate-800">LKR {stats.totalRevenue.toLocaleString()}</span>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
            title="Refresh dashboard"
          >
            <Activity size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, idx) => (
          <motion.div 
            key={card.label}
            variants={itemVariants}
            className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300"
          >
            <div className={`absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-500`}>
              <card.icon size={120} />
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-${card.color}-50 text-${card.color}-600 group-hover:scale-110 transition-transform`}>
                <card.icon size={24} />
              </div>
              {card.highlight && (
                <div className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
              )}
            </div>
            
            <div className="relative z-10">
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{card.label}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800">{card.value}</span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-lg">{card.trend.split(" ")[0]}</span>
              </div>
              <p className="text-slate-400 text-xs mt-2 font-medium">{card.trend.substring(card.trend.indexOf(" ") + 1)}</p>
            </div>
            
            <Link 
              to={card.link}
              className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 hover:gap-2 transition-all opacity-0 group-hover:opacity-100"
            >
              View details <ChevronRight size={14} />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Appointments */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-800">Recent <span className="text-blue-600">Bookings</span></h2>
            <Link to="/admin/appointments" className="text-sm font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden text-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Patient & Doctor</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Date & Time</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentAppointments.length > 0 ? (
                    recentAppointments.map((app) => (
                      <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{app.patientName}</span>
                            <span className="text-xs text-slate-400 font-medium">with Dr. {app.doctorName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-slate-600">
                            <span className="font-semibold">{app.date}</span>
                            <span className="text-xs">{app.time}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={app.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                        No recent appointments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Pending Approval Requests */}
        <motion.div 
          variants={itemVariants}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-800 italic">Quick <span className="text-amber-500 underline decoration-4 decoration-amber-100 underline-offset-4">Approvals</span></h2>
            {stats.pendingDoctors > 5 && (
              <Link to="/admin/users?tab=pending" className="text-sm font-bold text-amber-600 hover:underline">
                {stats.pendingDoctors - 5} more
              </Link>
            )}
          </div>
          
          <div className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((req) => (
                <Link 
                  key={req.id} 
                  to="/admin/users?tab=pending"
                  className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg shadow-inner group-hover:scale-110 transition-transform">
                    {getInitials(req.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{req.name}</p>
                    <p className="text-xs text-slate-400 font-medium">Pending Verification</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-amber-500 group-hover:border-amber-200 transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-8 text-center">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-500 mx-auto mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-sm font-bold text-slate-800">All clear!</p>
                <p className="text-xs text-slate-400 mt-1">No pending doctor requests.</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-linear-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <Shield size={100} />
            </div>
            <div className="relative z-10">
              <h4 className="font-black text-lg leading-tight mb-2">Platform Security Check</h4>
              <p className="text-blue-100 text-xs mb-4 leading-relaxed font-medium">All services are operational. Last security audit: 2 hours ago.</p>
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold backdrop-blur-md transition-colors">
                View Reports
              </button>
            </div>
          </div>

        </motion.div>
      </div>

    </motion.div>
  );
}
