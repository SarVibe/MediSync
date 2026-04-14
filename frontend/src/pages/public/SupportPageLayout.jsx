/* eslint-disable no-unused-vars */
import { memo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileText,
} from "lucide-react";
import RevealOnScroll from "../../components/common/RevealOnScroll";

const PageShell = memo(function PageShell({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}) {
  return (
    <div className="px-4 py-6 mx-auto w-full max-w-7xl sm:px-6 lg:px-8 lg:py-10">
      <div className="space-y-6">
        <RevealOnScroll direction="down">
          <section className="overflow-hidden relative bg-white rounded-3xl border shadow-sm border-slate-200">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.08),transparent_25%)]" />
            <div className="flex relative flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4 items-start">
                <div className="flex justify-center items-center w-14 h-14 rounded-2xl ring-1 shadow-sm shrink-0 bg-primary/10 text-primary ring-primary/10">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  {eyebrow ? (
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                      {eyebrow}
                    </span>
                  ) : null}

                  <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                    {title}
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </RevealOnScroll>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
});

export const SectionCard = memo(function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}) {
  return (
    <RevealOnScroll direction="up">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 sm:px-6">
          <div className="flex gap-3 items-start">
            {Icon ? (
              <div className="flex justify-center items-center w-11 h-11 rounded-2xl ring-1 shrink-0 bg-primary/10 text-primary ring-primary/10">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
            ) : null}

            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                {title}
              </h2>
              {description ? (
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">{children}</div>
      </section>
    </RevealOnScroll>
  );
});

export const InfoList = memo(function InfoList({ items = [] }) {
  if (!items.length) {
    return (
      <EmptyState
        title="No information available"
        description="There is no information to display in this section right now."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item, index) => {
        const Icon = item.icon;

        return (
          <RevealOnScroll key={item.label} direction="up" delay={index * 60}>
            <div className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm">
              <div className="flex gap-3 items-start">
                <div className="flex justify-center items-center w-10 h-10 bg-white rounded-xl ring-1 shadow-sm transition-transform duration-200 shrink-0 text-primary ring-slate-200 group-hover:scale-105">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-medium leading-6 text-slate-900">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        );
      })}
    </div>
  );
});

export const BulletList = memo(function BulletList({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <RevealOnScroll key={`${item}-${index}`} direction="up" delay={index * 40}>
          <div className="flex gap-3 items-start px-4 py-3 rounded-2xl border transition-all duration-200 border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white">
            <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
            <p className="text-sm leading-6 text-slate-700">{item}</p>
          </div>
        </RevealOnScroll>
      ))}
    </div>
  );
});

export const ContentSection = memo(function ContentSection({
  title,
  paragraphs = [],
  bullets = [],
}) {
  return (
    <RevealOnScroll direction="up">
      <div className="p-4 rounded-2xl border transition-all duration-200 border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50/70 sm:p-5">
        <div className="flex gap-2 items-center">
          <ChevronRight className="w-4 h-4 text-primary" aria-hidden="true" />
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        </div>

        <div className="mt-4 space-y-3">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-sm leading-7 text-slate-600">
              {paragraph}
            </p>
          ))}
        </div>

        {bullets.length > 0 ? (
          <div className="mt-4">
            <BulletList items={bullets} />
          </div>
        ) : null}
      </div>
    </RevealOnScroll>
  );
});

export const FormField = memo(function FormField({
  id,
  label,
  icon: Icon,
  error,
  children,
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
      >
        {label}
      </label>

      <div
        className={[
          "group relative overflow-hidden rounded-2xl border bg-white transition-all duration-200",
          error
            ? "border-red-300 ring-1 ring-red-100"
            : "border-slate-200 hover:border-slate-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10",
        ].join(" ")}
      >
        <div className="flex absolute inset-y-0 left-0 items-center pl-4 transition-colors duration-200 pointer-events-none text-slate-400 group-focus-within:text-primary">
          <Icon className="w-4 h-4" aria-hidden="true" />
        </div>
        {children}
      </div>

      {error ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
});

export const InlineAlert = memo(function InlineAlert({
  type = "info",
  message,
}) {
  if (!message) return null;

  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  const Icon = type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <RevealOnScroll direction="down">
      <div
        role="alert"
        className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm ${styles[type] || styles.info}`}
      >
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="leading-6">{message}</span>
      </div>
    </RevealOnScroll>
  );
});

export const PageSkeleton = memo(function PageSkeleton() {
  return (
    <div className="px-4 py-6 mx-auto w-full max-w-7xl animate-pulse sm:px-6 lg:px-8 lg:py-10">
      <div className="space-y-6">
        <div className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200">
          <div className="w-24 h-4 rounded bg-slate-200" />
          <div className="mt-4 w-72 max-w-full h-8 rounded bg-slate-200" />
          <div className="mt-3 max-w-full h-4 rounded bg-slate-100 sm:w-96" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200 lg:col-span-2">
            <div className="space-y-4">
              <div className="w-48 h-6 rounded bg-slate-200" />
              <div className="h-20 rounded-2xl bg-slate-100" />
              <div className="h-20 rounded-2xl bg-slate-100" />
              <div className="h-20 rounded-2xl bg-slate-100" />
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200">
            <div className="space-y-3">
              <div className="w-32 h-5 rounded bg-slate-200" />
              <div className="h-16 rounded-2xl bg-slate-100" />
              <div className="h-16 rounded-2xl bg-slate-100" />
              <div className="h-16 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const EmptyState = memo(function EmptyState({
  title = "No content available",
  description = "There is nothing to display right now.",
}) {
  return (
    <RevealOnScroll direction="up">
      <div className="px-6 py-12 text-center rounded-3xl border border-dashed shadow-sm border-slate-300 bg-slate-50/80">
        <div className="flex justify-center items-center mx-auto w-14 h-14 bg-white rounded-2xl ring-1 shadow-sm text-slate-500 ring-slate-200">
          <FileText className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </RevealOnScroll>
  );
});

export const ErrorState = memo(function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content right now. Please try again.",
}) {
  return (
    <RevealOnScroll direction="down">
      <div
        role="alert"
        className="px-6 py-12 text-center bg-red-50 rounded-3xl border border-red-200 shadow-sm"
      >
        <div className="flex justify-center items-center mx-auto w-14 h-14 text-red-500 bg-white rounded-2xl ring-1 ring-red-100 shadow-sm">
          <AlertCircle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-red-800">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-700">
          {description}
        </p>
      </div>
    </RevealOnScroll>
  );
});

export { RevealOnScroll };
export default PageShell;
