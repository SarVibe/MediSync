import React, { useEffect, useMemo, useState } from "react";
import DoctorCard from "../components/DoctorCard";
import { getDoctors } from "../services/doctorService";

const DoctorSearchPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [filterSpec, setFilterSpec] = useState("All");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getDoctors();
        setDoctors(Array.isArray(data) ? data : []);
      } catch {
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const specializations = useMemo(() => {
    const values = doctors
      .map((doctor) => doctor.specialization)
      .filter(Boolean);
    return ["All", ...new Set(values)];
  }, [doctors]);

  const filtered = doctors.filter((doctor) => {
    const nameMatch = doctor.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const specMatch =
      filterSpec === "All" || doctor.specialization === filterSpec;
    return nameMatch && specMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Find a Doctor</h1>
          <p className="text-slate-500 mt-1">
            Search and book appointments with available doctors.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by doctor name"
            value={searchName}
            onChange={(event) => setSearchName(event.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterSpec}
            onChange={(event) => setFilterSpec(event.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {specializations.map((specialization) => (
              <option key={specialization} value={specialization}>
                {specialization === "All"
                  ? "All Specializations"
                  : specialization}
              </option>
            ))}
          </select>
        </div>

        {!loading && (
          <p className="text-sm text-slate-500 mb-4">
            {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}

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
            <p className="text-5xl mb-3">No doctors</p>
            <p className="text-base font-medium">No available doctors found.</p>
            <p className="text-sm mt-1">
              Doctors must publish availability before they appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSearchPage;
