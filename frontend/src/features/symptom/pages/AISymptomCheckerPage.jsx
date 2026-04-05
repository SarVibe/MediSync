import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkSymptoms } from "../services/symptomService";

const AISymptomCheckerPage = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const data = await checkSymptoms(symptoms);
      setResult(data);
    } catch (err) {
      alert("AI Service is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 to-blue-400" />
        
        <div className="p-8 md:p-12">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🤖</div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">AI Symptom Checker</h1>
            <p className="text-slate-500 font-medium mt-2">Describe how you're feeling, and our AI will provide guidance.</p>
          </div>

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">Describe your symptoms</label>
                <textarea 
                  rows="6"
                  placeholder="e.g., I have a mild headache and a sore throat since yesterday morning..."
                  className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700 resize-none leading-relaxed"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  required
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                <span className="text-amber-500 font-bold">⚠️</span>
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                  <strong>Important:</strong> This is an AI-powered guidance tool and does not replace professional medical advice. If you are experiencing an emergency, please contact local emergency services immediately.
                </p>
              </div>

              <button 
                type="submit" disabled={loading || !symptoms.trim()}
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black tracking-[0.2em] uppercase text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Analyzing Symptoms...' : 'Run AI Analysis'}
              </button>
            </form>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6 mb-10">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Possible Conditions</h3>
                  <div className="space-y-4">
                    {result.possibleConditions.map((cond, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm">
                        <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${cond.probability === 'High' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                          {cond.probability} Match
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm mb-1">{cond.name}</p>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{cond.advice}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                  <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">AI Recommendation</h3>
                  <p className="text-sm font-bold text-blue-900 leading-relaxed">{result.recommendation}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setResult(null)}
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Start Over
                </button>
                <button 
                  onClick={() => navigate("/patient/doctors")}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Book Consultation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISymptomCheckerPage;
