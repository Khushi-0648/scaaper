import React, { useState } from 'react';
import { Loader2, CheckCircle2, Circle, ChevronDown, ChevronUp, Terminal } from 'lucide-react';

const STAGES = [
  { label: 'URL validated', threshold: 10 },
  { label: 'Website connected', threshold: 20 },
  { label: 'Crawling pages', threshold: 50 },
  { label: 'Extracting content', threshold: 65 },
  { label: 'Detecting features', threshold: 65 },
  { label: 'Detecting broken links', threshold: 68 },
  { label: 'Extracting contact details', threshold: 70 },
  { label: 'Analyzing SEO', threshold: 75 },
  { label: 'Checking technical information', threshold: 82 },
  { label: 'Performance & Accessibility', threshold: 88 },
  { label: 'Evaluating advantages & drawbacks', threshold: 92 },
  { label: 'Generating insights & report', threshold: 96 },
];

export default function ProgressView({ statusData, targetUrl }) {
  const [showLogs, setShowLogs] = useState(false);
  const percent = statusData?.progress_percent || 5;
  const currentStep = statusData?.current_step || 'Initializing crawl...';
  const logs = statusData?.step_logs || [];

  return (
    <div className="max-w-3xl mx-auto my-12 px-4 animate-in fade-in duration-300">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-yellow-300 shadow-xl shadow-yellow-100/60">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-extrabold text-yellow-800 uppercase tracking-wider bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-300">
              Analysis in Progress
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate max-w-lg mt-1">{targetUrl}</h2>
          </div>
          <div className="text-right">
            <span className="text-3xl sm:text-4xl font-extrabold text-yellow-500 font-mono drop-shadow-xs">{percent}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-yellow-100 h-3 rounded-full overflow-hidden mb-8 border border-yellow-200">
          <div
            className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 h-full rounded-full transition-all duration-500 ease-out shadow-xs"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {STAGES.map((stg, i) => {
            const isDone = percent >= stg.threshold;
            const isCurrent = !isDone && (i === 0 || percent >= STAGES[i - 1].threshold);

            return (
              <div
                key={stg.label}
                className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                  isDone
                    ? 'bg-yellow-50/60 border-yellow-300 text-slate-900 font-semibold'
                    : isCurrent
                    ? 'bg-yellow-100/90 border-yellow-400 text-yellow-950 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-400 font-medium'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-yellow-600 animate-spin shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span className="text-sm">{stg.label}</span>
              </div>
            );
          })}
        </div>

        {/* Current Activity Ticker */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-yellow-50/50 border border-yellow-200 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <Loader2 className="w-3.5 h-3.5 text-yellow-600 animate-spin shrink-0" />
            <span className="text-slate-700 font-mono font-medium truncate">{currentStep}</span>
          </div>
          {logs.length > 0 && (
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="flex items-center gap-1 text-slate-700 hover:text-slate-950 shrink-0 pl-2 font-bold"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{showLogs ? 'Hide Log' : 'View Log'}</span>
              {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Live Logs Drawer */}
        {showLogs && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 max-h-48 overflow-y-auto font-mono text-[11px] text-yellow-300 space-y-1 shadow-inner">
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-slate-500 shrink-0">[{idx + 1}]</span>
                <span className="text-slate-200">{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
