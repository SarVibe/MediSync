/* eslint-disable no-unused-vars */
import { memo } from "react";
import {
  AlertCircle,
  FileText,
  ShieldCheck,
  Scale,
  Ban,
  CircleAlert,
  CheckCircle2,
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

const TermHighlightCard = memo(function TermHighlightCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
      <div className="flex gap-3 items-start">
        <div className="flex justify-center items-center w-11 h-11 rounded-2xl shadow-sm transition-transform duration-300 shrink-0 bg-primary/10 text-primary group-hover:scale-105">
          <Icon className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
});

const StickySummaryCard = memo(function StickySummaryCard() {
  return (
    <div className="space-y-6 lg:sticky lg:top-24">
      <SectionCard
        title="Important Notes"
        description="The practical summary users should understand before using the platform."
        icon={AlertCircle}
      >
        <BulletList
          items={[
            "Use the platform responsibly and lawfully.",
            "Do not share account credentials carelessly.",
            "Do not misuse the service or attempt unauthorized access.",
            "Platform access may be restricted for policy or security violations.",
          ]}
        />
      </SectionCard>

      <SectionCard
        title="Quick Summary"
        description="The core legal expectations in plain language."
        icon={CheckCircle2}
      >
        <div className="space-y-3">
          <div className="p-4 rounded-2xl border transition-all duration-300 border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Access
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              Access to MediSync depends on lawful and proper use of the platform.
            </p>
          </div>

          <div className="p-4 rounded-2xl border transition-all duration-300 border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Responsibility
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              Users are responsible for accurate information and secure handling of
              their own account credentials.
            </p>
          </div>

          <div className="p-4 rounded-2xl border transition-all duration-300 border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Limits
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              The platform supports digital healthcare workflows but does not
              replace emergency or urgent in-person medical care.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
});

export default function TermsOfServicePage({
  isLoading = false,
  hasError = false,
  isEmpty = false,
}) {
  if (isLoading) {
    return <PageSkeleton />;
  }

  if (hasError) {
    return (
      <PageShell
        eyebrow="Legal"
        title="Terms of Service"
        description="The rules and responsibilities that apply when using MediSync."
        icon={FileText}
      >
        <InlineAlert
          type="error"
          message="Failed to load the terms of service content."
        />
      </PageShell>
    );
  }

  if (isEmpty) {
    return (
      <PageShell
        eyebrow="Legal"
        title="Terms of Service"
        description="The rules and responsibilities that apply when using MediSync."
        icon={FileText}
      >
        <EmptyState
          title="Terms unavailable"
          description="No terms of service content is available right now."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Legal"
      title="Terms of Service"
      description="These Terms of Service define the conditions for using MediSync and outline the responsibilities of platform users."
      icon={FileText}
    >
      <div className="space-y-6">
        {/* Top highlights */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: Scale,
              title: "Fair Platform Use",
              description: "Use MediSync in a lawful, respectful, and responsible way.",
            },
            {
              icon: ShieldCheck,
              title: "Account Security",
              description: "Protect credentials and keep account information accurate.",
            },
            {
              icon: CircleAlert,
              title: "Medical Limitations",
              description: "MediSync supports care workflows but is not emergency care.",
            },
            {
              icon: Ban,
              title: "Policy Enforcement",
              description: "Misuse can result in restricted, suspended, or terminated access.",
            },
          ].map((item, index) => (
            <RevealOnScroll key={item.title} delay={index * 70}>
              <TermHighlightCard
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            </RevealOnScroll>
          ))}
        </section>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <RevealOnScroll delay={120}>
              <SectionCard
                title="Terms Overview"
                description="Core conditions that govern platform usage."
                icon={ShieldCheck}
              >
                <div className="space-y-4">
                  <RevealOnScroll>
                  <ContentSection
                    title="Acceptance of terms"
                    paragraphs={[
                      "By accessing or using MediSync, users agree to comply with these Terms of Service and any applicable policies or legal requirements.",
                    ]}
                  />
                  </RevealOnScroll>

                  <RevealOnScroll delay={100}>
                  <ContentSection
                    title="Use of the platform"
                    paragraphs={[
                      "Users must use the platform lawfully, responsibly, and in a way that does not disrupt services, compromise security, or harm other users.",
                    ]}
                    bullets={[
                      "Provide accurate account information",
                      "Maintain the confidentiality of credentials",
                      "Avoid misuse, abuse, or unauthorized access",
                    ]}
                  />
                  </RevealOnScroll>

                  <RevealOnScroll delay={200}>
                  <ContentSection
                    title="Healthcare information and limitations"
                    paragraphs={[
                      "MediSync supports healthcare communication and digital workflows. It should not be interpreted as a replacement for emergency medical services or immediate in-person treatment where necessary.",
                    ]}
                  />
                  </RevealOnScroll>

                  <RevealOnScroll delay={300}>
                  <ContentSection
                    title="Account suspension or termination"
                    paragraphs={[
                      "MediSync may suspend, restrict, or terminate access where users violate policies, misuse the platform, or create security or operational risks.",
                    ]}
                  />
                  </RevealOnScroll>
                </div>
              </SectionCard>
            </RevealOnScroll>

            <RevealOnScroll delay={180}>
              <SectionCard
                title="User Responsibilities"
                description="What users are expected to do when using MediSync."
                icon={Scale}
              >
                <div className="space-y-4">
                  <p className="text-sm leading-7 text-slate-600">
                    Users are expected to act honestly, maintain the security of
                    their accounts, and avoid behavior that creates risk for the
                    platform or other users. That includes keeping personal details
                    accurate, respecting platform rules, and avoiding intentional misuse.
                  </p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="p-4 rounded-2xl border transition-all duration-300 border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">
                        Accurate Information
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Users must provide truthful and current information where required.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border transition-all duration-300 border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">
                        Secure Access
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Users must protect account credentials and prevent unauthorized use.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border transition-all duration-300 border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">
                        Respectful Use
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        The platform must not be used in ways that harm operations or other users.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border transition-all duration-300 border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">
                        Policy Compliance
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Continued use depends on compliance with platform rules and legal standards.
                      </p>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={240}>
            <StickySummaryCard />
          </RevealOnScroll>
        </div>
      </div>
    </PageShell>
  );
}
