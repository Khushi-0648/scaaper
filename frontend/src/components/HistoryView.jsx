import React, { useState, useEffect } from 'react';
import { 
  History, 
  FileSpreadsheet, 
  Trash2, 
  ArrowRight, 
  Building2, 
  Globe, 
  Search, 
  ExternalLink,
  MapPin,
  Star
} from 'lucide-react';
import { 
  getExcelDownloadUrl, 
  getAllBusinessSearches, 
  deleteBusinessSearch, 
  clearAllBusinessSearches,
  getBusinessExcelUrl
} from '../services/api';

export default function HistoryView({ history = [], onSelectAnalysis, onDeleteAnalysis, onSelectBusinessSearch }) {
  const [activeTab, setActiveTab] = useState('businesses'); // 'businesses' | 'websites'
  const [businessSearches, setBusinessSearches] = useState([]);
  const [isLoadingBiz, setIsLoadingBiz] = useState(false);

  const fetchBusinessHistory = async () => {
    setIsLoadingBiz(true);
    try {
      const data = await getAllBusinessSearches();
      if (Array.isArray(data)) {
        setBusinessSearches(data);
      }
    } catch (e) {
      console.warn('Failed to fetch business searches:', e);
    } finally {
      setIsLoadingBiz(false);
    }
  };

  useEffect(() => {
    fetchBusinessHistory();
  }, []);

  const handleDeleteBiz = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteBusinessSearch(id);
      setBusinessSearches(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      alert('Failed to delete search record: ' + err.message);
    }
  };

  const handleClearAllBiz = async () => {
    if (!window.confirm('Clear all business discovery history?')) return;
    try {
      await clearAllBusinessSearches();
      setBusinessSearches([]);
    } catch (err) {
      alert('Failed to clear: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            <span>Archive & History</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Persisted business discoveries, Google Maps data, and crawl reports stored in database.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl border border-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab('businesses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'businesses'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Business Searches ({businessSearches.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('websites')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'websites'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Website Audits ({history.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BUSINESS SEARCHES HISTORY */}
      {activeTab === 'businesses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Discovered Business Datasets ({businessSearches.length})
            </span>
            {businessSearches.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllBiz}
                className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Business History</span>
              </button>
            )}
          </div>

          {businessSearches.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center shadow-xs">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Business Searches Recorded</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Search businesses in the Business Finder to save datasets with Google Maps links, ratings, and phone numbers.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-800 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Search Query</th>
                      <th className="py-3.5 px-3">Location</th>
                      <th className="py-3.5 px-3">Category</th>
                      <th className="py-3.5 px-3">Date</th>
                      <th className="py-3.5 px-3">Total Businesses</th>
                      <th className="py-3.5 px-3">With Websites</th>
                      <th className="py-3.5 px-3">Data Provider</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {businessSearches.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                          <div className="text-sm">{item.query || `${item.keyword} in ${item.location}`}</div>
                          <div className="text-[10px] font-mono text-slate-400">ID: {item.id.slice(0, 8)}...</div>
                        </td>
                        <td className="py-3.5 px-3 font-medium text-slate-700">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{item.location}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-700 font-semibold">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] border border-blue-100">
                            {item.keyword}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(item.created_at).toLocaleDateString()}
                          <div className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                          {item.results_count || 0}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-emerald-600">
                          {item.websites_count || 0}
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                            {item.provider === 'google_places' ? 'Google Maps Verified' : 'Global Directory'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onSelectBusinessSearch && (
                              <button
                                onClick={() => onSelectBusinessSearch(item)}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center gap-1 text-xs shadow-xs"
                                title="Open this search in Business Finder"
                              >
                                <span>Open</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <a
                              href={getBusinessExcelUrl(item.id)}
                              download
                              className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition"
                              title="Download Master Excel Report (.xlsx)"
                            >
                              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                            </a>

                            <button
                              onClick={(e) => handleDeleteBiz(e, item.id)}
                              className="p-1.5 rounded-xl hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
                              title="Delete Search Dataset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WEBSITE AUDITS HISTORY */}
      {activeTab === 'websites' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center shadow-xs">
              <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Past Analyses Recorded</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Run an analysis from the Dashboard to record crawl metrics and generate Excel spreadsheets.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 min-w-[640px]">
                  <thead className="bg-slate-50 text-slate-800 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
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
                  <tbody className="divide-y divide-slate-100">
                    {history.map((item) => {
                      const isComplete = item.status === 'completed';
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/40 transition">
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
                          <span className={`font-bold ${item.seo_score >= 80 ? 'text-emerald-700' : 'text-blue-700'}`}>
                            {item.seo_score}/100
                          </span>
                        ) : '-'}
                      </td>

                      {/* Perf */}
                      <td className="py-3.5 px-3 font-mono">
                        {isComplete ? (
                          <span className={`font-bold ${item.performance_score >= 75 ? 'text-emerald-700' : 'text-blue-700'}`}>
                            {item.performance_score}/100
                          </span>
                        ) : '-'}
                      </td>

                      {/* A11y */}
                      <td className="py-3.5 px-3 font-mono">
                        {isComplete ? (
                          <span className={`font-bold ${item.accessibility_score >= 80 ? 'text-emerald-700' : 'text-blue-700'}`}>
                            {item.accessibility_score}/100
                          </span>
                        ) : '-'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isComplete ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          item.status === 'failed' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          'bg-blue-50 text-slate-900 border border-blue-200 animate-pulse'
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
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center gap-1 text-xs shadow-xs"
                                title="Open Detailed Report"
                              >
                                <span>Report</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>

                              <a
                                href={getExcelDownloadUrl(item.id)}
                                download
                                className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-slate-900 border border-blue-200 transition"
                                title="Download Excel"
                              >
                                <FileSpreadsheet className="w-4 h-4 text-blue-900" />
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
    )}
  </div>
  );
}
