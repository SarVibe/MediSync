import React, { useState, useEffect } from "react";
import DoctorCard from "../components/DoctorCard";
import { getDoctors } from "../services/doctorService";

// ── Mock data (used when API is unavailable during development) ────────────
const MOCK_DOCTORS = [
  { id: 1, name: "Arjun Sharma",   specialization: "Cardiology",    qualifications: "MBBS, MD",        experience: 12, availability: "Mon–Fri, 9 AM–5 PM" },
  { id: 2, name: "Priya Nair",     specialization: "Dermatology",   qualifications: "MBBS, DNB",       experience: 8,  availability: "Tue–Sat, 10 AM–4 PM" },
  { id: 3, name: "Ravi Kumar",     specialization: "Neurology",     qualifications: "MBBS, DM",        experience: 15, availability: "Mon–Thu, 8 AM–2 PM"  },
  { id: 4, name: "Meena Pillai",   specialization: "Pediatrics",    qualifications: "MBBS, MD",        experience: 10, availability: "Mon–Fri, 11 AM–6 PM" },
  { id: 5, name: "Suresh Menon",   specialization: "Orthopedics",   qualifications: "MBBS, MS",        experience: 18, availability: "Wed–Sun, 9 AM–3 PM"  },
  { id: 6, name: "Lakshmi Rao",    specialization: "Gynecology",    qualifications: "MBBS, MS, DGO",   experience: 14, availability: "Mon–Sat, 10 AM–5 PM" },
];

const SPECIALIZATIONS = [
  "All", "Cardiology", "Dermatology", "Neurology", "Pediatrics", "Orthopedics", "Gynecology",
];

/**
 * DoctorSearchPage – /patient/doctors
 * Lets patients search and filter doctors, then navigate to booking.
 */
const DoctorSearchPage = () => {
  const [doctors,        setDoctors]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchName,     setSearchName]     = useState("");
  const [filterSpec,     setFilterSpec]     = useState("All");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getDoctors();
        setDoctors(Array.isArray(data) ? data : data.doctors ?? MOCK_DOCTORS);
      } catch {
        setDoctors(MOCK_DOCTORS);           // fallback to mock data
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = doctors.filter((d) => {
    const nameMatch = d.name.toLowerCase().includes(searchName.toLowerCase());
    const specMatch = filterSpec === "All" || d.specialization === filterSpec;
    return nameMatch && specMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Find a Doctor</h1>
          <p className="text-slate-500 mt-1">
            Search and book appointments with our specialist doctors.
          </p>
        </div>

        {/* Search & Filter bar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="🔍  Search by doctor name…"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800
              placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterSpec}
            onChange={(e) => setFilterSpec(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-700
              focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>{s === "All" ? "All Specializations" : s}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-slate-500 mb-4">
            {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Doctor grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-base font-medium">No doctors found.</p>
            <p className="text-sm mt-1">Try a different name or specialization.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSearchPage;
