import { useCallback, useEffect, useState } from "react";
import { Activity, AlertCircle, History, Sparkles } from "lucide-react";
import SymptomForm from "../components/SymptomCheckerForm";
import SymptomResultCard from "../components/SymptomResultCard";
import SymptomHistoryTable from "../components/SymptomHistoryList";
import {
  analyzeSymptoms,
  getSymptomHistory,
} from "../services/symptomCheckerService";
import { notifyError, notifySuccess } from "../../../utils/toast";

const HistorySkeleton = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="h-14 rounded-xl border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
};

const AnalysisSkeleton = () => {
  return (
    <div className="p-6 bg-white rounded-2xl border shadow-sm border-slate-200">
      <div className="space-y-4 animate-pulse">
        <div className="w-40 h-5 rounded bg-slate-200" />
        <div className="w-full h-4 rounded bg-slate-100" />
        <div className="w-5/6 h-4 rounded bg-slate-100" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-24 rounded-xl bg-slate-100" />
          <div className="h-24 rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
};

const EmptyHistoryState = () => {
  return (
    <div className="flex flex-col justify-center items-center px-6 py-12 text-center rounded-2xl border border-dashed transition-all duration-300 border-slate-300 bg-slate-50">
      <div className="flex justify-center items-center w-14 h-14 text-emerald-700 bg-emerald-100 rounded-2xl shadow-sm">
        <History className="w-7 h-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        No symptom history yet
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Your previous symptom checks will appear here after you complete your
        first analysis.
      </p>
    </div>
  );
};

const ErrorState = ({ message }) => {
  return (
    <div
      className="flex gap-3 items-start px-4 py-4 text-red-700 bg-red-50 rounded-2xl border border-red-200 shadow-sm"
      role="alert"
      aria-live="polite"
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Something went wrong</h3>
        <p className="text-sm text-red-600">{message}</p>
      </div>
    </div>
  );
};

const SymptomCheckerPage = () => {
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await getSymptomHistory();
      setHistory(res?.data || []);
    } catch (err) {
      console.error("History fetch failed:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const handleAnalyze = async (formData) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await analyzeSymptoms(formData);
      setResult(res.data);
      notifySuccess("Symptom analysis completed successfully.");
      await fetchHistory();
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Unable to analyze symptoms right now. Please try again.");
      notifyError(err, "Failed to analyze symptoms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="px-4 py-6 min-h-screen via-white bg-linear-to-br from-slate-50 to-emerald-50/40 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto space-y-6 max-w-6xl">
        {/* Header */}
        <section className="overflow-hidden rounded-3xl border shadow-sm backdrop-blur-sm border-slate-200 bg-white/90">
          <div className="relative px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl bg-emerald-100/40" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-3xl bg-sky-100/30" />

            <div className="flex relative flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex gap-2 items-center px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                  <Sparkles className="w-4 h-4" />
                  AI Health Assistant
                </div>

                <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  AI Symptom Checker
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Enter your symptoms and get a quick, structured health
                  assessment with guidance and previous check history in one
                  place.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
                <div className="flex justify-center items-center w-11 h-11 text-emerald-700 bg-emerald-100 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wide uppercase text-slate-500">
                    Feature
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    Smart symptom analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="p-5 bg-white rounded-3xl border shadow-sm transition-all duration-300 border-slate-200 hover:shadow-md sm:p-6 lg:p-7">
            <div className="flex gap-3 items-start mb-5">
              <div className="flex justify-center items-center w-11 h-11 text-emerald-700 bg-emerald-100 rounded-2xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                  Describe your symptoms
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Fill in the form clearly to receive a better assessment.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 sm:p-5">
              <SymptomForm onSubmit={handleAnalyze} loading={loading} />
            </div>
          </section>

          <section className="p-5 bg-white rounded-3xl border shadow-sm transition-all duration-300 border-slate-200 hover:shadow-md sm:p-6 lg:p-7">
            <div className="flex gap-3 justify-between items-start mb-5">
              <div className="flex gap-3 items-start">
                <div className="flex justify-center items-center w-11 h-11 text-sky-700 bg-sky-100 rounded-2xl">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                    Previous Checks
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review your recent symptom check records.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 text-xs font-medium rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                {history.length} records
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 sm:p-5">
              {historyLoading ? (
                <HistorySkeleton />
              ) : history.length === 0 ? (
                <EmptyHistoryState />
              ) : (
                <div className="overflow-hidden bg-white rounded-2xl border border-slate-200">
                  <SymptomHistoryTable history={history} />
                </div>
              )}
            </div>
          </section>

          {error && <ErrorState message={error} />}

          {loading ? (
            <AnalysisSkeleton />
          ) : (
            result && (
              <div className="transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                <SymptomResultCard result={result} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomCheckerPage;
