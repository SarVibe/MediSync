import React from 'react';
import { formatDate } from '../utils/dateUtils';

const PrescriptionCard = ({
  prescription,
  onPreview,
  onDownload,
  isAdmin,
  onDelete,
}) => {
  const {
    id,
    doctorId,
    doctorName = 'Unknown Doctor',
    patientId,
    patientName = 'Unknown Patient',
    createdAt,
    validUntil,
    appointmentId,
    prescriptionUrl,
  } = prescription;

  // Fallback for different field name formats
  const issueDate = createdAt || prescription.date;
  const appointmentRef = appointmentId ? `#APT-${appointmentId}` : prescription.appointmentRef || '#00000';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-emerald-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-800 text-sm truncate">
            {isAdmin ? `👤 ${patientName}` : `👨‍⚕️ Dr. ${doctorName}`}
          </h4>
          <p className="text-xs text-emerald-600 font-semibold">Ref: {appointmentRef}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Issued
          </p>
          <p className="text-xs font-bold text-slate-700">
            {formatDate(issueDate)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 pt-4 border-t border-slate-50">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Valid Until
          </p>
          <p className="text-xs font-semibold text-slate-600">
            {validUntil ? formatDate(validUntil) : 'No expiry'}
          </p>
        </div>
        {isAdmin && onDelete && (
          <div className="text-right">
            <button
              onClick={() => onDelete(prescription)}
              className="text-slate-300 hover:text-red-500 transition-colors"
              title="Delete prescription"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPreview(prescription)}
          className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
        >
          👁️ Preview
        </button>
        <button
          onClick={() => onDownload(prescription)}
          className="flex-1 py-2 border border-blue-600 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors"
        >
          ⬇️ Download
        </button>
      </div>
    </div>
  );
};

export default PrescriptionCard;
