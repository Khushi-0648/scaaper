import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Globe, ChevronDown, ChevronUp } from 'lucide-react';

const EXAMPLES = [
  'https://example.com',
  'https://python.org',
  'https://stripe.com'
];

export default function HeroSection({ onStartAnalyze, isAnalyzing }) {
  const [url, setUrl] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');

  // Crawl options
  const [maxPages, setMaxPages] = useState(25);
  const [crawlDelay, setCrawlDelay] = useState(0.2);
  const [sameDomainOnly, setSameDomainOnly] = useState(true);
  const [followExternal, setFollowExternal] = useState(false);
  const [jsRendering, setJsRendering] = useState('auto');

  const handleExample = () => {
    const nextUrl = EXAMPLES[exampleIndex % EXAMPLES.length];
    setUrl(nextUrl);
    setExampleIndex(exampleIndex + 1);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('Please enter a valid website URL.');
      return;
    }
    onStartAnalyze({
      url: cleanUrl,
      max_pages: Number(maxPages),
      crawl_delay: Number(crawlDelay),
      same_domain_only: Boolean(sameDomainOnly),
      follow_external: Boolean(followExternal),
      js_rendering: jsRendering
    });
  };

  return (
    <div className="py-8 sm:py-14 px-3 sm:px-6 lg:px-8 border-b border-slate-200 bg-white">
      <div className="max-w-3xl mx-auto text-center space-y-3.5">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-xs animate-fade-in-up">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse-subtle" />
          <span>Deep 10-Agent Digital Intelligence</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Analyze Any Public Website
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Audit SEO, performance speed, passive security headers, accessibility, and tech stack in seconds.
        </p>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="pt-2 max-w-2xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-300 shadow-xs hover:border-slate-300">
            <div className="flex-1 flex items-center px-3 gap-2.5 min-w-0 py-1">
              <Globe className="w-4 h-4 text-blue-600 shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                placeholder="https://example.com"
                disabled={isAnalyzing}
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none py-1.5 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
              <button
                type="button"
                onClick={handleExample}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl btn-motion transition text-center"
              >
                Sample
              </button>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="flex-2 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-blue-600/30 btn-motion transition flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Auditing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze URL</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-rose-600 text-xs font-semibold animate-in fade-in duration-200">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Sub-controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 px-2 pt-1 gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Passive &amp; robots.txt compliant &bull; Non-destructive scan</span>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-slate-600 hover:text-blue-600 font-semibold transition flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Hide Advanced Options' : 'Advanced Crawl Options'}</span>
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Advanced Crawl Drawer */}
          {showAdvanced && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Max Pages Crawled</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={maxPages}
                    onChange={(e) => setMaxPages(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Crawl Delay (seconds)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={crawlDelay}
                    onChange={(e) => setCrawlDelay(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">JS Rendering</label>
                  <select
                    value={jsRendering}
                    onChange={(e) => setJsRendering(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900"
                  >
                    <option value="auto">Auto (Detect SPA)</option>
                    <option value="always">Always Render JS</option>
                    <option value="never">Static HTML Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
