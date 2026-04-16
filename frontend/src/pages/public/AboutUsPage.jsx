/* eslint-disable no-unused-vars */
import { memo, useMemo } from "react";
import {
  Info,
  HeartHandshake,
  ShieldCheck,
  Globe,
  Users,
  Building2,
  BadgeCheck,
  Stethoscope,
  Sparkles,
  Activity,
  ChevronRight,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import PageShell, {
  SectionCard,
  InfoList,
  ContentSection,
  RevealOnScroll,
} from "./SupportPageLayout";

// -----------------------------------------------------------------------------
// Small UI helpers
// -----------------------------------------------------------------------------

const Bone = memo(function Bone({ className = "" }) {
  return (
    <div
      className={`rounded-xl animate-pulse bg-slate-200/70 ${className}`}
      aria-hidden="true"
    />
  );
});

const AboutPageSkeleton = memo(function AboutPageSkeleton() {
  return (
    <div className="px-4 py-6 mx-auto w-full max-w-7xl sm:px-6 lg:px-8 lg:py-10">
      <div className="space-y-6">
        <div className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200">
          <Bone className="w-20 h-4" />
          <Bone className="mt-4 w-72 max-w-full h-8" />
          <Bone className="mt-3 max-w-full h-4 w-xl" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200">
              <Bone className="w-40 h-6" />
              <Bone className="mt-2 w-72 max-w-full h-4" />
              <div className="mt-6 space-y-3">
                <Bone className="w-full h-4" />
                <Bone className="w-full h-4" />
                <Bone className="w-5/6 h-4" />
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200">
              <Bone className="w-44 h-6" />
              <Bone className="mt-2 w-80 max-w-full h-4" />
              <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Bone key={index} className="w-full h-32 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200">
            <Bone className="w-40 h-6" />
            <Bone className="mt-2 w-52 max-w-full h-4" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Bone key={index} className="w-full h-24 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const InlineErrorState = memo(function InlineErrorState({
  message = "Something went wrong while loading this page.",
}) {
  return (
    <div className="p-6 rounded-3xl border border-red-200 shadow-sm bg-red-50/80">
      <div className="flex gap-3 items-start">
        <div className="flex justify-center items-center w-11 h-11 text-red-500 bg-white rounded-2xl shadow-sm shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-red-800">Unable to load page</h3>
          <p className="mt-1 text-sm leading-6 text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );
});

const EmptyState = memo(function EmptyState({
  title = "No content available",
  description = "There is nothing to display right now.",
}) {
  return (
    <div className="px-6 py-12 text-center rounded-3xl border border-dashed shadow-sm border-slate-300 bg-slate-50/80">
      <div className="flex justify-center items-center mx-auto w-14 h-14 bg-white rounded-2xl shadow-sm text-slate-500">
        <FileText className="w-6 h-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
});

const StatCard = memo(function StatCard({ icon: Icon, title, value, description }) {
  return (
    <div className="p-4 bg-white rounded-2xl border shadow-sm transition-all duration-300 group border-slate-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex gap-3 items-start">
        <div className="flex justify-center items-center w-11 h-11 rounded-2xl transition-transform duration-300 shrink-0 bg-primary/10 text-primary group-hover:scale-105">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {title}
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
});

const MiniFeatureCard = memo(function MiniFeatureCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="p-4 rounded-2xl border transition-all duration-300 group border-slate-200 bg-slate-50/60 hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-sm">
      <div className="flex gap-3 items-start">
        <div className="flex justify-center items-center w-10 h-10 bg-white rounded-xl shadow-sm transition-transform duration-300 shrink-0 text-primary group-hover:scale-105">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
});

// -----------------------------------------------------------------------------
// Main Page
// -----------------------------------------------------------------------------

export default function AboutUsPage({
  isLoading = false,
  hasError = false,
  isEmpty = false,
}) {
  const highlights = useMemo(
    () => [
      {
        icon: HeartHandshake,
        label: "Mission",
        value: "Make trusted healthcare access easier, safer, and more connected.",
      },
      {
        icon: ShieldCheck,
        label: "Commitment",
        value: "Protect user privacy, security, and responsible medical communication.",
      },
      {
        icon: Globe,
        label: "Vision",
        value: "Build a modern digital healthcare platform that scales with real patient needs.",
      },
      {
        icon: Users,
        label: "Audience",
        value: "Patients, doctors, admins, and healthcare teams using one connected system.",
      },
    ],
    []
  );

  const trustStats = useMemo(
    () => [
      {
        icon: Activity,
        title: "Focus",
        value: "Connected Care",
        description: "Built to streamline communication between patients, doctors, and administrators.",
      },
      {
        icon: ShieldCheck,
        title: "Priority",
        value: "Security First",
        description: "Privacy, controlled access, and secure workflows are treated as core requirements.",
      },
      {
        icon: Sparkles,
        title: "Experience",
        value: "Modern UX",
        description: "Designed to reduce friction, confusion, and unnecessary steps in healthcare tasks.",
      },
    ],
    []
  );

  const capabilities = useMemo(
    () => [
      {
        icon: Stethoscope,
        title: "Healthcare Coordination",
        description:
          "Supports core healthcare workflows through one connected digital platform.",
      },
      {
        icon: Users,
        title: "Role-Based Experience",
        description:
          "Different user types can work inside the same system with clear responsibilities and access control.",
      },
      {
        icon: ShieldCheck,
        title: "Reliable Access",
        description:
          "Built around trust, account protection, and operational consistency.",
      },
      {
        icon: Globe,
        title: "Scalable Direction",
        description:
          "Ready to evolve as digital healthcare needs continue to grow.",
      },
    ],
    []
  );

  if (isLoading) {
    return <AboutPageSkeleton />;
  }

  return (
    <PageShell
      eyebrow="Company"
      title="About MediSync"
      description="MediSync is designed to simplify healthcare communication by connecting patients, doctors, and administrators through a secure, modern, and efficient digital platform."
      icon={Info}
    >
      {hasError ? (
        <InlineErrorState message="We couldn't load the About Us content right now. Please try again later." />
      ) : isEmpty ? (
        <EmptyState
          title="About content unavailable"
          description="There is currently no About Us content to display."
        />
      ) : (
        <div className="space-y-6">
          <RevealOnScroll>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {trustStats.map((item) => (
                <StatCard
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  value={item.value}
                  description={item.description}
                />
              ))}
            </section>
          </RevealOnScroll>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <RevealOnScroll>
                <SectionCard
                  title="Who We Are"
                  description="A healthcare platform focused on clarity, trust, and accessibility."
                  icon={Building2}
                >
                  <div className="space-y-4">
                    <p className="text-sm leading-7 text-slate-600">
                      MediSync is a healthcare application built to improve how
                      medical services are delivered digitally. Instead of forcing
                      users through fragmented workflows, the platform brings core
                      healthcare actions into one place with a cleaner and more
                      reliable experience.
                    </p>
                    <p className="text-sm leading-7 text-slate-600">
                      The goal is not to make healthcare look flashy. The goal is
                      to make it easier to use, more secure, and more dependable
                      for both patients and providers.
                    </p>

                    <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                      {capabilities.map((item) => (
                        <MiniFeatureCard
                          key={item.title}
                          icon={item.icon}
                          title={item.title}
                          description={item.description}
                        />
                      ))}
                    </div>
                  </div>
                </SectionCard>
              </RevealOnScroll>

              <RevealOnScroll delay={120}>
                <SectionCard
                  title="What We Stand For"
                  description="These are the principles that shape the platform."
                  icon={BadgeCheck}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ContentSection
                      title="Patient-first experience"
                      paragraphs={[
                        "Users should be able to access healthcare services without dealing with confusing steps, weak communication, or outdated processes.",
                      ]}
                    />
                    <ContentSection
                      title="Trust and security"
                      paragraphs={[
                        "Healthcare systems handle sensitive information. That means privacy, secure authentication, and controlled access are not optional.",
                      ]}
                    />
                    <ContentSection
                      title="Professional reliability"
                      paragraphs={[
                        "Doctors and administrators need a system that works consistently and supports real operational decisions.",
                      ]}
                    />
                    <ContentSection
                      title="Modern digital healthcare"
                      paragraphs={[
                        "MediSync is built to support evolving care models, digital interaction, and scalable healthcare workflows.",
                      ]}
                    />
                  </div>
                </SectionCard>
              </RevealOnScroll>
            </div>

            <div className="space-y-6">
              <RevealOnScroll delay={180}>
                <SectionCard
                  title="Platform Highlights"
                  description="A quick overview of the platform's focus."
                  icon={Stethoscope}
                >
                  <InfoList items={highlights} />
                </SectionCard>
              </RevealOnScroll>

              <RevealOnScroll delay={240}>
                <section className="overflow-hidden via-white to-emerald-50 rounded-3xl border shadow-sm transition-all duration-300 bg-linear-to-br border-slate-200 from-primary/10 hover:shadow-md">
                  <div className="p-5 sm:p-6">
                    <div className="flex gap-3 items-start">
                      <div className="flex justify-center items-center w-11 h-11 bg-white rounded-2xl shadow-sm shrink-0 text-primary">
                        <Info className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                          Why MediSync Matters
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          Healthcare platforms fail when they are confusing,
                          inconsistent, or careless with trust. MediSync is built
                          to reduce that failure by keeping the experience cleaner,
                          more secure, and easier to use.
                        </p>
                        <div className="inline-flex gap-2 items-center mt-4 text-sm font-medium text-primary">
                          <ChevronRight className="w-4 h-4" />
                          Designed for real healthcare use
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
