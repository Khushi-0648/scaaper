import React from 'react';
import { History, FileSpreadsheet, Trash2, ArrowRight } from 'lucide-react';
import { getExcelDownloadUrl } from '../services/api';

export default function HistoryView({ history = [], onSelectAnalysis, onDeleteAnalysis }) {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-yellow-600" />
            <span>Analysis History</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Persisted crawl audits and generated reports stored in SQLite.
          </p>
        </div>
        <span className="text-xs text-yellow-950 font-bold font-mono bg-yellow-100 px-3 py-1.5 rounded-xl border border-yellow-300">
          {history.length} records saved
        </span>
      </div>

      {history.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-yellow-200 text-center shadow-xs">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Past Analyses Recorded</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Run an analysis from the Dashboard to record crawl metrics and generate Excel spreadsheets.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-yellow-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-yellow-100/70 text-yellow-950 uppercase font-extrabold text-[10px] tracking-wider border-b border-yellow-200">
                <tr>
                  <th className="py-3.5 px-4">Website URL</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Pages</th>
                  <th className="py-3.5 px-3">SEO</th>
                  <th className="py-3.5 px-3">Performance</th>
                  <th className="py-3.5 px-3">Accessibility</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-100">
                {history.map((item) => {
                  const isComplete = item.status === 'completed';
                  return (
                    <tr key={item.id} className="hover:bg-yellow-50/40 transition">
                      {/* URL */}
                      <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                        <div className="font-extrabold text-sm truncate">{item.domain}</div>
                        <div className="text-[11px] text-slate-500 truncate font-mono">{item.url}</div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString()}
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Pages */}
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        {item.pages_count || 1}
                      </td>

                      {/* SEO */}
                      <td className="py-3.5 px-3 font-mono">
                        {isComplete ? (
                          <span className={`font-bold ${item.seo_score >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {item.seo_score}/100
                          </span>
                        ) : '-'}
                      </td>

                      {/* Perf */}
                      <td className="py-3.5 px-3 font-mono">
                        {isComplete ? (
                          <span className={`font-bold ${item.performance_score >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {item.performance_score}/100
                          </span>
                        ) : '-'}
                      </td>

                      {/* A11y */}
                      <td className="py-3.5 px-3 font-mono">
                        {isComplete ? (
                          <span className={`font-bold ${item.accessibility_score >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {item.accessibility_score}/100
                          </span>
                        ) : '-'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isComplete ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          item.status === 'failed' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          'bg-yellow-100 text-yellow-900 border border-yellow-300 animate-pulse'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isComplete && (
                            <>
                              <button
                                onClick={() => onSelectAnalysis(item.id)}
                                className="px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold transition flex items-center gap-1 text-xs shadow-xs"
                                title="Open Detailed Report"
                              >
                                <span>Report</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>

                              <a
                                href={getExcelDownloadUrl(item.id)}
                                download
                                className="p-1.5 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-950 border border-yellow-300 transition"
                                title="Download Excel"
                              >
                                <FileSpreadsheet className="w-4 h-4 text-yellow-800" />
                              </a>
                            </>
                          )}

                          <button
                            onClick={() => onDeleteAnalysis(item.id)}
                            className="p-1.5 rounded-xl hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
                            title="Delete Analysis"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
