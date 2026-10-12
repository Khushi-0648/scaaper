import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Trophy, 
  Gauge, 
  Search, 
  CheckCircle2, 
  Cpu, 
  ExternalLink,
  Zap,
  ShieldCheck,
  Eye,
  BarChart2
} from 'lucide-react';
import { compareCompetitors, getHistory } from '../services/api';

export default function CompetitorView({ onSelectAnalysis }) {
  const [historyList, setHistoryList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const list = await getHistory();
      const completed = list.filter(item => item.status === 'completed');
      setHistoryList(completed);
      if (completed.length >= 2) {
        const initial = completed.slice(0, 3).map(c => c.id);
        setSelectedIds(initial);
        fetchComparison(initial);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComparison = async (ids) => {
    if (ids.length < 2) {
      setComparisonResult(null);
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await compareCompetitors(ids);
      setComparisonResult(res);
    } catch (err) {
      setErrorMsg(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    let next;
    if (selectedIds.includes(id)) {
      next = selectedIds.filter(x => x !== id);
    } else {
      if (selectedIds.length >= 5) {
        alert('You can compare a maximum of 5 websites at once.');
        return;
      }
      next = [...selectedIds, id];
    }
    setSelectedIds(next);
    if (next.length >= 2) {
      fetchComparison(next);
    } else {
      setComparisonResult(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Competitor Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Compare 2 to 5 websites side-by-side across SEO, speed, security, and tech stacks.
        </p>
      </div>

      {/* Target Selector */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">
            Select Websites to Compare ({selectedIds.length}/5 selected):
          </h3>
          <span className="text-xs text-slate-500">Pick from completed audits</span>
        </div>

        {historyList.length === 0 ? (
          <div className="text-xs text-slate-400 py-3">
            No completed website audits found in history. Run a few audits in Website Analyzer to compare them here!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {historyList.map((h) => {
              const isSelected = selectedIds.includes(h.id);
              return (
                <button
                  key={h.id}
                  onClick={() => toggleSelect(h.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black transition border flex items-center gap-2 ${
                    isSelected
                      ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                      : 'bg-slate-50/50 hover:bg-blue-50/60 text-slate-800 border-slate-200'
                  }`}
                >
                  <span>{h.domain}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-blue-600 text-white font-bold' : 'bg-blue-50 text-blue-800'
                  }`}>
                    Score: {h.overall_score || h.seo_score || 75}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* Results Matrix */}
      {comparisonResult && (
        <div className="space-y-6">
          {/* Leaderboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-50 border border-blue-200 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-blue-950 font-black text-xs uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-blue-600" />
                Overall Leader
              </div>
              <div className="text-lg font-black text-slate-950 truncate">
                {comparisonResult.leaderboard.best_overall || '—'}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-300 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-emerald-950 font-black text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4 text-emerald-600" />
                Fastest Response
              </div>
              <div className="text-lg font-black text-emerald-950 truncate">
                {comparisonResult.leaderboard.fastest_site || '—'}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-300 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-blue-950 font-black text-xs uppercase tracking-wider">
                <Search className="w-4 h-4 text-blue-600" />
                SEO Leader
              </div>
              <div className="text-lg font-black text-blue-950 truncate">
                {comparisonResult.leaderboard.seo_leader || '—'}
              </div>
            </div>
          </div>

          {/* Side-by-Side Table */}
          <div className="overflow-x-auto rounded-3xl bg-white border border-slate-200 shadow-sm">
            <table className="w-full text-left text-xs border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                  <th className="py-3 px-4 w-48">Audit Metric</th>
                  {comparisonResult.competitors.map((c) => (
                    <th key={c.id} className="py-3 px-4 min-w-[160px]">
                      <div className="font-bold text-slate-950">{c.domain}</div>
                      <a href={c.url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-700 font-mono flex items-center gap-1 font-normal">
                        <span>Visit</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Overall Score */}
                <tr className="bg-slate-50/40 font-black">
                  <td className="py-3 px-4 text-slate-950">Overall Health Score</td>
                  {comparisonResult.competitors.map((c) => (
                    <td key={c.id} className="py-3 px-4">
                      <span className="text-base text-slate-900">{c.overall_score}/100</span>
                    </td>
                  ))}
                </tr>

                {/* SEO Score */}
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-700">SEO Score</td>
                  {comparisonResult.competitors.map((c) => (
                    <td key={c.id} className="py-3 px-4 font-extrabold text-blue-700">
                      {c.seo_score}/100
                    </td>
                  ))}
                </tr>

                {/* Performance */}
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-700">Performance Score</td>
                  {comparisonResult.competitors.map((c) => (
                    <td key={c.id} className="py-3 px-4 font-extrabold text-emerald-700">
                      {c.performance_score}/100 ({c.load_time_ms}ms)
                    </td>
                  ))}
                </tr>

                {/* Accessibility */}
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-700">Accessibility Score</td>
                  {comparisonResult.competitors.map((c) => (
                    <td key={c.id} className="py-3 px-4 font-extrabold text-purple-700">
                      {c.accessibility_score}/100
                    </td>
                  ))}
                </tr>

                {/* Security */}
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-700">Security Score</td>
                  {comparisonResult.competitors.map((c) => (
                    <td key={c.id} className="py-3 px-4 font-extrabold text-rose-700">
                      {c.security_score}/100 {c.is_https ? '• HTTPS' : '• HTTP'}
                    </td>
                  ))}
                </tr>

                {/* UX Score */}
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-700">UX & Mobile Score</td>
                  {comparisonResult.competitors.map((c) => (
                    <td key={c.id} className="py-3 px-4 font-extrabold text-indigo-700">
                      {c.ux_score}/100
                    </td>
                  ))}
                </tr>

                {/* Discovered Features */}
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-700">Active Features</td>
                  {comparisonResult.competitors.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-[11px] text-slate-600">
                      <div className="font-bold text-slate-900">{c.features_count} detected</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                        {c.key_features.join(', ')}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Tech Stack */}
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-700">Technology Stack</td>
                  {comparisonResult.competitors.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-[11px] text-slate-600">
                      {c.technologies.length > 0 ? c.technologies.join(', ') : 'Standard HTML/JS'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
