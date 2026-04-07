import React from "react";
import { ChevronRight, Loader2 } from "lucide-react";

const AdminTable = ({ 
  headers, 
  data, 
  renderRow, 
  isLoading, 
  emptyMessage = "No records found." 
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-neutral-100 rounded-2xl">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-neutral-500 font-medium">Loading records...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-neutral-100 rounded-2xl text-center">
        <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center mb-4">
          <ChevronRight className="w-6 h-6 text-neutral-300" />
        </div>
        <p className="text-sm text-neutral-600 font-semibold">{emptyMessage}</p>
        <p className="text-xs text-neutral-400 mt-1">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white border border-neutral-100 rounded-2xl shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-neutral-50/50 border-b border-neutral-100">
            {headers.map((header, index) => (
              <th 
                key={index}
                className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {data.map((item, index) => renderRow(item, index))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
