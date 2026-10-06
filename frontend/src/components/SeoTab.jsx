import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Share2, Twitter, Info } from 'lucide-react';

export default function SeoTab({ seo = {} }) {
  const score = seo.score || 0;
  const grade = seo.grade || 'N/A';
  const checks = seo.checks || [];
  const og = seo.open_graph || {};
  const twitter = seo.twitter_card || {};

  const passed = checks.filter(c => c.status === 'Passed').length;
  const warnings = checks.filter(c => c.status === 'Warning').length;
  const failed = checks.filter(c => c.status === 'Failed').length;

  return (
    <div className="space-y-6">
      {/* Top SEO Score Card */}
      <div className="p-6 rounded-3xl bg-white border border-yellow-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Circular Score Badge */}
          <div className="relative w-24 h-24 rounded-full bg-yellow-50 border-4 border-yellow-400 flex flex-col items-center justify-center shrink-0 shadow-md shadow-yellow-200/50">
            <span className="text-3xl font-extrabold text-slate-950 font-mono">{score}</span>
            <span className="text-[10px] text-yellow-800 font-bold uppercase">out of 100</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-yellow-800 uppercase tracking-wider bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-300">
                Search Engine Optimization
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                score >= 80 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                score >= 60 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                Grade {grade}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">Overall SEO Health Score: {score}/100</h3>
            <p className="text-xs text-slate-600 max-w-lg">
              Evaluated based on HTML semantics, title/meta lengths, headings hierarchy, canonical URLs, sitemaps, robots.txt, and social graph previews.
            </p>
          </div>
        </div>

        {/* Quick check pill summary */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center px-4 py-2.5 rounded-2xl bg-yellow-50 border border-yellow-200">
            <div className="text-xl font-extrabold text-emerald-700 font-mono">{passed}</div>
            <div className="text-[10px] text-slate-600 uppercase font-bold">Passed</div>
          </div>
          <div className="text-center px-4 py-2.5 rounded-2xl bg-yellow-50 border border-yellow-200">
            <div className="text-xl font-extrabold text-amber-700 font-mono">{warnings}</div>
            <div className="text-[10px] text-slate-600 uppercase font-bold">Warnings</div>
          </div>
          <div className="text-center px-4 py-2.5 rounded-2xl bg-yellow-50 border border-yellow-200">
            <div className="text-xl font-extrabold text-rose-700 font-mono">{failed}</div>
            <div className="text-[10px] text-slate-600 uppercase font-bold">Failed</div>
          </div>
        </div>
      </div>

      {/* Social Graph Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Open Graph Card */}
        <div className="p-5 rounded-2xl bg-white border border-yellow-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-sm font-extrabold text-slate-900">
            <Share2 className="w-4 h-4 text-yellow-600" />
            <span>Open Graph Preview (Facebook / LinkedIn)</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="bg-yellow-50/60 p-2.5 rounded-xl border border-yellow-200/80">
              <span className="text-yellow-800 block text-[10px] uppercase font-bold">og:title</span>
              <span className="text-slate-900 font-medium">{og.title || <em className="text-slate-400">Not configured</em>}</span>
            </div>
            <div className="bg-yellow-50/60 p-2.5 rounded-xl border border-yellow-200/80">
              <span className="text-yellow-800 block text-[10px] uppercase font-bold">og:description</span>
              <span className="text-slate-900 font-medium line-clamp-2">{og.description || <em className="text-slate-400">Not configured</em>}</span>
            </div>
          </div>
        </div>

        {/* Twitter Card */}
        <div className="p-5 rounded-2xl bg-white border border-yellow-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-sm font-extrabold text-slate-900">
            <Twitter className="w-4 h-4 text-sky-600" />
            <span>Twitter/X Card Metadata</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="bg-yellow-50/60 p-2.5 rounded-xl border border-yellow-200/80">
              <span className="text-yellow-800 block text-[10px] uppercase font-bold">twitter:card</span>
              <span className="text-slate-900 font-medium">{twitter.card || <em className="text-slate-400">Not configured</em>}</span>
            </div>
            <div className="bg-yellow-50/60 p-2.5 rounded-xl border border-yellow-200/80">
              <span className="text-yellow-800 block text-[10px] uppercase font-bold">twitter:title</span>
              <span className="text-slate-900 font-medium">{twitter.title || <em className="text-slate-400">Not configured</em>}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Checks Checklist */}
      <div className="p-6 rounded-2xl bg-white border border-yellow-200 shadow-sm space-y-3">
        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">Itemized SEO Audit Checklist</h4>
        
        <div className="space-y-2.5">
          {checks.map((chk, idx) => {
            const isPass = chk.status === 'Passed';
            const isWarn = chk.status === 'Warning';
            return (
              <div 
                key={idx}
                className="p-3.5 rounded-xl bg-yellow-50/40 border border-yellow-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  {isPass ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : isWarn ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-slate-900">{chk.check}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                        isPass ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        isWarn ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {chk.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">{chk.details}</p>
                    {chk.recommendation && (
                      <p className="text-[11px] text-yellow-900 flex items-center gap-1 font-medium">
                        <Info className="w-3 h-3 text-yellow-600 shrink-0" />
                        <span>Recommendation: {chk.recommendation}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    chk.severity === 'High' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                    chk.severity === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                    'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    {chk.severity} Severity
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
