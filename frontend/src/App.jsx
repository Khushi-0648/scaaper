import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
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
import HistoryView from './components/HistoryView';
import DocsView from './components/DocsView';
import SettingsView from './components/SettingsView';

import { 
  startAnalysis, 
  getAnalysisStatus, 
  getAnalysisResults, 
  getExcelDownloadUrl, 
  getJsonDownloadUrl, 
  getCsvDownloadUrl, 
  getHistory, 
  deleteHistory 
} from './services/api';

import { 
  FileSpreadsheet, 
  FileCode, 
  FileText, 
  AlertCircle, 
  ExternalLink,
  Layers,
  BarChart3,
  Search,
  Cpu,
  Gauge,
  Eye,
  CheckCircle2,
  Brain
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview & Contacts', icon: BarChart3 },
  { id: 'features', label: 'Features (30+)', icon: Layers },
  { id: 'pages', label: 'Pages Table', icon: FileText },
  { id: 'seo', label: 'SEO Audit', icon: Search },
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

  const [history, setHistory] = useState([]);
  const pollTimerRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    loadHistoryList();
  }, []);

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

    try {
      const res = await startAnalysis(crawlPayload);
      setCurrentAnalysisId(res.id);
      startPolling(res.id);
    } catch (err) {
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Failed to start analysis.');
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

  // Open existing analysis from history
  const handleSelectHistoryAnalysis = async (id) => {
    try {
      const full = await getAnalysisResults(id);
      setAnalysisResult(full);
      setCurrentAnalysisId(id);
      setTargetUrl(full.url);
      setActiveView('dashboard');
      setActiveTab('overview');
    } catch (err) {
      alert('Failed to load historic analysis: ' + err.message);
    }
  };

  // Delete analysis
  const handleDeleteAnalysis = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis record and Excel report?')) return;
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
    <div className="min-h-screen flex flex-col bg-yellow-50/15 text-slate-900 selection:bg-yellow-300 selection:text-slate-950">
      {/* Navigation Header */}
      <Header 
        activeView={activeView} 
        setActiveView={setActiveView} 
        historyCount={history.length} 
      />

      {/* Main Views */}
      <main className="flex-1 pb-16">
        {activeView === 'history' && (
          <HistoryView
            history={history}
            onSelectAnalysis={handleSelectHistoryAnalysis}
            onDeleteAnalysis={handleDeleteAnalysis}
          />
        )}

        {activeView === 'docs' && <DocsView />}

        {activeView === 'settings' && <SettingsView />}

        {activeView === 'dashboard' && (
          <>
            {/* Hero & Input Section */}
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
              <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
                {/* Result Top Action Bar */}
                <div className="p-5 rounded-3xl bg-white border-2 border-yellow-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-yellow-100/60">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-yellow-400 border border-yellow-500 flex items-center justify-center font-mono font-extrabold text-slate-950 shrink-0 shadow-xs">
                      WA
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-slate-900 truncate max-w-sm sm:max-w-md">
                          {analysisResult.domain}
                        </h2>
                        <a 
                          href={analysisResult.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-yellow-700 hover:text-slate-950 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <p className="text-xs text-slate-500 font-mono truncate max-w-sm">
                        {analysisResult.url}
                      </p>
                    </div>
                  </div>

                  {/* Export Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={getExcelDownloadUrl(currentAnalysisId)}
                      download
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-950 bg-yellow-400 hover:bg-yellow-300 shadow-md shadow-yellow-400/40 border border-yellow-500 transition active:scale-95"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-slate-950" />
                      <span>Download Excel Report (.xlsx)</span>
                    </a>

                    <a
                      href={getJsonDownloadUrl(currentAnalysisId)}
                      download
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 transition"
                      title="Export Full JSON"
                    >
                      <FileCode className="w-3.5 h-3.5 text-yellow-700" />
                      <span className="hidden sm:inline">JSON</span>
                    </a>

                    <a
                      href={getCsvDownloadUrl(currentAnalysisId)}
                      download
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 transition"
                      title="Export Pages CSV"
                    >
                      <FileText className="w-3.5 h-3.5 text-yellow-700" />
                      <span className="hidden sm:inline">CSV</span>
                    </a>
                  </div>
                </div>

                {/* Navigation Tabs Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-yellow-200">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl text-xs font-bold transition shrink-0 border-b-2 ${
                          isActive
                            ? 'bg-yellow-400 text-slate-950 border-yellow-600 shadow-xs'
                            : 'text-slate-600 hover:text-slate-950 hover:bg-yellow-100/60 border-transparent'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content Display */}
                <div className="pt-2">
                  {activeTab === 'overview' && <OverviewTab data={analysisResult} />}
                  {activeTab === 'features' && <FeaturesTab features={analysisResult.features} />}
                  {activeTab === 'pages' && <PagesTab pages={analysisResult.pages} />}
                  {activeTab === 'seo' && <SeoTab seo={analysisResult.seo} />}
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
      <footer className="border-t border-yellow-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Website Analyzer — Lemon Yellow & White Edition. Professional Web Crawler & Audit Tool.</p>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <span>FastAPI + Python</span>
            <span>•</span>
            <span>React + Vite</span>
            <span>•</span>
            <span>openpyxl Excel Export</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
