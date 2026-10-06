import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

const EXAMPLES = [
  'https://example.com',
  'https://python.org',
  'https://news.ycombinator.com'
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
      setError('Please enter a website URL.');
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
    <div className="relative py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-yellow-200/80 bg-gradient-to-b from-yellow-100/40 via-yellow-50/20 to-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-300/40 border border-yellow-400/60 text-yellow-950 text-xs font-bold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-yellow-700" />
          <span>Automated Web Crawler, SEO, Technical & Contact Audit</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Analyze Any Website
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Extract website information, features, contact details, SEO data, technical details and AI-powered insights from a publicly accessible website.
        </p>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5 p-2 rounded-2xl bg-white border-2 border-yellow-300 shadow-xl shadow-yellow-200/40 focus-within:border-yellow-500 focus-within:ring-4 focus-within:ring-yellow-400/20 transition">
            <div className="relative flex-1 flex items-center pl-3">
              <Search className="w-5 h-5 text-yellow-600 mr-2 shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                placeholder="https://example.com"
                disabled={isAnalyzing}
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-base focus:outline-none py-2 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">


              <button
                type="submit"
                disabled={isAnalyzing}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-extrabold text-slate-950 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] shadow-md shadow-yellow-400/40 transition disabled:opacity-60 border border-yellow-500"
              >
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Website'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-3 flex items-center justify-center gap-2 text-rose-600 text-sm font-semibold">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Crawl Settings Toggle */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-600 px-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> SSRF & robots.txt Protection
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="hidden sm:inline">Respects crawl limits & privacy</span>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-950 transition font-bold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Hide Crawl Controls' : 'Crawl Controls'}</span>
            </button>
          </div>

          {/* Crawl Controls Panel */}
          {showAdvanced && (
            <div className="mt-4 p-5 rounded-2xl bg-white border border-yellow-200 shadow-lg text-left grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Maximum Pages</label>
                <select
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  className="w-full bg-yellow-50/50 border border-yellow-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-yellow-500"
                >
                  <option value={10}>10 Pages (Quick Scan)</option>
                  <option value={25}>25 Pages (Recommended)</option>
                  <option value={50}>50 Pages (Deep Audit)</option>
                  <option value={100}>100 Pages (Comprehensive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Crawl Delay</label>
                <select
                  value={crawlDelay}
                  onChange={(e) => setCrawlDelay(Number(e.target.value))}
                  className="w-full bg-yellow-50/50 border border-yellow-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-yellow-500"
                >
                  <option value={0.1}>0.1s (Fast)</option>
                  <option value={0.2}>0.2s (Standard)</option>
                  <option value={0.5}>0.5s (Polite)</option>
                  <option value={1.0}>1.0s (Gentle)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">JavaScript Rendering</label>
                <select
                  value={jsRendering}
                  onChange={(e) => setJsRendering(e.target.value)}
                  className="w-full bg-yellow-50/50 border border-yellow-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-yellow-500"
                >
                  <option value="auto">Auto (Detect SPAs)</option>
                  <option value="static">Static Fast HTML</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sameDomain"
                  checked={sameDomainOnly}
                  onChange={(e) => setSameDomainOnly(e.target.checked)}
                  className="rounded border-yellow-300 text-yellow-500 focus:ring-yellow-400"
                />
                <label htmlFor="sameDomain" className="text-xs text-slate-800 font-semibold cursor-pointer">
                  Same-domain only (Default: ON)
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="externalLinks"
                  checked={followExternal}
                  onChange={(e) => setFollowExternal(e.target.checked)}
                  className="rounded border-yellow-300 text-yellow-500 focus:ring-yellow-400"
                />
                <label htmlFor="externalLinks" className="text-xs text-slate-800 font-semibold cursor-pointer">
                  Follow external links (Default: OFF)
                </label>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
