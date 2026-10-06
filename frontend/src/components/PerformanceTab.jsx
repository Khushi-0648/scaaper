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
      <div className="p-6 rounded-3xl bg-white border border-yellow-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 rounded-full bg-yellow-50 border-4 border-amber-400 flex flex-col items-center justify-center shrink-0 shadow-md shadow-yellow-200/50">
            <span className="text-3xl font-extrabold text-slate-950 font-mono">{score}</span>
            <span className="text-[10px] text-amber-800 font-bold uppercase">out of 100</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                Web Speed & Efficiency
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Grade {grade}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">Performance Score: {score}/100</h3>
            <p className="text-xs text-slate-600 max-w-lg">
              Evaluates response latency (TTFB), initial HTML payload weight, asset compression, render-blocking scripts in &lt;head&gt;, and caching policy.
            </p>
          </div>
        </div>

        {/* Quick Numbers */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center px-4 py-2.5 rounded-2xl bg-yellow-50 border border-yellow-200">
            <div className="text-xl font-extrabold text-slate-950 font-mono">{loadTime} <span className="text-xs text-slate-500 font-normal">ms</span></div>
            <div className="text-[10px] text-slate-600 uppercase font-bold">Response Time</div>
          </div>
          <div className="text-center px-4 py-2.5 rounded-2xl bg-yellow-50 border border-yellow-200">
            <div className="text-xl font-extrabold text-slate-950 font-mono">{pageSize} <span className="text-xs text-slate-500 font-normal">KB</span></div>
            <div className="text-[10px] text-slate-600 uppercase font-bold">HTML Size</div>
          </div>
        </div>
      </div>

      {/* Asset Breakdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-yellow-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">JavaScript Tags</span>
          <span className="text-2xl font-extrabold text-slate-950 font-mono">{metrics.scripts_count || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-1">({metrics.external_scripts || 0} external)</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-yellow-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Stylesheets (CSS)</span>
          <span className="text-2xl font-extrabold text-slate-950 font-mono">{metrics.stylesheets_count || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Linked styles</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-yellow-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Image Tags</span>
          <span className="text-2xl font-extrabold text-slate-950 font-mono">{metrics.images_count || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Discovered images</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-yellow-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Render-Blocking</span>
          <span className="text-2xl font-extrabold text-amber-600 font-mono">{metrics.render_blocking_scripts || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Sync head scripts</span>
        </div>
      </div>

      {/* Potential Performance Issues */}
      <div className="p-6 rounded-2xl bg-white border border-yellow-200 shadow-sm">
        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">Performance Audit Indicators</h4>

        <div className="space-y-3">
          {issues.map((iss, idx) => {
            const isGood = iss.status === 'Good';
            return (
              <div 
                key={idx}
                className="p-3.5 rounded-xl bg-yellow-50/40 border border-yellow-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  {isGood ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-slate-900">{iss.metric}</span>
                      <span className="text-xs text-slate-500 font-mono font-medium">({iss.value})</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                        isGood ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
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
                    'bg-amber-100 text-amber-800 border border-amber-300'
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
