import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  ArrowRight, 
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  PlusCircle,
  MapPin,
  Play
} from 'lucide-react';
import { getBatchJob, getAllBatchJobs, startBatchAnalysis } from '../services/api';

export default function BatchAnalysisView({ activeBatchId, onSelectAnalysis, onNavigate }) {
  const [currentJob, setCurrentJob] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  // New batch creation form states
  const [batchTitle, setBatchTitle] = useState('');
  const [urlsInput, setUrlsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadAllJobs();
    if (activeBatchId) {
      startPollingBatch(activeBatchId);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeBatchId]);

  const loadAllJobs = async () => {
    try {
      const list = await getAllBatchJobs();
      setAllJobs(list);
      if (!currentJob && list.length > 0 && !activeBatchId) {
        const first = await getBatchJob(list[0].id);
        setCurrentJob(first);
      }
    } catch (err) {
      console.error('Failed to load batch jobs:', err);
    }
  };

  const startPollingBatch = (batchId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const job = await getBatchJob(batchId);
        setCurrentJob(job);
        if (job.status === 'completed' || job.status === 'failed' || job.status === 'partial') {
          clearInterval(pollRef.current);
          loadAllJobs();
        }
      } catch (err) {
        console.error('Batch poll error:', err);
      }
    }, 1500);
  };

  const handleSelectJob = async (id) => {
    setLoading(true);
    try {
      const job = await getBatchJob(id);
      setCurrentJob(job);
      if (job.status === 'running' || job.status === 'queued') {
        startPollingBatch(id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartManualBatch = async (e) => {
    e.preventDefault();
    setFormError('');

    const rawLines = urlsInput
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (rawLines.length === 0) {
      setFormError('Please enter at least one website URL to analyze.');
      return;
    }

    const items = rawLines.map(raw => {
      let web = raw;
      if (!web.startsWith('http://') && !web.startsWith('https://')) {
        web = `https://${web}`;
      }
      const domainName = web.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
      return {
        business_name: domainName.toUpperCase(),
        website: web
      };
    });

    setIsSubmitting(true);
    try {
      const title = batchTitle.trim() || `Batch Audit (${items.length} Websites)`;
      const job = await startBatchAnalysis({
        title,
        items
      });

      setCurrentJob(job);
      startPollingBatch(job.id);
      loadAllJobs();
      setUrlsInput('');
      setBatchTitle('');
    } catch (err) {
      setFormError(err.message || 'Failed to start batch analysis job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadExamples = () => {
    setBatchTitle('Top Tech Platforms Audit');
    setUrlsInput(
      'https://github.com\nhttps://stripe.com\nhttps://vercel.com\nhttps://tailwindcss.com'
    );
    setFormError('');
  };

  const total = currentJob?.total_items || 0;
  const completed = currentJob?.completed_items || 0;
  const running = currentJob?.running_items || 0;
  const queued = currentJob?.queued_items || 0;
  const failed = currentJob?.failed_items || 0;

  const pct = total > 0 ? Math.round(((completed + failed) / total) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Batch Website Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Queue and audit multiple websites concurrently with automated rate limiting and full audit dossiers.
          </p>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('business')}
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Find Businesses to Batch Audit</span>
          </button>
        )}
      </div>

      {/* Manual Batch Creation Form */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Start New Batch Analysis</h2>
          </div>
          <button
            type="button"
            onClick={handleLoadExamples}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample URLs</span>
          </button>
        </div>

        <form onSubmit={handleStartManualBatch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Batch Job Name <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={batchTitle}
                onChange={(e) => setBatchTitle(e.target.value)}
                placeholder="e.g. SaaS Competitors 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400">
                Helpful label to identify this batch run in history.
              </p>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Target URLs <span className="text-slate-400 font-normal">(One per line or comma-separated)</span>
              </label>
              <textarea
                rows={4}
                value={urlsInput}
                onChange={(e) => setUrlsInput(e.target.value)}
                placeholder="https://example.com&#10;https://stripe.com&#10;https://github.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2 gap-2.5">
            <span className="text-xs text-slate-400">
              Audit queue runs up to 2 concurrent crawls with full SEO, performance &amp; security checks.
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/25 transition flex items-center justify-center gap-2 disabled:opacity-60 btn-motion active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Queueing Batch...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Batch Audit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Active Job Progress Card */}
      {currentJob ? (
        <div className="p-5 sm:p-8 rounded-3xl bg-white border-2 border-blue-200 shadow-xl shadow-blue-50/50 space-y-6 card-motion">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-950">{currentJob.title}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Job ID: {currentJob.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${
                currentJob.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : currentJob.status === 'running'
                  ? 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse'
                  : 'bg-blue-50 text-blue-900 border-blue-200'
              }`}>
                {currentJob.status}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-700">
              <span>Overall Progress ({pct}%)</span>
              <span>{completed + failed} / {total} processed</span>
            </div>
            <div className="w-full h-3.5 bg-blue-50 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
            </div>
          </div>

          {/* 4 Metrics Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center card-motion">
              <div className="text-2xl font-black text-emerald-950">{completed}</div>
              <div className="text-xs font-bold text-emerald-700 mt-0.5">Completed</div>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center card-motion">
              <div className="text-2xl font-black text-blue-950">{running}</div>
              <div className="text-xs font-bold text-blue-700 mt-0.5">Running</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center card-motion">
              <div className="text-2xl font-black text-slate-900">{queued}</div>
              <div className="text-xs font-bold text-slate-600 mt-0.5">Queued</div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center card-motion">
              <div className="text-2xl font-black text-rose-950">{failed}</div>
              <div className="text-xs font-bold text-rose-700 mt-0.5">Failed</div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse min-w-[540px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Business / Site</th>
                  <th className="py-2.5 px-4">Website URL</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Audit Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(currentJob.items || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{item.business_name}</td>
                    <td className="py-2.5 px-4 font-mono text-blue-700 truncate max-w-xs">{item.url}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        item.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'running'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : item.status === 'failed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {item.analysis_id && item.status === 'completed' ? (
                        <button
                          onClick={() => onSelectAnalysis(item.analysis_id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-[11px] text-white transition shadow-xs"
                        >
                          View Audit
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Batch Jobs History */}
      {allJobs.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-base text-slate-950">Previous Batch Jobs</h3>
          <div className="divide-y divide-slate-100">
            {allJobs.map((j) => (
              <div 
                key={j.id} 
                onClick={() => handleSelectJob(j.id)}
                className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 px-3 rounded-xl transition"
              >
                <div>
                  <div className="font-bold text-sm text-slate-900">{j.title}</div>
                  <div className="text-xs text-slate-500">{j.total_items} websites &bull; {j.created_at}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-900 border border-slate-200">
                    {j.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
