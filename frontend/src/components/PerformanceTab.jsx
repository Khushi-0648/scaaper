import React from 'react';
import { Gauge, Clock, HardDrive, FileCode, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PerformanceTab({ performance = {} }) {
  const score = performance.score || 0;
  const grade = performance.grade || 'N/A';
  const loadTime = performance.load_time_ms || 0;
  const pageSize = performance.page_size_kb || 0;
  const metrics = performance.metrics || {};
  const issues = performance.issues || [];

  return (
    <div className="space-y-6">
      {/* Top Score Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 w-full">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-50 border-4 border-blue-600 flex flex-col items-center justify-center shrink-0 shadow-md shadow-blue-100/50">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono">{score}</span>
            <span className="text-[9px] sm:text-[10px] text-blue-800 font-bold uppercase">out of 100</span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Web Speed & Efficiency
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Grade {grade}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Performance Score: {score}/100</h3>
            <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
              Evaluates response latency (TTFB), initial HTML payload weight, asset compression, render-blocking scripts in &lt;head&gt;, and caching policy.
            </p>
          </div>
        </div>

        {/* Quick Numbers */}
        <div className="grid grid-cols-2 sm:flex items-center gap-3 w-full md:w-auto shrink-0">
          <div className="text-center px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-lg sm:text-xl font-extrabold text-slate-950 font-mono">{loadTime} <span className="text-xs text-slate-500 font-normal">ms</span></div>
            <div className="text-[10px] text-slate-600 uppercase font-bold">Response Time</div>
          </div>
          <div className="text-center px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-lg sm:text-xl font-extrabold text-slate-950 font-mono">{pageSize} <span className="text-xs text-slate-500 font-normal">KB</span></div>
            <div className="text-[10px] text-slate-600 uppercase font-bold">HTML Size</div>
          </div>
        </div>
      </div>

      {/* Asset Breakdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">JavaScript Tags</span>
          <span className="text-2xl font-extrabold text-slate-950 font-mono">{metrics.scripts_count || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-1">({metrics.external_scripts || 0} external)</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Stylesheets (CSS)</span>
          <span className="text-2xl font-extrabold text-slate-950 font-mono">{metrics.stylesheets_count || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Linked styles</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Image Tags</span>
          <span className="text-2xl font-extrabold text-slate-950 font-mono">{metrics.images_count || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Discovered images</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Render-Blocking</span>
          <span className="text-2xl font-extrabold text-blue-600 font-mono">{metrics.render_blocking_scripts || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Sync head scripts</span>
        </div>
      </div>

      {/* Potential Performance Issues */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">Performance Audit Indicators</h4>

        <div className="space-y-3">
          {issues.map((iss, idx) => {
            const isGood = iss.status === 'Good';
            return (
              <div 
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50/40 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  {isGood ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-slate-900">{iss.metric}</span>
                      <span className="text-xs text-slate-500 font-mono font-medium">({iss.value})</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                        isGood ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {iss.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{iss.recommendation}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    iss.severity === 'Info' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    iss.severity === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {iss.severity}
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
