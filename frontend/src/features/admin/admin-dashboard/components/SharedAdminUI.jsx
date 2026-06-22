import React from 'react';

export function SkeletonTableRows({ cols }) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-zinc-900/10">
          <td colSpan={cols} className="p-4 whitespace-nowrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-200 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-zinc-200 rounded w-1/4" />
                <div className="h-3 bg-zinc-200 rounded w-1/2" />
              </div>
              <div className="h-4 bg-zinc-200 rounded w-20 justify-self-end hidden sm:block" />
              <div className="h-8 bg-zinc-200 rounded w-24 justify-self-end" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export function PaginationBar({ total, page, limit, onPageChange, onLimitChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safeCurrentPage = Math.min(page, totalPages);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const from = total === 0 ? 0 : (safeCurrentPage - 1) * limit + 1;
  const to = Math.min(safeCurrentPage * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 px-1 border-t border-zinc-200 mt-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-zinc-500 capitalize ">
          Showing <span className="text-zinc-700 font-bold">{from}–{to}</span> of <span className="text-zinc-700 font-bold">{total}</span>
        </span>
        <select
          value={limit}
          onChange={(e) => { onLimitChange(Number(e.target.value)); onPageChange(1); }}
          className="ml-2 bg-zinc-50 border border-zinc-200 text-zinc-700 text-sm font-bold rounded px-2 py-1 cursor-pointer outline-none focus:border-brand"
        >
          {[5, 10, 25, 50].map(n => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className="px-2 py-1.5 rounded border border-zinc-200 bg-white text-xs font-bold capitalize  text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Prev
        </button>
        {getPageNumbers().map(n => (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            className={`w-7 h-7 rounded border text-sm font-bold transition cursor-pointer ${n === safeCurrentPage
              ? 'bg-brand border-brand text-zinc-950 shadow-sm'
              : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          className="px-2 py-1.5 rounded border border-zinc-200 bg-white text-xs font-bold capitalize  text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
