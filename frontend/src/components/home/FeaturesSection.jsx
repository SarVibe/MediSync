import { memo } from "react";
import {
  CalendarCheck,
  ClipboardList,
  LockKeyhole,
  PhoneCall,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import RevealOnScroll from "../common/RevealOnScroll";
import SectionTitle from "./SectionTitle";

const features = [
  {
    icon: CalendarCheck,
    title: "Book in seconds",
    description:
      "Let patients schedule consultations with a clean, guided flow that reduces friction and missed bookings.",
    color: "blue",
  },
  {
    icon: Stethoscope,
    title: "Verified doctors",
    description:
      "Support secure doctor onboarding, approval workflows, and trusted access with clear administrative oversight.",
    color: "emerald",
  },
  {
    icon: LockKeyhole,
    title: "Secure auth flow",
    description:
      "Role-aware access, OTP login, token-based sessions, and safe profile onboarding for a stronger experience.",
    color: "violet",
  },
  {
    icon: ClipboardList,
    title: "Patient profiles",
    description:
      "Keep health-related account information organized so users can manage appointments and care journeys from one place.",
    color: "amber",
  },
  {
    icon: PhoneCall,
    title: "Digital coordination",
    description:
      "Bridge communication between patients, doctors, and admins using a streamlined, modern healthcare workflow.",
    color: "rose",
  },
  {
    icon: ShieldCheck,
    title: "Built for trust",
    description:
      "Present a reliable healthcare platform with strong visual hierarchy, protected actions, and transparent interactions.",
    color: "teal",
  },
];

const colorMap = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "hover:border-blue-200" },
  emerald: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    border: "hover:border-emerald-200",
  },
  violet: {
    bg: "bg-violet-50",
    icon: "text-violet-600",
    border: "hover:border-violet-200",
  },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "hover:border-amber-200" },
  rose: { bg: "bg-rose-50", icon: "text-rose-600", border: "hover:border-rose-200" },
  teal: { bg: "bg-teal-50", icon: "text-teal-600", border: "hover:border-teal-200" },
};

const FeatureCard = memo(function FeatureCard({
  icon,
  title,
  description,
  color,
  delay,
}) {
  const Icon = icon;
  const tone = colorMap[color];

  return (
    <RevealOnScroll delay={delay}>
      <article
        className={`group h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${tone.border} focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 cursor-default`}
      >
        <div
          className={`inline-flex rounded-xl ${tone.bg} p-3 ${tone.icon} transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </article>
    </RevealOnScroll>
  );
});

const FeaturesSection = memo(function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-24">
      <RevealOnScroll>
        <SectionTitle
          eyebrow="Core Features"
          title="Everything you need for modern healthcare"
          description="From secure onboarding to appointment coordination - every piece, thoughtfully built."
          centered
        />
      </RevealOnScroll>

      <div className="grid gap-5 mt-12 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} {...feature} delay={index * 60} />
        ))}
      </div>
    </section>
  );
});

export default FeaturesSection;
