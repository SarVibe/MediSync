import { memo, useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  ChevronRight,
  Clock3,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import RevealOnScroll from "../common/RevealOnScroll";

const stats = [
  { value: "24/7", label: "Available always", icon: Clock3 },
  { value: "3 Roles", label: "Patient · Doctor · Admin", icon: Users },
  { value: "Secure", label: "Token-based auth", icon: ShieldCheck },
  { value: "Smart", label: "Role-aware workflows", icon: Zap },
];

const dashboardHighlights = [
  {
    icon: CalendarCheck,
    label: "Appointments",
    value: "Book with clarity",
    color: "text-blue-300 bg-blue-500/20",
  },
  {
    icon: ShieldCheck,
    label: "Security",
    value: "Protected flows",
    color: "text-emerald-300 bg-emerald-500/20",
  },
];

const systemMetrics = [
  { label: "Patient onboarding", pct: 90 },
  { label: "Doctor approval", pct: 78 },
  { label: "Admin control", pct: 95 },
];

const StatCard = memo(function StatCard({ value, label, icon, delay }) {
  const Icon = icon;

  return (
    <RevealOnScroll delay={delay}>
      <div className="flex gap-3 items-center p-4 bg-white rounded-2xl border shadow-sm transition-all duration-300 cursor-default group border-slate-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition-all duration-300 group-hover:bg-emerald-50 group-hover:text-emerald-600">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-base font-bold leading-none text-slate-900">{value}</p>
          <p className="mt-0.5 text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </RevealOnScroll>
  );
});

const HeroSection = memo(function HeroSection() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setCount(current);

      if (current >= 1240) {
        clearInterval(id);
      }
    }, 2);

    return () => clearInterval(id);
  }, []);

  return (
    <section id="home" className="overflow-hidden relative">
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% -10%, rgba(37,99,235,0.09) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 80% 10%, rgba(22,163,74,0.09) 0%, transparent 55%), linear-gradient(to bottom, #f8fafc, #ffffff 40%)",
        }}
      />

      <div className="grid gap-12 items-center px-4 py-8 mx-auto max-w-7xl sm:px-6 sm:py-10 lg:grid-cols-2 lg:px-8 lg:py-14">
        <div>
          <RevealOnScroll>
            <div className="inline-flex gap-2 items-center px-4 py-2 mb-6 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full border border-blue-100">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              Secure, role-aware healthcare platform
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={80}>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Smarter digital care
              <br />
              <span className="inline-block relative mt-1">
                <span className="text-blue-600">Medi</span>
                <span className="text-emerald-600">Sync</span>
                <span
                  className="absolute left-0 -bottom-1 w-full h-1 rounded-full"
                  style={{ background: "linear-gradient(to right, #2563eb, #16a34a)" }}
                />
              </span>
            </h1>
          </RevealOnScroll>

          <RevealOnScroll delay={160}>
            <p className="mt-6 max-w-lg text-base leading-8 text-slate-500 sm:text-lg">
              Build trust between patients, doctors, and administrators with a
              modern platform that supports secure onboarding, appointment
              coordination, and role-based workflows.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={240}>
            <div className="flex flex-col gap-3 mt-8 sm:flex-row">
              <a
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Start with MediSync
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
              <a
                href="#features"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                Explore Features
                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={320}>
            <div className="grid grid-cols-2 gap-3 mt-10 xl:grid-cols-4">
              {stats.map((item, index) => (
                <StatCard key={item.label} {...item} delay={index * 60} />
              ))}
            </div>
          </RevealOnScroll>
        </div>

        <RevealOnScroll delay={200}>
          <div className="relative">
            <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-blue-100/60" />
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-emerald-100/60" />

            <div className="relative p-5 bg-white rounded-3xl border shadow-2xl border-slate-200 shadow-slate-200 sm:p-6">
              <div className="p-5 text-white rounded-2xl bg-slate-950 sm:p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Dashboard - Welcome to
                    </p>
                    <h3 className="mt-1 text-xl font-extrabold">
                      <span className="text-blue-400">Medi</span>
                      <span className="text-emerald-400">Sync</span>
                    </h3>
                  </div>
                  <div className="rounded-xl bg-white/10 p-2.5">
                    <HeartPulse className="w-5 h-5 text-emerald-300" />
                  </div>
                </div>

                <div className="p-4 mt-5 rounded-2xl ring-1 bg-white/5 ring-white/10">
                  <p className="text-xs text-slate-400">Active patients this month</p>
                  <p className="mt-1 text-3xl font-bold tabular-nums">
                    {count.toLocaleString()}
                    <span className="ml-1 text-sm text-emerald-400">↑ 12%</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  {dashboardHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10 transition duration-200 hover:bg-white/10 cursor-default"
                    >
                      <div className={`inline-flex rounded-lg p-2 ${item.color}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <p className="mt-2 text-xs text-slate-400">{item.label}</p>
                      <p className="text-sm font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 mt-4 rounded-2xl border border-slate-100 bg-slate-50">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-slate-900">System overview</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {systemMetrics.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="font-semibold text-slate-700">{item.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${item.pct}%`,
                            background: "linear-gradient(to right, #2563eb, #16a34a)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
});

export default HeroSection;
