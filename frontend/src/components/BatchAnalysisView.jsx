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
  Play,
  Search,
  Filter,
  ShieldCheck,
  Gauge,
  Zap,
  Globe,
  Mail,
  Phone,
  Cpu,
  AlertTriangle,
  Download,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { getBatchJob, getAllBatchJobs, startBatchAnalysis, getBatchExcelUrl } from '../services/api';

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

  // Table filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Aggregate Metrics for completed items
  const completedItems = (currentJob?.items || []).filter(it => it.status === 'completed');
  const avgOverall = completedItems.length > 0 
    ? Math.round(completedItems.reduce((acc, it) => acc + (it.overall_score || 0), 0) / completedItems.length) 
    : null;
  const avgSeo = completedItems.length > 0 
    ? Math.round(completedItems.reduce((acc, it) => acc + (it.seo_score || 0), 0) / completedItems.length) 
    : null;
  const avgPerf = completedItems.length > 0 
    ? Math.round(completedItems.reduce((acc, it) => acc + (it.performance_score || 0), 0) / completedItems.length) 
    : null;
  const totalIssues = completedItems.reduce((acc, it) => acc + (it.issues_count || 0), 0);

  // Filtered items
  const filteredItems = (currentJob?.items || []).filter(item => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (item.business_name && item.business_name.toLowerCase().includes(q)) ||
      (item.url && item.url.toLowerCase().includes(q)) ||
      (item.domain && item.domain.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getScoreBadge = (score) => {
    if (score == null) return { bg: 'bg-slate-100 text-slate-500 border-slate-200', text: '—' };
    if (score >= 80) return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: `${score}/100` };
    if (score >= 60) return { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: `${score}/100` };
    return { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: `${score}/100` };
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Batch Website Analysis
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Simultaneously audit and benchmark multiple websites, collect contact leads, detect tech stacks, and export comparative executive dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {onNavigate && (
            <button
              onClick={() => onNavigate('business')}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Find Businesses to Audit</span>
            </button>
          )}
          <button
            onClick={loadAllJobs}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
            title="Refresh batch list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
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
                Custom label to identify this batch in reports and history.
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

      {/* Active Job Progress Dashboard */}
      {currentJob ? (
        <div className="p-5 sm:p-8 rounded-3xl bg-white border-2 border-blue-200 shadow-xl shadow-blue-50/50 space-y-6 card-motion">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-950">{currentJob.title}</h2>
                <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider border ${
                  currentJob.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : currentJob.status === 'running'
                    ? 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse'
                    : 'bg-blue-50 text-blue-900 border-blue-200'
                }`}>
                  {currentJob.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Job ID: {currentJob.id}</p>
            </div>

            {/* Export Master Batch Excel Button */}
            {completedItems.length > 0 && (
              <a
                href={getBatchExcelUrl(currentJob.id)}
                download
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm border border-emerald-700 transition active:scale-95 btn-motion shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <span>Export Batch Excel (.xlsx)</span>
              </a>
            )}
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

          {/* 4 Status Counters */}
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

          {/* Rollup Executive KPI Cards */}
          {completedItems.length > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Batch Comparative Intelligence Summary
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-semibold">Avg Health</span>
                    <Gauge className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">{avgOverall ?? '—'}/100</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Overall benchmark</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-semibold">Avg SEO</span>
                    <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">{avgSeo ?? '—'}/100</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Search readiness</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-semibold">Avg Performance</span>
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">{avgPerf ?? '—'}/100</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Page speed rating</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-semibold">Pitch Opportunities</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <div className="text-xl font-extrabold text-rose-700">{totalIssues} Issues</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Key client growth gaps</div>
                </div>
              </div>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search websites or businesses..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {['all', 'completed', 'running', 'failed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Itemized Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Business &amp; Domain</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Health</th>
                  <th className="py-2.5 px-3 text-center">SEO</th>
                  <th className="py-2.5 px-3 text-center">Perf</th>
                  <th className="py-2.5 px-3">Tech Stack</th>
                  <th className="py-2.5 px-3">Contacts</th>
                  <th className="py-2.5 px-3 text-center">Gaps</th>
                  <th className="py-2.5 px-3 text-right">Audit Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      No websites match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => {
                    const healthBadge = getScoreBadge(item.overall_score);
                    const seoBadge = getScoreBadge(item.seo_score);
                    const perfBadge = getScoreBadge(item.performance_score);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 truncate max-w-[180px]">
                            {item.business_name}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="font-mono text-slate-500 text-[11px] truncate max-w-[160px]">
                              {item.url}
                            </span>
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-blue-500 hover:text-blue-700 shrink-0"
                              title="Visit website"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
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
                        <td className="py-2.5 px-3 text-center">
                          {item.status === 'completed' ? (
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold border ${healthBadge.bg}`}>
                              {healthBadge.text}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {item.status === 'completed' ? (
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${seoBadge.bg}`}>
                              {seoBadge.text}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {item.status === 'completed' ? (
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${perfBadge.bg}`}>
                              {perfBadge.text}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {item.tech_stack && item.tech_stack.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                              {item.tech_stack.map((t, ti) => (
                                <span key={ti} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                                  {t}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Standard Stack</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col gap-0.5">
                            {item.email ? (
                              <a href={`mailto:${item.email}`} className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline truncate max-w-[130px]">
                                <Mail className="w-3 h-3 shrink-0" />
                                <span className="truncate">{item.email}</span>
                              </a>
                            ) : null}
                            {item.phone ? (
                              <a href={`tel:${item.phone}`} className="flex items-center gap-1 text-[11px] text-emerald-600 hover:underline truncate max-w-[130px]">
                                <Phone className="w-3 h-3 shrink-0" />
                                <span className="truncate">{item.phone}</span>
                              </a>
                            ) : null}
                            {!item.email && !item.phone && (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {item.status === 'completed' ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                              {item.issues_count ?? 0}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {item.analysis_id && item.status === 'completed' ? (
                            <button
                              onClick={() => onSelectAnalysis(item.analysis_id)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-[11px] text-white transition shadow-xs whitespace-nowrap"
                            >
                              View Audit
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Batch Jobs History */}
      {allJobs.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-950">Previous Batch Jobs</h3>
            <span className="text-xs text-slate-400">{allJobs.length} total jobs</span>
          </div>
          <div className="divide-y divide-slate-100">
            {allJobs.map((j) => (
              <div 
                key={j.id} 
                onClick={() => handleSelectJob(j.id)}
                className={`py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 px-3 rounded-xl transition ${
                  currentJob?.id === j.id ? 'bg-blue-50/60 border border-blue-200' : ''
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-slate-900">{j.title}</div>
                  <div className="text-xs text-slate-500">
                    {j.total_items} websites &bull; {j.created_at ? j.created_at.replace('T', ' ').slice(0, 19) : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border ${
                    j.status === 'completed' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : j.status === 'running'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
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
