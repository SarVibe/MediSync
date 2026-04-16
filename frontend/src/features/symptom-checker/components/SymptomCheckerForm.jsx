/* eslint-disable no-unused-vars */
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  Loader2,
  Plus,
  Stethoscope,
  Thermometer,
  TimerReset,
  X,
} from "lucide-react";
import { notifySuccess } from "../../../utils/toast";
import {
  EMPTY_SYMPTOM_CHECKER_ERRORS,
  normalizeSymptomValue,
  validateCustomSymptom,
  validateDurationDays,
  validateSeverity,
  validateSymptoms,
  validateSymptomCheckerForm,
} from "../validation";

const COMMON_SYMPTOMS = [
  "fever",
  "cough",
  "headache",
  "sore throat",
  "nausea",
  "vomiting",
  "stomach pain",
  "chest pain",
  "shortness of breath",
  "dizziness",
];

const SEVERITY_OPTIONS = [
  {
    value: "mild",
    label: "Mild",
    selectClass:
      "border-emerald-200 bg-emerald-50 text-emerald-800 focus:border-emerald-600 focus:ring-emerald-100",
    optionStyle: {
      backgroundColor: "#ecfdf5",
      color: "#166534",
    },
  },
  {
    value: "moderate",
    label: "Moderate",
    selectClass:
      "border-amber-200 bg-amber-50 text-amber-800 focus:border-amber-500 focus:ring-amber-100",
    optionStyle: {
      backgroundColor: "#fffbeb",
      color: "#92400e",
    },
  },
  {
    value: "severe",
    label: "Severe",
    selectClass:
      "border-red-200 bg-red-50 text-red-800 focus:border-red-500 focus:ring-red-100",
    optionStyle: {
      backgroundColor: "#fef2f2",
      color: "#991b1b",
    },
  },
];

const CARD_CLASS =
  "rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(2,6,23,0.06)]";

const SymptomChip = memo(function SymptomChip({
  symptom,
  active,
  onToggle,
  removable = false,
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(symptom)}
      aria-pressed={active}
      className={[
        "group inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium capitalize",
        "cursor-pointer transition-all duration-200 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
        active
          ? "border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
          : "border-slate-300 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700",
      ].join(" ")}
    >
      {active ? (
        <CheckCircle2 className="w-4 h-4 shrink-0" />
      ) : (
        <Activity className="w-4 h-4 opacity-80 shrink-0" />
      )}

      <span>{symptom}</span>

      {removable && active && <X className="w-4 h-4 opacity-90 shrink-0" />}
    </button>
  );
});

const SectionTitle = memo(function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex justify-center items-center w-11 h-11 text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-100 shrink-0">
        <Icon className="w-5 h-5" />
      </div>

      <header>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>
        ) : null}
      </header>
    </div>
  );
});

const StatCard = memo(function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex gap-2 items-center text-slate-500">
        <Icon className="w-4 h-4" />
        <span className="text-[11px] font-medium uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
});

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-10 rounded-3xl border border-white/40 bg-white/70 backdrop-blur-[2px]">
      <div className="flex flex-col justify-center items-center px-6 h-full">
        <div className="flex gap-2 items-center px-4 py-3 rounded-2xl border shadow-sm border-slate-200 bg-white/90">
          <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
          <span className="text-sm font-medium text-slate-700">
            Analyzing symptoms...
          </span>
        </div>

        <div className="grid gap-3 mt-6 w-full max-w-md">
          <div className="h-4 rounded-full animate-pulse bg-slate-200" />
          <div className="w-5/6 h-4 rounded-full animate-pulse bg-slate-200" />
          <div className="w-4/6 h-4 rounded-full animate-pulse bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

const EmptySelectedState = memo(function EmptySelectedState() {
  return (
    <div className="flex gap-3 items-start p-4 bg-white rounded-2xl border border-dashed border-slate-300">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-700">No symptoms selected</p>
        <p className="text-sm text-slate-500">Pick at least one symptom to continue.</p>
      </div>
    </div>
  );
});

