import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * DoctorCard – displays a doctor's summary and "View Availability" button.
 *
 * Props:
 *  doctor – { id, name, specialization, experience, availability }
 */
const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();
  const { id, name, specialization, experience, qualifications, availability } = doctor;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group">
      {/* Top gradient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-sky-400" />

      <div className="p-5">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 shrink-0">
            {name?.charAt(0).toUpperCase() || "D"}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-base truncate group-hover:text-blue-700 transition-colors">
              Dr. {name}
            </h3>
            <p className="text-sm text-blue-600 font-medium">{specialization}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-sm text-slate-600 mb-4">
          {qualifications && (
            <div className="flex items-center gap-2">
              <span>🎓</span>
              <span className="truncate">{qualifications}</span>
            </div>
          )}
          {experience !== undefined && (
            <div className="flex items-center gap-2">
              <span>💼</span>
              <span>{experience} year{experience !== 1 ? "s" : ""} experience</span>
            </div>
          )}
          {availability && (
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span className="text-green-600 font-medium">{availability}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate(`/patient/book/${id}`)}
          className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold
            hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm hover:shadow-md"
        >
          View Availability
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
