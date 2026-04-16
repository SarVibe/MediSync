import React from "react";
import { Search, Filter, X } from "lucide-react";

/**
 * Reusable AdminSearchFilter component for searching and filtering tables.
 */
const AdminSearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  onSearchClear, 
  placeholder = "Search by name, email, or phone...",
  children // This will allow adding custom filters (dropdowns, etc.)
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
      <div className="relative flex-1 w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-neutral-400" />
        </div>
        <input
          type="text"
          className="input pl-11 pr-11 py-2.5 text-sm rounded-2xl border border-neutral-100 bg-white focus:ring-4 focus:ring-primary/10 hover:border-neutral-200 transition-all"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={onSearchClear}
            className="absolute inset-y-0 right-0 pr-4 flex cursor-pointer items-center text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Container for extra filters */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        {children}
      </div>
    </div>
  );
};

export default AdminSearchFilter;