export default function SymptomCheckerForm({ onSubmit, loading = false }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [severity, setSeverity] = useState("mild");
  const [durationDays, setDurationDays] = useState("1");
  const [fieldErrors, setFieldErrors] = useState(EMPTY_SYMPTOM_CHECKER_ERRORS);

  const selectedSet = useMemo(() => new Set(selectedSymptoms), [selectedSymptoms]);
  const selectedSeverityConfig = useMemo(
    () =>
      SEVERITY_OPTIONS.find((option) => option.value === severity) ??
      SEVERITY_OPTIONS[0],
    [severity]
  );

  const selectedCountText = useMemo(() => {
    if (selectedSymptoms.length === 0) return "No symptoms selected yet.";
    if (selectedSymptoms.length === 1) return "1 symptom selected.";
    return `${selectedSymptoms.length} symptoms selected.`;
  }, [selectedSymptoms.length]);

  const severityDisplayValue = useMemo(() => {
    if (!severity) return "";
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  }, [severity]);

  const formValidation = useMemo(
    () =>
      validateSymptomCheckerForm({
        symptoms: selectedSymptoms,
        customSymptom,
        severity,
        durationDays,
      }),
    [customSymptom, durationDays, selectedSymptoms, severity]
  );

  const toggleSymptom = useCallback(
    (symptom) => {
      setSelectedSymptoms((prev) => {
        const nextSymptoms = prev.includes(symptom)
          ? prev.filter((item) => item !== symptom)
          : [...prev, symptom];

        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          symptoms: validateSymptoms(nextSymptoms),
          customSymptom: validateCustomSymptom(customSymptom, {
            selectedSymptoms: nextSymptoms,
          }),
        }));

        return nextSymptoms;
      });
    },
    [customSymptom]
  );

  const addCustomSymptom = useCallback(() => {
    const customSymptomError = validateCustomSymptom(customSymptom, {
      selectedSymptoms,
      required: true,
    });

    if (customSymptomError) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        customSymptom: customSymptomError,
      }));
      return;
    }

    const normalizedSymptom = normalizeSymptomValue(customSymptom);
    const nextSymptoms = [...selectedSymptoms, normalizedSymptom];

    setSelectedSymptoms(nextSymptoms);
    setCustomSymptom("");
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      symptoms: validateSymptoms(nextSymptoms),
      customSymptom: "",
    }));
    notifySuccess("Custom symptom added.");
  }, [customSymptom, selectedSymptoms]);

  const handleCustomKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addCustomSymptom();
      }
    },
    [addCustomSymptom]
  );

  const handleDurationChange = useCallback((e) => {
    const nextValue = e.target.value;
    setDurationDays(nextValue);
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      durationDays: validateDurationDays(nextValue),
    }));
  }, []);

  const handleCustomChange = useCallback(
    (e) => {
      const nextValue = e.target.value;
      setCustomSymptom(nextValue);
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        customSymptom: validateCustomSymptom(nextValue, {
          selectedSymptoms,
        }),
      }));
    },
    [selectedSymptoms]
  );

  const handleSeverityChange = useCallback((e) => {
    const nextValue = e.target.value;
    setSeverity(nextValue);
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      severity: validateSeverity(nextValue),
    }));
  }, []);

  const resetForm = useCallback(() => {
    setSelectedSymptoms([]);
    setCustomSymptom("");
    setSeverity("mild");
    setDurationDays("1");
    setFieldErrors(EMPTY_SYMPTOM_CHECKER_ERRORS);
    notifySuccess("Form reset successfully.");
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const validationResult = validateSymptomCheckerForm({
        symptoms: selectedSymptoms,
        customSymptom,
        severity,
        durationDays,
      });

      setFieldErrors(validationResult.errors);

      if (!validationResult.isValid) {
        return;
      }

      await onSubmit({
        symptoms: selectedSymptoms,
        severity,
        durationDays: Number(durationDays),
      });
    },
    [customSymptom, durationDays, onSubmit, selectedSymptoms, severity]
  );

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className={CARD_CLASS}>
        <div className="from-emerald-50 via-white border-b bg-linear-to-br border-slate-200 to-slate-50">
          <div className="px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/90 px-3 py-1.5 text-emerald-700 shadow-sm">
                  <Stethoscope className="w-4 h-4" />
                  <span className="text-xs font-semibold tracking-wide uppercase">
                    Health Assistant
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  AI Symptom Checker
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Enter symptoms, severity, and duration to get a basic health risk
                  assessment. This is not a diagnosis. Serious symptoms still need a
                  real doctor, not guesswork.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[340px]">
                <StatCard
                  icon={Activity}
                  label="Symptoms"
                  value={selectedSymptoms.length}
                />
                <StatCard
                  icon={Thermometer}
                  label="Severity"
                  value={severityDisplayValue}
                />
                <StatCard
                  icon={TimerReset}
                  label="Duration"
                  value={`${durationDays} day${Number(durationDays) > 1 ? "s" : ""}`}
                />
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="relative px-5 py-6 sm:px-8 sm:py-8 lg:px-10"
        >
          {loading ? <LoadingOverlay /> : null}

          <div className="grid gap-8 xl:grid-cols-[1.45fr_0.9fr]">
            <section className="space-y-6">
              <SectionTitle
                icon={HeartPulse}
                title="Symptoms"
                subtitle="Choose common symptoms or add custom ones."
              />

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 sm:p-5">
                <div className="flex flex-wrap gap-2.5">
                  {COMMON_SYMPTOMS.map((symptom) => (
                    <SymptomChip
                      key={symptom}
                      symptom={symptom}
                      active={selectedSet.has(symptom)}
                      onToggle={toggleSymptom}
                    />
                  ))}
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="customSymptom"
                    className="block mb-2 text-sm font-semibold text-slate-800"
                  >
                    Add custom symptom
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <input
                        id="customSymptom"
                        type="text"
                        value={customSymptom}
                        onChange={handleCustomChange}
                        onKeyDown={handleCustomKeyDown}
                        aria-invalid={fieldErrors.customSymptom ? "true" : "false"}
                        aria-describedby={
                          fieldErrors.customSymptom ? "customSymptom-error" : undefined
                        }
                        placeholder="Example: body ache"
                        className={`px-4 py-3 pr-11 w-full bg-white rounded-2xl border text-slate-900 placeholder:text-slate-400 transition-all duration-200 outline-none focus:ring-4 ${
                          fieldErrors.customSymptom
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-100"
                        }`}
                      />
                      <Plus className="absolute right-4 top-1/2 w-4 h-4 -translate-y-1/2 pointer-events-none text-slate-400" />
                    </div>

                    <button
                      type="button"
                      onClick={addCustomSymptom}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Symptom
                    </button>
                  </div>

                  {fieldErrors.customSymptom ? (
                    <p id="customSymptom-error" className="mt-2 text-sm text-red-600">
                      {fieldErrors.customSymptom}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6">
                  <div className="flex gap-3 justify-between items-center mb-3">
                    <p className="text-sm font-semibold text-slate-800">
                      Selected symptoms
                    </p>
                    <span className="text-xs font-medium text-slate-500">
                      {selectedCountText}
                    </span>
                  </div>

                  {selectedSymptoms.length === 0 ? (
                    <EmptySelectedState />
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {selectedSymptoms.map((symptom) => (
                        <SymptomChip
                          key={symptom}
                          symptom={symptom}
                          active
                          removable
                          onToggle={toggleSymptom}
                        />
                      ))}
                    </div>
                  )}

                  {fieldErrors.symptoms ? (
                    <p className="mt-3 text-sm text-red-600">{fieldErrors.symptoms}</p>
                  ) : null}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <SectionTitle
                icon={Thermometer}
                title="Details"
                subtitle="Provide severity and duration for better assessment."
              />

              <div className="p-5 space-y-5 rounded-2xl border border-slate-200 bg-slate-50/70">
                <div>
                  <label
                    htmlFor="severity"
                    className="block mb-2 text-sm font-semibold text-slate-800"
                  >
                    Severity
                  </label>

                  <select
                    id="severity"
                    value={severity}
                    onChange={handleSeverityChange}
                    aria-invalid={fieldErrors.severity ? "true" : "false"}
                    aria-describedby={
                      fieldErrors.severity ? "severity-error" : undefined
                    }
                    className={[
                      "w-full cursor-pointer rounded-2xl border px-4 py-3 outline-none transition-all duration-200 focus:ring-4",
                      fieldErrors.severity
                        ? "border-red-300 bg-red-50 text-red-800 focus:border-red-500 focus:ring-red-100"
                        : selectedSeverityConfig.selectClass,
                    ].join(" ")}
                  >
                    {SEVERITY_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        style={option.optionStyle}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.severity ? (
                    <p id="severity-error" className="mt-2 text-sm text-red-600">
                      {fieldErrors.severity}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="durationDays"
                    className="block mb-2 text-sm font-semibold text-slate-800"
                  >
                    Duration (days)
                  </label>

                  <input
                    id="durationDays"
                    type="number"
                    min="1"
                    max="365"
                    inputMode="numeric"
                    value={durationDays}
                    onChange={handleDurationChange}
                    aria-invalid={fieldErrors.durationDays ? "true" : "false"}
                    aria-describedby={
                      fieldErrors.durationDays
                        ? "durationDays-error durationDays-help"
                        : "durationDays-help"
                    }
                    className={`px-4 py-3 w-full bg-white rounded-2xl border text-slate-900 transition-all duration-200 outline-none focus:ring-4 ${
                      fieldErrors.durationDays
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-100"
                    }`}
                  />

                  <p id="durationDays-help" className="mt-2 text-xs text-slate-500">
                    Enter a number between 1 and 365.
                  </p>

                  {fieldErrors.durationDays ? (
                    <p id="durationDays-error" className="mt-2 text-sm text-red-600">
                      {fieldErrors.durationDays}
                    </p>
                  ) : null}
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <div className="flex gap-3 items-start">
                    <div className="flex justify-center items-center w-10 h-10 text-amber-700 bg-amber-100 rounded-xl shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-amber-900">
                        Important
                      </p>
                      <p className="text-sm leading-6 text-amber-800">
                        Chest pain, trouble breathing, fainting, or rapidly
                        worsening symptoms are not things to monitor casually.
                        Get urgent medical help.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading || !formValidation.isValid}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Stethoscope className="w-4 h-4" />
                        Analyze Symptoms
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <TimerReset className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}
