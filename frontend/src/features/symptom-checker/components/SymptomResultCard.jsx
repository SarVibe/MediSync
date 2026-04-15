/* eslint-disable no-unused-vars */
import React, { memo } from "react";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Info,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from "lucide-react";

const riskConfig = {
  LOW: {
    label: "Low Risk",
    icon: CheckCircle2,
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    card: "from-emerald-50/90 via-white to-white",
    iconWrap: "bg-emerald-100 text-emerald-700",
    accentText: "text-emerald-700",
  },
  MEDIUM: {
    label: "Medium Risk",
    icon: AlertCircle,
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    card: "from-amber-50/90 via-white to-white",
    iconWrap: "bg-amber-100 text-amber-700",
    accentText: "text-amber-700",
  },
  HIGH: {
    label: "High Risk",
    icon: ShieldAlert,
    badge: "border-red-200 bg-red-50 text-red-700",
    card: "from-red-50/90 via-white to-white",
    iconWrap: "bg-red-100 text-red-700",
    accentText: "text-red-700",
  },
  DEFAULT: {
    label: "Unknown Risk",
    icon: Info,
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    card: "from-slate-50 via-white to-white",
    iconWrap: "bg-slate-100 text-slate-700",
    accentText: "text-slate-700",
  },
};

const SectionCard = memo(function SectionCard({
  icon: Icon,
  title,
  children,
  className = "",
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${className}`}
    >
      <div className="flex gap-3 items-center mb-3">
        <div className="flex justify-center items-center w-10 h-10 text-emerald-700 bg-emerald-50 rounded-xl ring-1 ring-emerald-100">
          <Icon className="h-4.5 w-4.5" />
        </div>

        <h4 className="text-sm font-semibold tracking-wide text-slate-900 sm:text-base">
          {title}
        </h4>
      </div>

      {children}
    </section>
  );
});

const SymptomChip = memo(function SymptomChip({ symptom }) {
  return (
    <div
      tabIndex={0}
      role="note"
      aria-label={`Symptom: ${symptom}`}
      className="inline-flex cursor-default items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
    >
      {symptom}
    </div>
  );
});

const ConditionItem = memo(function ConditionItem({ condition }) {
  return (
    <li className="flex gap-2 items-start text-sm leading-6 text-slate-600">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
      <span>{condition}</span>
    </li>
  );
});

const ResourceLink = memo(function ResourceLink({ item, index }) {
  return (
    <a
      key={index}
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group block cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      aria-label={`Open trusted resource: ${item.title}`}
    >
      <div className="flex gap-3 justify-between items-start">
        <p className="font-semibold text-emerald-700 transition-colors duration-200 group-hover:text-emerald-800">
          {item.title}
        </p>
        <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-colors duration-200 group-hover:text-emerald-600" />
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-500">{item.snippet}</p>

      <p className="mt-3 text-xs break-all text-slate-400">{item.url}</p>
    </a>
  );
});

export const SymptomResultCardSkeleton = memo(function SymptomResultCardSkeleton() {
  return (
    <div
      className="overflow-hidden bg-white rounded-3xl border shadow-sm border-slate-200"
      aria-label="Loading symptom analysis"
      aria-busy="true"
    >
      <div className="animate-pulse">
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="w-44 h-5 rounded-md bg-slate-200" />
              <div className="w-72 max-w-full h-4 rounded-md bg-slate-200" />
            </div>
            <div className="w-32 h-10 rounded-full bg-slate-200" />
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2 lg:gap-5 lg:p-7">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className={`rounded-2xl border border-slate-100 p-4 sm:p-5 ${
                index === 0 || index === 3 || index === 5 ? "lg:col-span-2" : ""
              }`}
            >
              <div className="mb-4 w-36 h-4 rounded bg-slate-200" />
              <div className="space-y-2.5">
                <div className="h-3.5 w-full rounded bg-slate-200" />
                <div className="h-3.5 w-5/6 rounded bg-slate-200" />
                <div className="h-3.5 w-2/3 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export const SymptomResultCardEmpty = memo(function SymptomResultCardEmpty() {
  return (
    <div className="p-8 text-center bg-white rounded-3xl border border-dashed shadow-sm border-slate-300 sm:p-10">
      <div className="flex justify-center items-center mx-auto w-16 h-16 text-emerald-700 bg-emerald-50 rounded-2xl ring-1 ring-emerald-100">
        <Stethoscope className="w-8 h-8" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900 sm:text-xl">
        No analysis available yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
        Enter symptoms, severity, and duration to generate a smart assessment and
        view the result here.
      </p>
    </div>
  );
});

export const SymptomResultCardError = memo(function SymptomResultCardError({
  message = "Something went wrong while loading the symptom analysis.",
}) {
  return (
    <div
      role="alert"
      className="p-6 bg-red-50 rounded-3xl border border-red-200 shadow-sm sm:p-8"
    >
      <div className="flex gap-3 items-start">
        <div className="flex justify-center items-center w-11 h-11 text-red-700 bg-red-100 rounded-2xl shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>

        <div>
          <h3 className="text-base font-bold text-red-800 sm:text-lg">
            Unable to show analysis
          </h3>
          <p className="mt-1 text-sm leading-6 text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );
});

const SymptomResultCard = memo(function SymptomResultCard({
  result,
  isLoading = false,
  error = null,
}) {
  if (isLoading) return <SymptomResultCardSkeleton />;

  if (error) {
    return (
      <SymptomResultCardError
        message={typeof error === "string" ? error : error?.message}
      />
    );
  }

  if (!result) return <SymptomResultCardEmpty />;

  const config = riskConfig[result.riskLevel] || riskConfig.DEFAULT;
  const RiskIcon = config.icon;

  return (
    <article
      className={`group overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br ${config.card} shadow-sm transition-shadow duration-300 hover:shadow-xl`}
      aria-labelledby="analysis-result-title"
    >
      <div className="p-5 border-b backdrop-blur-sm border-slate-100 bg-white/75 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3 items-start min-w-0">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${config.iconWrap} shadow-sm transition-transform duration-200 group-hover:scale-105`}
            >
              <Sparkles className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <h3
                id="analysis-result-title"
                className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
              >
                Analysis Result
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Review the system assessment based on the provided symptoms.
              </p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 self-start rounded-full border px-3.5 py-2 text-xs font-bold uppercase tracking-wide ${config.badge}`}
            aria-label={`Risk level: ${config.label}`}
          >
            <RiskIcon className="w-4 h-4" />
            {config.label}
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2 lg:gap-5 lg:p-7">
        <SectionCard icon={Activity} title="Symptoms" className="lg:col-span-2">
          {result.symptoms?.length ? (
            <div className="flex flex-wrap gap-2">
              {result.symptoms.map((symptom, index) => (
                <SymptomChip key={`${symptom}-${index}`} symptom={symptom} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No symptoms provided.</p>
          )}
        </SectionCard>

        <SectionCard icon={ClipboardList} title="Severity">
          <p className="text-sm font-medium capitalize text-slate-700 sm:text-base">
            {result.severity || "Not specified"}
          </p>
        </SectionCard>

        <SectionCard icon={CalendarDays} title="Duration">
          <p className="text-sm font-medium text-slate-700 sm:text-base">
            {result.durationDays ?? 0} day(s)
          </p>
        </SectionCard>

        <SectionCard
          icon={Stethoscope}
          title="Possible Conditions"
          className="lg:col-span-2"
        >
          {result.possibleConditions?.length ? (
            <ul className="space-y-2">
              {result.possibleConditions.map((condition, index) => (
                <ConditionItem key={`${condition}-${index}`} condition={condition} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">
              No possible conditions available.
            </p>
          )}
        </SectionCard>

        <SectionCard icon={CheckCircle2} title="What to do next">
          <p className={`text-sm font-semibold leading-6 sm:text-base ${config.accentText}`}>
            {result.nextAction || "No recommendation available."}
          </p>
        </SectionCard>

        <SectionCard icon={Info} title="Summary">
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            {result.summary || "No summary available."}
          </p>
        </SectionCard>

        {result?.trustedResources?.length > 0 && (
          <SectionCard
            icon={Info}
            title="Trusted Health Resources"
            className="lg:col-span-2"
          >
            <div className="space-y-3">
              {result.trustedResources.map((item, index) => (
                <ResourceLink key={`${item.url}-${index}`} item={item} index={index} />
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </article>
  );
});

export default SymptomResultCard;
