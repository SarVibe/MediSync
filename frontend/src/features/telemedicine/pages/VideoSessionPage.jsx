import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const VideoSessionPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [timer, setTimer] = useState(0);
  const [status, setStatus] = useState("Connected"); // or "Connecting", "Reconnecting"

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-2xl">
            <span className="text-xl">📹</span>
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight">Consultation Session</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              {status} • Ref: {appointmentId}
            </p>
          </div>
        </div>
        <div className="px-6 py-2 bg-slate-800 rounded-full font-black text-sm tracking-widest text-blue-400">
          {formatTime(timer)}
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        {/* Remote Video (Main) */}
        <div className="lg:col-span-3 relative rounded-[2.5rem] bg-slate-800 overflow-hidden shadow-2xl border border-slate-700/50 group">
          <img 
            src="https://images.unsplash.com/photo-1559839734-2b71f1e3c770?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-full object-cover opacity-80"
            alt="Doctor"
          />
          <div className="absolute top-8 left-8 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
            <p className="text-xs font-black uppercase tracking-widest">Dr. Arjun Sharma</p>
          </div>
          
          {/* Local Video Overlay */}
          <div className="absolute top-8 right-8 w-48 h-32 rounded-3xl bg-slate-900 border-2 border-white/20 overflow-hidden shadow-2xl">
            {!isVideoOff ? (
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="Me" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs uppercase">Video Off</div>
            )}
          </div>
        </div>

        {/* Info & Side Panel */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Patient Info</h3>
            <div className="flex items-center gap-4 mb-6">
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100" className="w-12 h-12 rounded-xl object-cover" alt="Patient" />
              <div>
                <p className="font-bold text-sm">Rahul Verma</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Age: 32 · Male</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/30">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Reason</p>
                <p className="text-xs font-medium text-slate-300">Persistent chest pain and shortness of breath.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 flex-1">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Session Notes</h3>
             <textarea 
               placeholder="Add clinical notes..."
               className="w-full bg-slate-900/50 border border-slate-700/30 rounded-2xl p-4 text-xs font-medium text-slate-300 outline-none focus:ring-1 focus:ring-blue-500 resize-none h-40"
             />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-slate-800/30 backdrop-blur-xl border border-white/5 rounded-[2rem] flex items-center justify-center gap-6">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all shadow-xl ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
        >
          {isMuted ? '🔇' : '🎙️'}
        </button>
        <button 
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all shadow-xl ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
        >
          {isVideoOff ? '📵' : '📹'}
        </button>
        <div className="w-px h-10 bg-slate-700/50 mx-4" />
        <button 
          onClick={() => {
            if (window.confirm("End consultation?")) navigate(-1);
          }}
          className="px-10 h-14 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-900/20 hover:bg-red-700 active:scale-95 transition-all"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoSessionPage;
