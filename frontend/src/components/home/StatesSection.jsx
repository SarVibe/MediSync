import { memo } from "react";
import { Activity, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import RevealOnScroll from "../common/RevealOnScroll";
import SectionTitle from "./SectionTitle";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Secure by design",
    description:
      "Role-aware access and protected workflows help patients, doctors, and admins interact with confidence.",
    tone: "emerald",
  },
  {
    icon: UsersRound,
    title: "Built for every role",
    description:
      "One connected experience keeps patient care, doctor actions, and administrative oversight aligned.",
    tone: "blue",
  },
  {
    icon: Activity,
    title: "Clear care coordination",
    description:
      "Appointments, profiles, and follow-up actions stay organized so users always know what comes next.",
    tone: "rose",
  },
];

const toneMap = {
  emerald: {
    badge: "bg-emerald-100 text-emerald-700",
    border: "hover:border-emerald-200",
  },
  blue: {
    badge: "bg-blue-100 text-blue-700",
    border: "hover:border-blue-200",
  },
  rose: {
    badge: "bg-rose-100 text-rose-700",
    border: "hover:border-rose-200",
  },
};

const PillarCard = memo(function PillarCard({ icon, title, description, tone, delay }) {
  const Icon = icon;
  const styles = toneMap[tone];

  return (
    <RevealOnScroll delay={delay}>
      <article
        className={`h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${styles.border}`}
      >
        <div className={`inline-flex rounded-2xl p-3 ${styles.badge}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </article>
    </RevealOnScroll>
  );
});

const StatesSection = memo(function StatesSection() {
  return (
    <section
      id="experience"
      className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="grid gap-8 items-stretch lg:grid-cols-[1.1fr_0.9fr]">
        <RevealOnScroll>
          <div className="p-8 text-white border shadow-xl rounded-4xl border-slate-200 bg-slate-950 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold tracking-[0.18em] uppercase text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Why MediSync
            </div>

            <h2 className="mt-6 max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              A healthcare platform that feels clear, reliable, and ready for daily use
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              MediSync is designed to reduce friction across the full care journey,
              from first booking to ongoing coordination between patients, doctors,
              and administrators.
            </p>

            <div className="grid gap-4 mt-8 sm:grid-cols-3">
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-2xl font-black text-white">Patients</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Book care faster and keep health information organized.
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-2xl font-black text-white">Doctors</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Review appointments and respond through a focused workflow.
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-2xl font-black text-white">Admins</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Maintain visibility, approvals, and platform control in one place.
                </p>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        <div className="flex flex-col justify-center">
          <RevealOnScroll delay={80}>
            <SectionTitle
              eyebrow="Platform Value"
              title="Made for trust, coordination, and ease of use"
              description="Instead of previewing internal UI states, this section explains why the product matters to real users."
            />
          </RevealOnScroll>

          <div className="grid gap-5 mt-8">
            {pillars.map((pillar, index) => (
              <PillarCard key={pillar.title} {...pillar} delay={index * 90 + 120} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

export default StatesSection;
