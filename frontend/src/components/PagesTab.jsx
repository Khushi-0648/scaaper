import React, { useState } from 'react';
import { Search, ArrowUpDown, ExternalLink, AlertCircle, FileText } from 'lucide-react';

export default function PagesTab({ pages = [] }) {
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState('url');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filtered = pages.filter(p => {
    const q = query.toLowerCase();
    return (
      p.url.toLowerCase().includes(q) ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.h1 && p.h1.toLowerCase().includes(q))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc 
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  return (
    <div className="space-y-4">
      {/* Search and Summary */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Discovered Pages Table</h3>
            <span className="text-xs text-slate-500 font-medium">({pages.length} total pages crawled)</span>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search URL, title, or H1..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50/50 border border-blue-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 min-w-[700px]">
            <thead className="bg-slate-50 text-slate-800 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('url')}>
                  <div className="flex items-center gap-1">Page URL <ArrowUpDown className="w-3 h-3 text-blue-700" /></div>
                </th>
                <th className="py-3.5 px-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('status_code')}>
                  <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3 text-blue-700" /></div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">Page Title <ArrowUpDown className="w-3 h-3 text-blue-700" /></div>
                </th>
                <th className="py-3.5 px-4">H1 Heading</th>
                <th className="py-3.5 px-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('word_count')}>
                  <div className="flex items-center gap-1">Words <ArrowUpDown className="w-3 h-3 text-blue-700" /></div>
                </th>
                <th className="py-3.5 px-3">Links (Int/Ext)</th>
                <th className="py-3.5 px-3">Images</th>
                <th className="py-3.5 px-3 text-right">Missing Alt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 transition">
                  {/* URL */}
                  <td className="py-3 px-4 max-w-xs truncate font-mono text-slate-900 font-medium">
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline flex items-center gap-1">
                      <span className="truncate">{p.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 text-blue-600" />
                    </a>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status_code === 200 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {p.status_code || 'N/A'}
                    </span>
                  </td>

                  {/* Title */}
                  <td className="py-3 px-4 max-w-xs truncate text-slate-900 font-semibold" title={p.title}>
                    {p.title || <span className="text-slate-400 italic">None</span>}
                  </td>

                  {/* H1 */}
                  <td className="py-3 px-4 max-w-xs truncate text-slate-700" title={p.h1}>
                    {p.h1 || <span className="text-slate-400 italic">None</span>}
                  </td>

                  {/* Word count */}
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {p.word_count?.toLocaleString() || 0}
                  </td>

                  {/* Links */}
                  <td className="py-3 px-3 font-mono text-slate-600">
                    <span className="text-emerald-700 font-bold">{p.internal_links_count || 0}</span> / 
                    <span className="text-purple-700 font-bold"> {p.external_links_count || 0}</span>
                  </td>

                  {/* Images */}
                  <td className="py-3 px-3 font-mono font-medium text-slate-800">
                    {p.images_count || 0}
                  </td>

                  {/* Missing Alt */}
                  <td className="py-3 px-3 text-right">
                    {p.images_without_alt > 0 ? (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-mono font-bold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {p.images_without_alt}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
