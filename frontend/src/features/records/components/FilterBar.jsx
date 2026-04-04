import React from 'react';

const FilterBar = ({ onSearch, onFilterChange, types = [] }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8 flex flex-col md:flex-row gap-4 shadow-sm">
      <div className="flex-1 relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input 
          type="text" 
          placeholder="Search by description or doctor..." 
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder:text-slate-400 font-medium text-slate-700"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <select 
          className="px-4 py-2.5 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 text-sm font-bold text-slate-600 appearance-none cursor-pointer"
          onChange={(e) => onFilterChange('type', e.target.value)}
        >
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select 
          className="px-4 py-2.5 rounded-xl bg-slate-50 border-none outline-none focus:ring-1 focus:ring-blue-500 text-sm font-bold text-slate-600 appearance-none cursor-pointer"
          onChange={(e) => onFilterChange('sort', e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
