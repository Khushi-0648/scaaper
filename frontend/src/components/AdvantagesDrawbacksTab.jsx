import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, XCircle } from 'lucide-react';

export default function AdvantagesDrawbacksTab({ data = {} }) {
  const advantages = data.advantages || [];
  const drawbacks = data.drawbacks || [];
  const missingFeatures = data.missing_features || [];

  return (
    <div className="space-y-8">
      {/* 1. Verified Advantages */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
          <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
            Verified Architectural Advantages ({advantages.length})
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          Positive technical and structural characteristics verified by observable crawl evidence.
        </p>

        {advantages.length === 0 ? (
          <p className="text-sm text-slate-500 p-4 bg-white rounded-2xl border border-yellow-200">No positive signals detected.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {advantages.map((adv, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <h4 className="text-sm font-extrabold text-slate-900">{adv.advantage}</h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                      {adv.confidence} Confidence
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100 leading-relaxed mb-2 font-medium">
                    <span className="text-emerald-900 font-bold block text-[10px] uppercase mb-0.5">Evidence:</span>
                    {adv.evidence}
                  </p>
                </div>

                {adv.page && (
                  <div className="text-[11px] text-slate-500 truncate pt-1">
                    Observed on: <span className="text-slate-800 font-mono font-medium">{adv.page}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Potential Drawbacks & Issues */}
      <div className="space-y-4 pt-4 border-t border-yellow-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-100" />
          <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
            Drawbacks & Potential Issues ({drawbacks.length})
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          Strictly classifies observable issues into Confirmed Issues or Potential Issues based on concrete crawl evidence.
        </p>

        {drawbacks.length === 0 ? (
          <p className="text-sm text-slate-500 p-4 bg-white rounded-2xl border border-yellow-200">No defects or bottlenecks detected.</p>
        ) : (
          <div className="space-y-3">
            {drawbacks.map((drw, idx) => {
              const isConfirmed = drw.classification === 'Confirmed Issue';
              return (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-yellow-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    {isConfirmed ? (
                      <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-extrabold text-slate-900">{drw.issue}</h4>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isConfirmed 
                            ? 'bg-rose-100 text-rose-800 border-rose-300' 
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {drw.classification}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">
                          {drw.severity} Severity
                        </span>
                      </div>

                      <p className="text-xs text-slate-800 font-mono bg-yellow-50/60 px-3 py-2 rounded-xl border border-yellow-200 mb-1.5 font-medium">
                        <span className="text-yellow-900 block text-[10px] uppercase font-bold">Evidence:</span>
                        {drw.evidence}
                      </p>

                      {drw.recommendation && (
                        <p className="text-xs text-yellow-950 font-medium">
                          Recommendation: {drw.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Potentially Missing Features Checklist */}
      <div className="space-y-4 pt-4 border-t border-yellow-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500 ring-4 ring-yellow-200" />
          <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
            Potentially Missing Features Checklist
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          Comparing discovered capabilities against common feature baselines. Notice: "Not detected during the crawl" does not imply a defect.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {missingFeatures.map((mf, idx) => {
            const isDetected = mf.status === 'Detected';
            return (
              <div 
                key={idx}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDetected 
                    ? 'bg-white border-yellow-300 shadow-xs' 
                    : 'bg-white/60 border-slate-200'
                }`}
              >
                <div>
                  <h5 className="text-xs font-extrabold text-slate-900">{mf.feature}</h5>
                  <span className="text-[10px] text-slate-500 font-medium">{mf.note}</span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  isDetected
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-300'
                }`}>
                  {isDetected ? '✓ Detected' : '✗ Not detected'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
