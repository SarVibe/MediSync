import { memo } from "react";

export const SectionEyebrow = memo(function SectionEyebrow({ children }) {
  return (
    <p className="inline-flex gap-2 items-center mb-3 text-xs font-bold tracking-widest text-emerald-600 uppercase">
      <span className="w-6 h-px bg-emerald-400 rounded-full" />
      {children}
      <span className="w-6 h-px bg-emerald-400 rounded-full" />
    </p>
  );
});

const SectionTitle = memo(function SectionTitle({
  eyebrow,
  title,
  description,
  centered = false,
}) {
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-slate-500 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
});

export default SectionTitle;
