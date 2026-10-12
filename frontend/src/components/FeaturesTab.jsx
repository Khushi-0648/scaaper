import React, { useState } from 'react';
import { CheckCircle2, XCircle, Search } from 'lucide-react';

export default function FeaturesTab({ features = [] }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const detectedCount = features.filter(f => f.status === 'Detected').length;
  const notDetectedCount = features.filter(f => f.status !== 'Detected').length;

  const filtered = features.filter(f => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'detected' && f.status === 'Detected') ||
      (filter === 'not_detected' && f.status !== 'Detected');

    const matchesQuery = 
      f.feature.toLowerCase().includes(query.toLowerCase()) ||
      (f.category && f.category.toLowerCase().includes(query.toLowerCase())) ||
      (f.evidence && f.evidence.toLowerCase().includes(query.toLowerCase()));

    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-4">
      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {/* Toggle Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-50 border border-slate-200 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              filter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({features.length})
          </button>
          <button
            onClick={() => setFilter('detected')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
              filter === 'detected' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Detected ({detectedCount})
          </button>
          <button
            onClick={() => setFilter('not_detected')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
              filter === 'not_detected' ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Not Detected ({notDetectedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter features or evidence..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50/50 border border-blue-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>
      </div>

      {/* Features Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((item, idx) => {
          const isDetected = item.status === 'Detected';
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                isDetected
                  ? 'bg-white border-slate-200 shadow-sm hover:border-blue-500'
                  : 'bg-white/60 border-slate-200 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isDetected ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{item.feature}</h4>
                      <span className="text-[10px] text-blue-900 uppercase font-bold">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isDetected
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}>
                      {item.status}
                    </span>
                    {isDetected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-slate-900 border border-blue-200">
                        {item.confidence}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700 bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/80 mb-2 leading-relaxed">
                  <span className="text-blue-900 font-bold block text-[10px] uppercase mb-0.5">Evidence:</span>
                  {item.evidence}
                </p>
              </div>

              {isDetected && item.detected_on && item.detected_on !== '-' && (
                <div className="text-[11px] text-slate-500 truncate pt-1">
                  Detected on: <span className="text-slate-800 font-mono font-medium">{item.detected_on}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
