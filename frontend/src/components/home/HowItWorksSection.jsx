import { memo } from "react";
import { ClipboardList, HeartPulse, UserRound } from "lucide-react";
import RevealOnScroll from "../common/RevealOnScroll";
import SectionTitle from "./SectionTitle";

const steps = [
  {
    step: "01",
    title: "Register or sign in",
    description:
      "Patients and doctors enter with a simple, secure account flow and guided onboarding to their role.",
    icon: UserRound,
  },
  {
    step: "02",
    title: "Complete your profile",
    description:
      "Capture key information so the system routes each user to the right dashboard and next action.",
    icon: ClipboardList,
  },
  {
    step: "03",
    title: "Access care workflows",
    description:
      "Book appointments, manage approvals, and coordinate healthcare actions from one reliable app.",
    icon: HeartPulse,
  },
];

const StepCard = memo(function StepCard({ step, title, description, icon, delay }) {
  const Icon = icon;

  return (
    <RevealOnScroll delay={delay}>
      <div className="relative p-6 h-full bg-white rounded-2xl border shadow-sm transition-all duration-300 cursor-default group border-slate-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
        <div className="flex justify-between items-center mb-5">
          <div className="flex justify-center items-center w-11 h-11 text-sm font-bold text-white rounded-xl bg-slate-950">
            {step}
          </div>
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        <div className="absolute -right-3 top-1/2 hidden h-0.5 w-6 -translate-y-1/2 rounded bg-slate-200 lg:block last:hidden" />
      </div>
    </RevealOnScroll>
  );
});

const HowItWorksSection = memo(function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 bg-slate-50 sm:py-20 lg:py-24">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <RevealOnScroll>
          <SectionTitle
            eyebrow="How It Works"
            title="Simple flow, real healthcare value"
            description="Three steps take users from sign-up to a fully coordinated care journey."
          />
        </RevealOnScroll>

        <div className="grid gap-6 mt-12 lg:grid-cols-3">
          {steps.map((step, index) => (
            <StepCard key={step.step} {...step} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default HowItWorksSection;
