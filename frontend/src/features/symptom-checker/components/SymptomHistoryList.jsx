/* eslint-disable no-unused-vars */
import React, { memo } from "react";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
  Stethoscope,
} from "lucide-react";

const RISK_STYLES = {
  HIGH: {
    badge: "border-red-200 bg-red-50 text-red-700",
    icon: ShieldAlert,
    iconWrap: "bg-red-100 text-red-600",
    accent: "from-red-50 to-white border-red-100",
  },
  MEDIUM: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    icon: ShieldQuestion,
    iconWrap: "bg-amber-100 text-amber-600",
    accent: "from-amber-50 to-white border-amber-100",
  },
  LOW: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: ShieldCheck,
    iconWrap: "bg-emerald-100 text-emerald-600",
    accent: "from-emerald-50 to-white border-emerald-100",
  },
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return "Unknown date";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString();
};

const normalizeRiskLevel = (riskLevel) => {
  if (!riskLevel) return "LOW";
  const value = String(riskLevel).trim().toUpperCase();
  return RISK_STYLES[value] ? value : "LOW";
};

const SectionBlock = memo(function SectionBlock({
  icon: Icon,
  title,
  content,
  className = "",
}) {
  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-300 border-slate-200 bg-slate-50/80 hover:border-emerald-200 hover:bg-white ${className}`}
    >
      <div className="flex gap-2 items-center mb-2 text-sm font-semibold text-slate-800">
        <Icon className="w-4 h-4 text-emerald-600" />
        <span>{title}</span>
      </div>

      <p className="text-sm leading-6 text-slate-600">{content}</p>
    </div>
  );
});

const SymptomHistorySkeleton = memo(function SymptomHistorySkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden bg-white rounded-3xl border shadow-sm border-slate-200"
        >
          <div className="p-5 animate-pulse sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-1 gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                <div className="flex-1 space-y-3">
                  <div className="w-28 h-4 rounded bg-slate-200" />
                  <div className="w-40 h-3 rounded bg-slate-100" />
                  <div className="flex gap-2">
                    <div className="w-20 h-6 rounded-full bg-slate-100" />
                    <div className="w-24 h-6 rounded-full bg-slate-100" />
                  </div>
                </div>
              </div>

              <div className="w-32 h-10 rounded-2xl bg-slate-100" />
            </div>

            <div className="grid gap-3 mt-6">
              <div className="h-24 rounded-2xl bg-slate-100" />
              <div className="h-24 rounded-2xl bg-slate-100" />
              <div className="h-24 rounded-2xl bg-slate-100" />
              <div className="h-28 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

const EmptyState = memo(function EmptyState() {
  return (
    <div className="flex flex-col justify-center items-center px-6 py-14 text-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/80">
      <div className="flex justify-center items-center w-16 h-16 text-emerald-700 bg-emerald-100 rounded-2xl shadow-sm">
        <ClipboardList className="w-8 h-8" />
      </div>

      <h4 className="mt-5 text-lg font-semibold text-slate-900">
        No symptom history found
      </h4>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        No previous symptom assessments have been saved for this patient account yet.
      </p>
    </div>
  );
});

const ErrorState = memo(function ErrorState({ errorMessage }) {
  return (
    <div
      className="flex flex-col justify-center items-center px-6 py-14 text-center bg-red-50 rounded-3xl border border-red-200"
      role="alert"
      aria-live="polite"
    >
      <div className="flex justify-center items-center w-16 h-16 text-red-600 bg-red-100 rounded-2xl shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="mt-5 space-y-2">
        <h4 className="text-lg font-semibold text-red-900">Failed to load history</h4>
        <p className="max-w-md text-sm leading-6 text-red-700">
          {errorMessage || "Something went wrong while loading symptom history."}
        </p>
      </div>
    </div>
  );
});

const HistoryCard = memo(function HistoryCard({ item }) {
  const riskLevel = normalizeRiskLevel(item?.riskLevel);
  const riskConfig = RISK_STYLES[riskLevel];
  const RiskIcon = riskConfig.icon;

  const symptoms = Array.isArray(item?.symptoms) ? item.symptoms : [];
  const possibleConditions = Array.isArray(item?.possibleConditions)
    ? item.possibleConditions
    : [];

  return (
    <article
      className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl sm:p-6"
      aria-label={`Symptom history record with ${riskLevel.toLowerCase()} risk`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <header className="flex gap-4 items-start min-w-0">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${riskConfig.iconWrap}`}
          >
            <RiskIcon className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 items-center">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${riskConfig.badge}`}
              >
                {riskLevel} Risk
              </span>

              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                <Sparkles className="h-3.5 w-3.5" />
                Assessment
              </span>
            </div>

            <p className="flex gap-2 items-center mt-3 text-sm font-medium text-slate-500">
              <CalendarDays className="w-4 h-4" />
              {formatDateTime(item?.createdAt)}
            </p>
          </div>
        </header>

        <div className="inline-flex gap-2 items-center self-start px-3 py-2 text-xs font-medium rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
          <FileText className="w-4 h-4 text-emerald-600" />
          Record ID: {item?.recordId || "N/A"}
        </div>
      </div>

      <div className="grid gap-4 mt-6">
        <SectionBlock
          icon={Stethoscope}
          title="Symptoms"
          content={
            symptoms.length > 0 ? symptoms.join(", ") : "No symptoms recorded."
          }
        />

        <SectionBlock
          icon={Activity}
          title="Possible Conditions"
          content={
            possibleConditions.length > 0
              ? possibleConditions.join(", ")
              : "No possible conditions available."
          }
        />

        <SectionBlock
          icon={ChevronRight}
          title="Next Action"
          content={item?.nextAction || "No next action available."}
        />

        <SectionBlock
          icon={FileText}
          title="Summary"
          content={item?.summary || "No summary available."}
          className={`bg-linear-to-br ${riskConfig.accent}`}
        />
      </div>
    </article>
  );
});

