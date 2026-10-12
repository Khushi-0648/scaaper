import React from 'react';
import { Eye, AlertOctagon, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function AccessibilityTab({ accessibility = {} }) {
  const score = accessibility.score || 0;
  const grade = accessibility.grade || 'N/A';
  const issues = accessibility.issues || [];
  const stats = accessibility.stats || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 w-full">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-50 border-4 border-blue-600 flex flex-col items-center justify-center shrink-0 shadow-md shadow-blue-100/50">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono">{score}</span>
            <span className="text-[9px] sm:text-[10px] text-blue-900 font-bold uppercase">out of 100</span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Web Accessibility (a11y)
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-800 border border-blue-200">
                Grade {grade}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Accessibility Audit: {score}/100</h3>
            <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
              Evaluates WCAG baselines: missing image ALT tags, document language declarations, form inputs without labels, empty buttons, and heading outline hierarchy.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 text-center w-full md:w-auto shrink-0">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-base font-extrabold text-slate-900 font-mono">{stats.total_images || 0}</div>
            <div className="text-[10px] text-slate-600 font-semibold">Images Audited</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className={`text-base font-extrabold font-mono ${stats.missing_alt > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {stats.missing_alt || 0}
            </div>
            <div className="text-[10px] text-slate-600 font-semibold">Missing Alt</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className={`text-base font-extrabold font-mono ${stats.unlabeled_inputs > 0 ? 'text-blue-700' : 'text-emerald-700'}`}>
              {stats.unlabeled_inputs || 0}
            </div>
            <div className="text-[10px] text-slate-600 font-semibold">Unlabeled Inputs</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className={`text-base font-extrabold font-mono ${stats.empty_buttons > 0 ? 'text-blue-700' : 'text-emerald-700'}`}>
              {stats.empty_buttons || 0}
            </div>
            <div className="text-[10px] text-slate-600 font-semibold">Empty Buttons</div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Identified Accessibility Deficiencies</h4>
          <span className="text-xs text-slate-500 font-medium">{issues.length} issue(s) detected</span>
        </div>

        {issues.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50/50 border border-slate-200 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h5 className="text-sm font-bold text-slate-900">No Critical Accessibility Issues Detected</h5>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
              All scanned images have alternative descriptions, document language is configured, and interactive controls feature accessible labels.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((iss, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-slate-50/40 border border-slate-200/80 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {iss.severity === 'High' ? (
                      <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">{iss.issue}</h5>
                      <p className="text-xs text-slate-700 mt-0.5 font-mono bg-white px-2 py-1 rounded-lg border border-slate-200 inline-block font-medium">
                        Evidence: {iss.evidence}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase shrink-0 ${
                    iss.severity === 'High' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                    'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {iss.severity} Severity
                  </span>
                </div>

                <div className="text-xs text-slate-600 pl-7 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Recommendation: {iss.recommendation}</span>
                  </div>
                  {iss.affected_page && (
                    <div className="text-[11px] text-slate-500 truncate">
                      Affected URL: <span className="text-slate-700 font-mono font-medium">{iss.affected_page}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
