import React from 'react';

const RecordCard = ({ record, onPreview, onDelete }) => {
  const { type, description, date, fileName } = record;

  const getIcon = (type) => {
    const t = type?.toLowerCase();
    if (t?.includes('lab')) return '🧪';
    if (t?.includes('scan') || t?.includes('xray')) return '🩻';
    if (t?.includes('report')) return '📄';
    return '📁';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-xl shadow-inner">
            {getIcon(type)}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">{type}</h4>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{date}</p>
          </div>
        </div>
        {onDelete && (
          <button 
            onClick={() => onDelete(record)}
            className="text-slate-300 hover:text-red-500 transition-colors p-1"
            title="Delete record"
          >
            🗑️
          </button>
        )}
      </div>

      <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed h-10">
        {description || 'No description provided.'}
      </p>

      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-50">
        <span className="text-[10px] text-slate-400 font-bold truncate max-w-[120px]">
          📎 {fileName || 'record_file.pdf'}
        </span>
        <button 
          onClick={() => onPreview(record)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
        >
          View File
        </button>
      </div>
    </div>
  );
};

export default RecordCard;
