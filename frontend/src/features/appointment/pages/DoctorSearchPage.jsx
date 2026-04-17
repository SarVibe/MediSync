import React, { useEffect, useMemo, useState } from "react";
import DoctorCard from "../components/DoctorCard";
import { getDoctors } from "../services/doctorService";

const DoctorSearchPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [filterSpec, setFilterSpec] = useState("All");
  const hasActiveFilters = searchName.trim().length > 0 || filterSpec !== "All";

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
    <div className="px-4 py-8 min-h-screen to-blue-50 bg-linear-to-br from-slate-50">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Find a Doctor</h1>
          <p className="mt-1 text-slate-500">
            Search and book appointments with available doctors.
          </p>
        </div>

        <div className="flex flex-col gap-3 p-4 mb-6 bg-white rounded-xl border shadow-sm border-slate-200 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by doctor name"
              value={searchName}
              onChange={(event) => setSearchName(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchName.trim() ? (
              <button
                type="button"
                onClick={() => setSearchName("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                x
              </button>
            ) : null}
          </div>
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
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setSearchName("");
                setFilterSpec("All");
              }}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Clear
            </button>
          ) : null}
        </div>

        {!loading && (
          <p className="mb-4 text-sm text-slate-500">
            {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-blue-200 animate-spin border-t-blue-600" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400">
            <p className="mb-3 text-5xl">No doctors</p>
            <p className="text-base font-medium">No available doctors found.</p>
            <p className="mt-1 text-sm">
              Doctors must publish availability before they appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSearchPage;
