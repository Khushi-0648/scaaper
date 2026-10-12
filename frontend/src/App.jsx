import React, { useState, useEffect, useRef } from 'react';
import Banner from './components/Banner';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import HeroSection from './components/HeroSection';
import ProgressView from './components/ProgressView';
import OverviewTab from './components/OverviewTab';
import FeaturesTab from './components/FeaturesTab';
import PagesTab from './components/PagesTab';
import SeoTab from './components/SeoTab';
import TechnicalTab from './components/TechnicalTab';
import PerformanceTab from './components/PerformanceTab';
import AccessibilityTab from './components/AccessibilityTab';
import AdvantagesDrawbacksTab from './components/AdvantagesDrawbacksTab';
import AiInsightsTab from './components/AiInsightsTab';
import VisualSitemapTab from './components/VisualSitemapTab';
import SecurityTab from './components/SecurityTab';

import BusinessFinderView from './components/BusinessFinderView';
import BatchAnalysisView from './components/BatchAnalysisView';
import ReportsView from './components/ReportsView';
import HistoryView from './components/HistoryView';

import { 
  startAnalysis, 
  getAnalysisStatus, 
  getAnalysisResults, 
  getExcelDownloadUrl, 
  getPdfDownloadUrl,
  getJsonDownloadUrl, 
  getCsvDownloadUrl, 
  getHistory, 
  deleteHistory,
  startBatchAnalysis
} from './services/api';

