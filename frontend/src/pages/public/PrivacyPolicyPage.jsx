/* eslint-disable no-unused-vars */
import { memo, useMemo } from "react";
import {
  Info,
  Lock,
  ShieldCheck,
  Database,
  UserCheck,
  FileSearch,
  ServerCrash,
} from "lucide-react";
import PageShell, {
  SectionCard,
  BulletList,
  ContentSection,
  InlineAlert,
  PageSkeleton,
  EmptyState,
  RevealOnScroll,
} from "./SupportPageLayout";

const PrivacySummaryCard = memo(function PrivacySummaryCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="p-4 bg-white rounded-2xl border shadow-sm transition-all duration-300 group border-slate-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
      <div className="flex gap-3 items-start">
        <div className="flex justify-center items-center w-11 h-11 rounded-2xl transition-transform duration-300 shrink-0 bg-primary/10 text-primary group-hover:scale-105">
          <Icon className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
});

const SectionAnchorNav = memo(function SectionAnchorNav({ items }) {
  return (
    <nav
      aria-label="Privacy policy sections"
      className="p-4 bg-white rounded-3xl border shadow-sm border-slate-200"
    >
      <div className="flex gap-2 items-center">
        <div className="flex justify-center items-center w-10 h-10 rounded-2xl bg-primary/10 text-primary">
          <FileSearch className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Quick Navigation</h2>
          <p className="text-xs text-slate-500">Jump to key privacy sections</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="flex justify-between items-center px-3 py-3 text-sm font-medium rounded-2xl border border-transparent transition-all duration-200 cursor-pointer group bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
          >
            <span>{item.label}</span>
            <span className="text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
});

const PrivacySectionBlock = memo(function PrivacySectionBlock({
  id,
  title,
  icon: Icon,
  paragraphs,
  bullets = [],
}) {
  return (
    <section
      id={id}
      className="p-4 rounded-2xl border transition-all duration-300 scroll-mt-24 border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white sm:p-5"
    >
      <div className="flex gap-3 items-center">
        <div className="flex justify-center items-center w-10 h-10 rounded-2xl shrink-0 bg-primary/10 text-primary">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
          {title}
        </h3>
      </div>

      <div className="mt-4">
        <ContentSection title={title} paragraphs={paragraphs} bullets={bullets} />
      </div>
    </section>
  );
});

export default function PrivacyPolicyPage({
  isLoading = false,
  hasError = false,
  isEmpty = false,
}) {
  const quickNavItems = useMemo(
    () => [
      { id: "information-we-collect", label: "Information We Collect" },
      { id: "how-we-use-information", label: "How We Use Information" },
      { id: "data-protection", label: "Data Protection" },
      { id: "user-rights", label: "User Rights" },
    ],
    []
  );

  const summaryCards = useMemo(
    () => [
      {
        icon: Database,
        title: "Essential Data Only",
        description:
          "We collect information needed to operate the platform and support healthcare workflows properly.",
      },
      {
        icon: ShieldCheck,
        title: "Security Focused",
        description:
          "We apply safeguards to reduce misuse, unauthorized access, and unnecessary exposure of user data.",
      },
      {
        icon: UserCheck,
        title: "User Respect",
        description:
          "Users should have clarity about what is collected, why it is used, and how to raise concerns.",
      },
    ],
    []
  );

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (hasError) {
    return (
      <PageShell
        eyebrow="Legal"
        title="Privacy Policy"
        description="How MediSync collects, uses, protects, and manages your information."
        icon={Lock}
      >
        <RevealOnScroll>
          <InlineAlert
            type="error"
            message="Failed to load the privacy policy content."
          />
        </RevealOnScroll>

        <RevealOnScroll delay={80} className="mt-6">
          <div className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200">
          <div className="flex flex-col gap-3 justify-center items-center text-center">
            <div className="flex justify-center items-center w-14 h-14 text-red-500 bg-red-50 rounded-2xl">
              <ServerCrash className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Unable to display privacy details
            </h2>
            <p className="max-w-md text-sm leading-6 text-slate-500">
              The privacy policy content could not be loaded right now. Fix the
              source or fetch logic instead of pretending this is acceptable.
            </p>
          </div>
          </div>
        </RevealOnScroll>
      </PageShell>
    );
  }

  if (isEmpty) {
    return (
      <PageShell
        eyebrow="Legal"
        title="Privacy Policy"
        description="How MediSync collects, uses, protects, and manages your information."
        icon={Lock}
      >
        <EmptyState
          title="Privacy policy unavailable"
          description="No privacy policy content is available right now."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      description="This Privacy Policy explains how MediSync collects, uses, stores, and protects personal information when users access the platform."
      icon={Lock}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card, index) => (
              <RevealOnScroll key={card.title} delay={index * 70}>
                <PrivacySummaryCard
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                />
              </RevealOnScroll>
            ))}
          </section>

          <RevealOnScroll delay={120}>
            <SectionCard
              title="Privacy Overview"
              description="A clear summary of how user information is handled across the platform."
              icon={ShieldCheck}
            >
              <div className="space-y-5">
                <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/70">
                  <div className="flex gap-3 items-start">
                    <div className="flex justify-center items-center w-10 h-10 text-blue-600 bg-white rounded-2xl shadow-sm shrink-0">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Why this matters
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Healthcare platforms deal with sensitive user information.
                        That means vague privacy language is weak. Users need clear,
                        readable, and honest explanations.
                      </p>
                    </div>
                  </div>
                </div>

                <PrivacySectionBlock
                  id="information-we-collect"
                  title="Information We Collect"
                  icon={Database}
                  paragraphs={[
                    "MediSync may collect personal information such as name, phone number, email address, profile details, account credentials, and healthcare-related data that users provide through the platform.",
                  ]}
                  bullets={[
                    "Account and identity information",
                    "Profile and contact details",
                    "Usage and technical data",
                    "Healthcare workflow-related information",
                  ]}
                />

                <PrivacySectionBlock
                  id="how-we-use-information"
                  title="How We Use Information"
                  icon={FileSearch}
                  paragraphs={[
                    "Collected information is used to operate the platform, support healthcare workflows, improve system performance, communicate with users, and maintain security and compliance.",
                  ]}
                  bullets={[
                    "To provide and manage services",
                    "To verify identity and secure accounts",
                    "To improve functionality and reliability",
                    "To respond to support requests",
                  ]}
                />

                <PrivacySectionBlock
                  id="data-protection"
                  title="Data Protection"
                  icon={ShieldCheck}
                  paragraphs={[
                    "MediSync applies reasonable technical and organizational safeguards to reduce unauthorized access, misuse, disclosure, or loss of user data.",
                  ]}
                />

                <PrivacySectionBlock
                  id="user-rights"
                  title="User Rights"
                  icon={UserCheck}
                  paragraphs={[
                    "Users may request access to their personal information, request corrections where appropriate, and contact support regarding privacy-related concerns.",
                  ]}
                />
              </div>
            </SectionCard>
          </RevealOnScroll>
        </div>

        <div className="space-y-6">
          <div className="lg:sticky lg:top-24">
            <div className="space-y-6">
              <RevealOnScroll delay={180}>
                <SectionAnchorNav items={quickNavItems} />
              </RevealOnScroll>

              <RevealOnScroll delay={240}>
                <SectionCard
                  title="Key Points"
                  description="The short version users actually care about."
                  icon={Info}
                >
                  <BulletList
                    items={[
                      "We collect only information needed to run the platform and support healthcare workflows.",
                      "We use safeguards to protect user information.",
                      "We do not treat privacy as optional.",
                      "Users can contact us regarding privacy questions or corrections.",
                    ]}
                  />
                </SectionCard>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