const SymptomHistoryHeader = memo(function SymptomHistoryHeader({
  loading,
  error,
  total,
}) {
  return (
    <div className="flex flex-col gap-4 pb-5 mb-7 border-b border-slate-200 sm:flex-row sm:items-start sm:justify-between">
      <header>
        <div className="inline-flex gap-2 items-center px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700 uppercase bg-emerald-50 rounded-full border border-emerald-200">
          <ClipboardList className="h-3.5 w-3.5" />
          Patient Records
        </div>

        <h3
          id="symptom-history-title"
          className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          Symptom Check History
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Review previously saved symptom assessments, possible conditions, and
          recommended next actions for this patient account.
        </p>
      </header>

      {!loading && !error && total > 0 ? (
        <div className="inline-flex gap-2 items-center self-start px-4 py-2 text-sm font-medium rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
          <FileText className="w-4 h-4 text-emerald-600" />
          {total} {total === 1 ? "record" : "records"}
        </div>
      ) : null}
    </div>
  );
});

const SymptomHistoryList = memo(function SymptomHistoryList({
  history = [],
  loading = false,
  error = "",
}) {
  const hasHistory = Array.isArray(history) && history.length > 0;

  return (
    <section
      className="rounded-[28px] border border-slate-200 bg-linear-to-br from-white via-white to-slate-50 p-4 shadow-sm sm:p-6 lg:p-7"
      aria-labelledby="symptom-history-title"
    >
      <SymptomHistoryHeader
        loading={loading}
        error={error}
        total={history.length}
      />

      {loading ? (
        <SymptomHistorySkeleton />
      ) : error ? (
        <ErrorState errorMessage={error} />
      ) : !hasHistory ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 lg:gap-5">
          {history.map((item, index) => (
            <HistoryCard
              key={item?.recordId || `${item?.createdAt || "record"}-${index}`}
              item={item}
            />
          ))}
        </div>
      )}
    </section>
  );
});

export default SymptomHistoryList;