import { 
  FileSpreadsheet, 
  FileText, 
  FileCode, 
  AlertCircle, 
  ExternalLink,
  Layers,
  BarChart3,
  Search,
  Cpu,
  Gauge,
  Eye,
  CheckCircle2,
  Brain,
  GitBranch,
  Bot,
  ShieldCheck
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview & Health', icon: BarChart3 },
  { id: 'sitemap', label: 'Visual Sitemap', icon: GitBranch },
  { id: 'features', label: 'Features', icon: Layers },
  { id: 'pages', label: 'Pages Table', icon: FileText },
  { id: 'seo', label: 'SEO Audit', icon: Search },
  { id: 'security', label: 'Security Audit', icon: ShieldCheck },
  { id: 'technical', label: 'Technical Stack', icon: Cpu },
  { id: 'performance', label: 'Performance', icon: Gauge },
  { id: 'accessibility', label: 'Accessibility', icon: Eye },
  { id: 'advantages_drawbacks', label: 'Pros & Cons', icon: CheckCircle2 },
  { id: 'ai_insights', label: 'AI Synthesis', icon: Brain }
];

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('overview');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [activeBatchId, setActiveBatchId] = useState(null);
  const [activeBusinessSearchId, setActiveBusinessSearchId] = useState(null);
  const [history, setHistory] = useState([]);
  const pollTimerRef = useRef(null);

  useEffect(() => {
    loadHistoryList();
  }, []);

  const handleSelectBusinessSearch = (bizSearch) => {
    setActiveBusinessSearchId(bizSearch.id);
    setActiveView('business');
  };

  const loadHistoryList = async () => {
    try {
      const list = await getHistory();
      setHistory(list);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  // Start analysis trigger
  const handleStartAnalysis = async (crawlPayload) => {
    setErrorMessage('');
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setTargetUrl(crawlPayload.url);
    setStatusData({ progress_percent: 5, current_step: 'Submitting request...', step_logs: ['Validating URL syntax'] });
    setActiveView('analyzer');

    try {
      const res = await startAnalysis(crawlPayload);
      setCurrentAnalysisId(res.id);
      startPolling(res.id);
    } catch (err) {
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Failed to start analysis.');
    }
  };

  // Triggered from Business Finder "Analyze Website" button
  const handleAnalyzeFromBusiness = (websiteUrl) => {
    handleStartAnalysis({
      url: websiteUrl,
      max_pages: 25,
      crawl_delay: 0.2,
      same_domain_only: true,
      follow_external: false,
      js_rendering: 'auto'
    });
  };

  // Triggered from Business Finder "Analyze Selected / All"
  const handleStartBatch = async (businessesToAnalyze) => {
    const items = businessesToAnalyze.map(b => ({
      business_id: b.id,
      business_name: b.name,
      website: b.website
    }));

    try {
      const job = await startBatchAnalysis({
        title: `Batch Audit (${items.length} Websites)`,
        items: items
      });
      setActiveBatchId(job.id);
      setActiveView('batch');
    } catch (err) {
      alert('Failed to launch batch job: ' + err.message);
    }
  };

  // Status Poller
  const startPolling = (id) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      try {
        const status = await getAnalysisStatus(id);
        setStatusData(status);

        if (status.status === 'completed') {
          clearInterval(pollTimerRef.current);
          const fullResults = await getAnalysisResults(id);
          setAnalysisResult(fullResults);
          setIsAnalyzing(false);
          setActiveTab('overview');
          loadHistoryList();
        } else if (status.status === 'failed') {
          clearInterval(pollTimerRef.current);
          setIsAnalyzing(false);
          setErrorMessage(status.error_message || 'Analysis encountered an error.');
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 1000);
  };

  // Open existing analysis from history or batch
  const handleSelectHistoryAnalysis = async (id) => {
    try {
      const full = await getAnalysisResults(id);
      setAnalysisResult(full);
      setCurrentAnalysisId(id);
      setTargetUrl(full.url);
      setActiveView('analyzer');
      setActiveTab('overview');
    } catch (err) {
      alert('Failed to load historic analysis: ' + err.message);
    }
  };

  // Delete analysis
  const handleDeleteAnalysis = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis record and reports?')) return;
    try {
      await deleteHistory(id);
      if (currentAnalysisId === id) {
        setAnalysisResult(null);
        setCurrentAnalysisId(null);
      }
      loadHistoryList();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Announcement Banner */}
      <Banner onNavigate={setActiveView} />

      {/* Navigation Header */}
      <Header 
        activeView={activeView} 
        setActiveView={setActiveView} 
        historyCount={history.length} 
      />

      {/* Main Views */}
      <main className="flex-1 pb-16">
        {/* VIEW 1: DASHBOARD */}
        {activeView === 'dashboard' && (
          <DashboardView
            onNavigate={setActiveView}
            onSelectAnalysis={handleSelectHistoryAnalysis}
          />
        )}

        {/* VIEW 2: BUSINESS FINDER */}
        {activeView === 'business' && (
          <BusinessFinderView
            initialSearchId={activeBusinessSearchId}
            onAnalyzeWebsite={handleAnalyzeFromBusiness}
            onStartBatch={handleStartBatch}
          />
        )}

        {/* VIEW 3: BATCH ANALYSIS */}
        {activeView === 'batch' && (
          <BatchAnalysisView
            activeBatchId={activeBatchId}
            onSelectAnalysis={handleSelectHistoryAnalysis}
            onNavigate={setActiveView}
          />
        )}

        {/* VIEW 4: REPORTS CENTER */}
        {activeView === 'reports' && (
          <ReportsView />
        )}

        {/* VIEW 5: HISTORY ARCHIVE */}
        {activeView === 'history' && (
          <HistoryView
            history={history}
            onSelectAnalysis={handleSelectHistoryAnalysis}
            onDeleteAnalysis={handleDeleteAnalysis}
            onSelectBusinessSearch={handleSelectBusinessSearch}
          />
        )}

        {/* VIEW 9: WEBSITE ANALYZER */}
        {activeView === 'analyzer' && (
          <>
            {/* Input Hero Section */}
            <HeroSection
              onStartAnalyze={handleStartAnalysis}
              isAnalyzing={isAnalyzing}
            />

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="max-w-3xl mx-auto my-6 px-4">
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 flex items-start gap-3 shadow-xs">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-900">Unable to analyze website</h4>
                    <p className="text-xs text-rose-700 mt-1 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* In-Progress Live View */}
            {isAnalyzing && (
              <ProgressView 
                statusData={statusData} 
                targetUrl={targetUrl} 
              />
            )}

            {/* Completed Analysis Dashboard */}
            {analysisResult && !isAnalyzing && (
              <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
                {/* Result Top Action Bar */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-blue-50/60 card-motion">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600 border border-blue-700 flex items-center justify-center font-mono font-extrabold text-white shrink-0 shadow-xs">
                      WA
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                          {analysisResult.domain}
                        </h2>
                        <a 
                          href={analysisResult.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-slate-900 transition shrink-0"
                          title="Open website"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <p className="text-xs text-slate-500 font-mono truncate">
                        {analysisResult.url}
                      </p>
                    </div>
                  </div>

                  {/* Export Buttons */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
                    <a
                      href={getExcelDownloadUrl(currentAnalysisId)}
                      download
                      className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm border border-blue-700 transition active:scale-95 btn-motion"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-white" />
                      <span>Excel (.xlsx)</span>
                    </a>

                    <a
                      href={getPdfDownloadUrl(currentAnalysisId)}
                      download
                      className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-rose-900 bg-rose-100 hover:bg-rose-200 shadow-sm border border-rose-300 transition active:scale-95 btn-motion"
                    >
                      <FileText className="w-4 h-4 text-rose-700" />
                      <span>PDF Dossier</span>
                    </a>

                    <a
                      href={getJsonDownloadUrl(currentAnalysisId)}
                      download
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 transition btn-motion"
                      title="Export Full JSON"
                    >
                      <FileCode className="w-3.5 h-3.5 text-blue-700" />
                      <span>JSON</span>
                    </a>

                    <a
                      href={getCsvDownloadUrl(currentAnalysisId)}
                      download
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 transition btn-motion"
                      title="Export Pages CSV"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-700" />
                      <span>CSV</span>
                    </a>
                  </div>
                </div>

                {/* Navigation Tabs Bar with Phone Touch Scrolling */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200 -mx-3 px-3 sm:mx-0 sm:px-0 scroll-smooth touch-pan-x">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition shrink-0 touch-manipulation btn-motion ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="whitespace-nowrap">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content Display */}
                <div className="pt-2">
                  {activeTab === 'overview' && <OverviewTab data={analysisResult} />}
                  {activeTab === 'sitemap' && <VisualSitemapTab visualSitemap={analysisResult.visual_sitemap} domain={analysisResult.domain} />}
                  {activeTab === 'features' && <FeaturesTab features={analysisResult.features} />}
                  {activeTab === 'pages' && <PagesTab pages={analysisResult.pages} />}
                  {activeTab === 'seo' && <SeoTab seo={analysisResult.seo} />}
                  {activeTab === 'security' && <SecurityTab technical={analysisResult.technical} url={analysisResult.url} />}
                  {activeTab === 'technical' && <TechnicalTab technical={analysisResult.technical} />}
                  {activeTab === 'performance' && <PerformanceTab performance={analysisResult.performance} />}
                  {activeTab === 'accessibility' && <AccessibilityTab accessibility={analysisResult.accessibility} />}
                  {activeTab === 'advantages_drawbacks' && <AdvantagesDrawbacksTab data={analysisResult.advantages_drawbacks} />}
                  {activeTab === 'ai_insights' && <AiInsightsTab ai={analysisResult.ai} />}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; 2026 WebIntel AI &bull; Global Business Discovery &amp; Intelligence</p>
          <div className="flex items-center gap-4 text-slate-400 font-medium">
            <span>Verified Sources</span>
            <span>&bull;</span>
            <span>OWASP Audits</span>
            <span>&bull;</span>
            <span>Automated Reports</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
