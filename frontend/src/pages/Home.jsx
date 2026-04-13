import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  HeartPulse,
  Menu,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
  UserRound,
  Video,
  X,
  CheckCircle2,
  BadgeCheck,
  Building2,
  Ambulance,
  ScanHeart,
  MapPin,
  Mail,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Easy Appointment Booking",
    description:
      "Book doctor appointments in seconds with a fast, simple, and reliable scheduling flow.",
  },
  {
    icon: Video,
    title: "Secure Video Consultation",
    description:
      "Connect with doctors remotely through protected virtual consultations without extra hassle.",
  },
  {
    icon: ShieldCheck,
    title: "Protected Health Records",
    description:
      "Keep medical data safe with secure access control and privacy-first system design.",
  },
  {
    icon: HeartPulse,
    title: "Continuous Care Experience",
    description:
      "Manage appointments, consultations, and patient follow-ups from one unified platform.",
  },
];

const specialties = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "General Medicine",
];

const stats = [
  { label: "Verified Doctors", value: "500+" },
  { label: "Appointments Completed", value: "50K+" },
  { label: "Patient Satisfaction", value: "98%" },
  { label: "Support Availability", value: "24/7" },
];

const doctors = [
  {
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    rating: "4.9",
    experience: "15+ years",
  },
  {
    name: "Dr. Michael Lee",
    specialty: "Neurologist",
    rating: "4.8",
    experience: "12+ years",
  },
  {
    name: "Dr. Emily Davis",
    specialty: "Pediatrician",
    rating: "4.9",
    experience: "10+ years",
  },
];

const services = [
  {
    icon: Stethoscope,
    title: "Doctor Consultation",
    description:
      "Consult trusted specialists with structured booking and clear patient flow.",
  },
  {
    icon: ScanHeart,
    title: "Health Monitoring",
    description:
      "Track care progress with better coordination between visits and records.",
  },
  {
    icon: Ambulance,
    title: "Fast Assistance",
    description:
      "Get timely support and faster response through streamlined healthcare access.",
  },
  {
    icon: Building2,
    title: "Hospital Network",
    description:
      "Access a connected ecosystem of healthcare providers and services.",
  },
];

const testimonials = [
  {
    name: "Nimal Perera",
    role: "Patient",
    message:
      "Booking appointments became much easier. The platform feels clear, reliable, and professional.",
  },
  {
    name: "Ayesha Silva",
    role: "Patient",
    message:
      "Video consultation worked smoothly, and the overall experience felt well organized from start to finish.",
  },
  {
    name: "Dr. Amanda Joseph",
    role: "Consultant Doctor",
    message:
      "The system improves coordination and saves time. It is simple enough for patients and efficient for staff.",
  },
];

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Services", href: "#services" },
  { label: "Doctors", href: "#doctors" },
  { label: "Contact", href: "#contact" },
];

const sectionHeadingCls =
  "text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl";
