import React from 'react';
import { Calendar } from 'lucide-react';

export default function DateFilter({ value, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="w-4 h-4 text-zinc-500 group-hover:text-brand transition-colors" />
        </div>
        <select
          value={value.type}
          onChange={(e) => onChange({ ...value, type: e.target.value })}
          className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand appearance-none cursor-pointer hover:border-zinc-500 transition-colors"
        >
          <option value="THIS_MONTH">This Month</option>
          <option value="LAST_MONTH">Last Month</option>
          <option value="THIS_YEAR">This Year</option>
          <option value="ALL_TIME">All Time</option>
          <option value="CUSTOM">Custom Date Range</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      {value.type === 'CUSTOM' && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
          <input
            type="date"
            value={value.startDate}
            onChange={(e) => onChange({ ...value, startDate: e.target.value })}
            className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand hover:border-zinc-500 transition-colors"
          />
          <span className="text-zinc-500 text-sm font-medium">to</span>
          <input
            type="date"
            value={value.endDate}
            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
            className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand hover:border-zinc-500 transition-colors"
          />
        </div>
      )}
    </div>
  );
}

export const filterByDateRange = (items, dateField, filterConfig) => {
  if (filterConfig.type === 'ALL_TIME') return items;
  
  const now = new Date();
  let start = new Date(now.getFullYear(), now.getMonth(), 1);
  let end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  if (filterConfig.type === 'LAST_MONTH') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  } else if (filterConfig.type === 'THIS_YEAR') {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  } else if (filterConfig.type === 'CUSTOM') {
    start = filterConfig.startDate ? new Date(filterConfig.startDate) : new Date('2000-01-01');
    end = filterConfig.endDate ? new Date(filterConfig.endDate) : new Date('2099-12-31');
    end.setHours(23, 59, 59);
  }

  return items.filter(item => {
    let itemDateStr = item[dateField];
    if (!itemDateStr) return true; // fallback for missing date
    
    // Check if itemDateStr looks like "October 6, 2026"
    let itemDate = new Date(itemDateStr);
    
    if (isNaN(itemDate.getTime()) && typeof itemDateStr === 'string') {
      const parts = itemDateStr.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[2].length === 4) { // DD-MM-YYYY
          itemDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }
    }

    if (isNaN(itemDate.getTime())) return true; // fallback

    return itemDate >= start && itemDate <= end;
  });
};
