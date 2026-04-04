import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_NOTIFS = [
  { id: 1, type: 'APPOINTMENT', message: 'Your appointment with Dr. Arjun is confirmed for tomorrow.', time: '2 mins ago', read: false },
  { id: 2, type: 'PRESCRIPTION', message: 'Dr. Priya issued a new prescription for your recent visit.', time: '1 hour ago', read: false },
  { id: 3, type: 'RECORD', message: 'Your Lab Report (Blood Test) is now available for download.', time: '5 hours ago', read: true },
];

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markRead = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => setNotifs([]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-800 text-sm tracking-tight">Notifications</h3>
            {notifs.length > 0 && (
              <button onClick={clearAll} className="text-[10px] font-black text-blue-600 uppercase hover:text-blue-800">Clear All</button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {notifs.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-4xl mb-2">🎈</p>
                <p className="text-sm font-bold text-slate-400">All caught up!</p>
              </div>
            ) : (
              notifs.map(n => (
                <div 
                  key={n.id} 
                  className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!n.read ? 'bg-blue-50/30' : ''}`}
                  onClick={() => markRead(n.id)}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                  <div className="flex-1">
                    <p className={`text-xs leading-relaxed ${!n.read ? 'text-slate-800 font-bold' : 'text-slate-500 font-medium'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{n.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-5 py-3 border-t border-slate-50 text-center">
            <button className="text-xs font-black text-slate-400 hover:text-slate-600 transition-colors">View All Notifications</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