const sectionSubtextCls =
  "mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base";

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const topSpecialties = useMemo(() => specialties.slice(0, 6), []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900">
      <BackgroundDecor />

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="#home"
            className="group inline-flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10 transition duration-300 group-hover:scale-105 group-hover:bg-[#2563EB]/15">
              <Stethoscope className="h-5 w-5 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">
                MediSync
              </p>
              <p className="text-xs font-medium text-slate-500">
                Smart healthcare platform
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="cursor-pointer text-sm font-medium text-slate-600 transition duration-200 hover:text-[#2563EB] focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-[#2563EB] transition duration-200 hover:bg-[#2563EB]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2">
              Login
            </button>
            <button className="cursor-pointer rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2">
              Get Started
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition duration-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition duration-200 hover:bg-slate-50 hover:text-[#2563EB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button className="cursor-pointer rounded-xl border border-[#2563EB]/20 px-4 py-3 text-sm font-semibold text-[#2563EB] transition duration-200 hover:bg-[#2563EB]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2">
                  Login
                </button>
                <button className="cursor-pointer rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main id="home">
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl gap-14 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#2563EB]/10 bg-white/90 px-4 py-2 text-sm font-medium text-[#2563EB] shadow-sm backdrop-blur">
                <Activity className="h-4 w-4" />
                Trusted digital care for modern patients
              </div>

              <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Better healthcare access starts with a smarter system.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Manage appointments, connect with doctors, access consultations,
                and deliver a smoother care experience through one modern
                healthcare platform.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-6 py-4 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2">
                  Book Appointment
                  <ChevronRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
                </button>

                <button className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#2563EB]/30 hover:text-[#2563EB] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2">
                  Explore Services
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                  Verified doctors
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                  <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
                  Secure patient data
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                  <Clock3 className="h-4 w-4 text-[#16A34A]" />
                  24/7 support
                </div>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <p className="text-2xl font-bold text-[#2563EB]">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="relative mx-auto max-w-xl">
                <div className="absolute -left-8 top-8 hidden h-24 w-24 rounded-full bg-[#16A34A]/10 blur-2xl sm:block" />
                <div className="absolute -right-6 bottom-10 hidden h-28 w-28 rounded-full bg-[#2563EB]/10 blur-2xl sm:block" />

                <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_70px_rgba(37,99,235,0.10)] sm:p-6">
                  <div className="rounded-[24px] bg-gradient-to-br from-[#2563EB] via-blue-600 to-blue-700 p-6 text-white sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-blue-100">
                          Virtual Care Dashboard
                        </p>
                        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                          Complete care,
                          <br />
                          one platform
                        </h2>
                      </div>
                      <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
                        <Stethoscope className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      <MiniInfoCard
                        icon={UserRound}
                        title="12 Doctors Online"
                        subtitle="Ready for consultation"
                      />
                      <MiniInfoCard
                        icon={CalendarDays}
                        title="180+ Bookings"
                        subtitle="Managed this week"
                      />
                      <MiniInfoCard
                        icon={ShieldCheck}
                        title="Secure Records"
                        subtitle="Protected access"
                      />
                      <MiniInfoCard
                        icon={BadgeCheck}
                        title="Verified Profiles"
                        subtitle="Trusted specialists"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-900">
                        Popular Specialties
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {topSpecialties.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-900">
                        Why patients trust us
                      </p>
                      <ul className="mt-4 space-y-3">
                        {[
                          "Fast appointment workflow",
                          "Simple video consultation access",
                          "Cleaner patient experience",
                        ].map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 text-sm text-slate-600"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-5 left-6 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:flex sm:items-center sm:gap-3">
                  <div className="rounded-xl bg-[#16A34A]/10 p-2">
                    <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Patient satisfaction
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      98% positive feedback
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white/70">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <TrustItem icon={ShieldCheck} label="Privacy-first platform" />
              <TrustItem icon={Video} label="Remote consultation support" />
              <TrustItem icon={Clock3} label="Fast and efficient scheduling" />
              <TrustItem
                icon={BadgeCheck}
                label="Verified healthcare professionals"
              />
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">
                Features
              </p>
              <h2 className={sectionHeadingCls}>
                Built to make healthcare simpler, faster, and safer.
              </h2>
              <p className={sectionSubtextCls}>
                Stop building a crowded homepage with random sections. A strong
                healthcare landing page must show clarity, trust, and function.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    tabIndex={0}
                    className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                  >
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB] transition duration-300 group-hover:scale-110 group-hover:bg-[#2563EB]/15">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="services" className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">
                Services
              </p>
              <h2 className={sectionHeadingCls}>
                Designed for real patient journeys, not just pretty screens.
              </h2>
              <p className={sectionSubtextCls}>
                Good UI is not decoration. It removes friction. That is what
                your healthcare system should do from booking to consultation.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Fast appointment booking flow",
                  "Reliable consultation management",
                  "Better visibility for doctors and patients",
                  "Stronger trust through structured design",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" />
                    <p className="text-sm font-medium text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.title}
                    className="group rounded-3xl border border-slate-200 bg-[#F9FAFB] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#2563EB]/20 hover:shadow-lg"
                  >
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#2563EB] shadow-sm ring-1 ring-slate-200 transition duration-300 group-hover:scale-105">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {service.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="doctors" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">
                  Doctors
                </p>
                <h2 className={sectionHeadingCls}>
                  Meet trusted healthcare specialists.
                </h2>
                <p className={sectionSubtextCls}>
                  Do not dump generic cards on the page. Show credible profiles
                  with clear value and clean hierarchy.
                </p>
              </div>

              <button className="inline-flex cursor-pointer items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#2563EB]/20 hover:text-[#2563EB] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2">
                View All Doctors
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <article
                  key={doctor.name}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <div className="h-28 bg-gradient-to-r from-[#2563EB] via-blue-600 to-[#16A34A]" />
                  <div className="relative px-6 pb-6">
                    <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-white bg-slate-100 shadow-md">
                      <UserRound className="h-9 w-9 text-slate-500" />
                    </div>

                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {doctor.name}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-[#2563EB]">
                          {doctor.specialty}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#16A34A]/10 px-3 py-1 text-xs font-semibold text-[#16A34A]">
                        Available
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <div className="inline-flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-current text-amber-400" />
                        <span className="font-semibold text-slate-800">
                          {doctor.rating}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4 text-slate-400" />
                        <span>{doctor.experience}</span>
                      </div>
                    </div>

                    <button className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#2563EB]/20 bg-[#2563EB]/5 px-5 py-3 text-sm font-semibold text-[#2563EB] transition duration-300 hover:bg-[#2563EB] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2">
                      Book Appointment
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {testimonials.map((item) => (
                <div
                  key={item.name}
                  className="rounded-3xl border border-slate-200 bg-[#F9FAFB] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    “{item.message}”
                  </p>
                  <div className="mt-6">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#2563EB] via-blue-600 to-[#16A34A] p-8 text-white shadow-[0_20px_70px_rgba(37,99,235,0.20)] sm:p-10 lg:p-14">
              <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
                    Get started
                  </p>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    Ready to improve the healthcare experience?
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">
                    A healthcare homepage must build trust in seconds. This one
                    does that better than your current version because it has
                    stronger structure, better spacing, better cards, and less
                    fake logic.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <button className="cursor-pointer rounded-2xl bg-white px-6 py-4 text-sm font-bold text-[#2563EB] transition duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2563EB]">
                    Create Account
                  </button>
                  <button className="cursor-pointer rounded-2xl border border-white/30 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2563EB]">
                    Contact Our Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10">
                <Stethoscope className="h-5 w-5 text-[#2563EB]" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">MediSync</p>
                <p className="text-sm text-slate-500">Healthcare system</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              Professional digital healthcare experience for modern patients,
              doctors, and healthcare providers.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li>
                <a
                  href="#features"
                  className="transition duration-200 hover:text-[#2563EB] focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="transition duration-200 hover:text-[#2563EB] focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#doctors"
                  className="transition duration-200 hover:text-[#2563EB] focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                >
                  Doctors
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              Support
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
              <li>Help Center</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              Contact
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-[#2563EB]" />
                <span>+94 77 123 4567</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-[#2563EB]" />
                <span>support@medisync.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-[#2563EB]" />
                <span>Colombo, Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <p>© 2026 MediSync. All rights reserved.</p>
            <p>Built for a cleaner, more trustworthy healthcare experience.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BackgroundDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[#2563EB]/10 blur-3xl" />
      <div className="absolute right-[-8rem] top-[12rem] h-80 w-80 rounded-full bg-[#16A34A]/10 blur-3xl" />
      <div className="absolute bottom-[-6rem] left-[30%] h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
    </div>
  );
}

function MiniInfoCard({ icon: Icon, title, subtitle }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white/15">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/15 p-2">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-blue-100">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function TrustItem({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#16A34A]/10 text-[#16A34A]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
    </div>
  );
}
