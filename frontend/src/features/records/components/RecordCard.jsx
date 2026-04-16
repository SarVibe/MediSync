import React from 'react';
import { formatDate } from '../utils/dateUtils';

const RecordCard = ({ record, onPreview, onDelete, canDelete = true }) => {
  const {
    recordType = record.type,
    description,
    createdAt = record.date,
    fileUrl = record.fileUrl,
  } = record;

  const getIcon = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('lab')) return '🧪';
    if (t.includes('scan') || t.includes('xray') || t.includes('ct') || t.includes('mri')) return '🩻';
    if (t.includes('report')) return '📄';
    if (t.includes('ultrasound')) return '🔊';
    if (t.includes('discharge')) return '📋';
    return '📁';
  };

  const getRecordTypeLabel = (type) => {
    return type?.replace(/_/g, ' ') || 'Record';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-md shadow-slate-200/40 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-xl shadow-sm">
            {getIcon(recordType)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-slate-900 text-sm truncate tracking-wide uppercase">
              {getRecordTypeLabel(recordType)}
            </h4>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              {formatDate(createdAt)}
            </p>
          </div>
        </div>
        {onDelete && canDelete && (
          <button
            onClick={() => onDelete(record)}
            className="text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors p-1.5 rounded-lg flex-shrink-0"
            title="Delete record"
          >
            🗑️
          </button>
        )}
      </div>

      <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed min-h-11">
        {description || 'No description provided.'}
      </p>

      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <span className="text-[10px] text-slate-500 font-bold truncate max-w-[140px] px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
          📎 {fileUrl?.split('/').pop()?.substring(0, 20) || 'record_file'}
        </span>
        <button
          onClick={() => onPreview(record)}
          className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm active:scale-95"
        >
          View File
        </button>
      </div>
    </div>
  );
};

export default RecordCard;
