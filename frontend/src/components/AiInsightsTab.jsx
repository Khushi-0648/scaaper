import React from 'react';
import { Sparkles, Brain, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

export default function AiInsightsTab({ ai = {} }) {
  const summary = ai.summary || 'No summary available.';
  const strengths = ai.strengths || [];
  const weaknesses = ai.potential_weaknesses || [];
  const uxObs = ai.ux_observations || [];
  const seoObs = ai.seo_observations || [];
  const a11yObs = ai.accessibility_observations || [];
  const recs = ai.recommendations || [];
  const conclusion = ai.overall_conclusion || '';
  const provider = ai.provider || 'Deterministic AI Engine';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center shrink-0 border border-blue-200">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">AI-Powered Synthesis</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                {provider}
              </span>
            </div>
            <p className="text-xs text-slate-900/80 font-medium">
              Grounded exclusively on scraped crawl evidence following strict data separation principles.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
        <span className="text-[10px] uppercase font-extrabold text-blue-900 tracking-wider bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          Executive Overview
        </span>
        <p className="text-sm text-slate-800 leading-relaxed font-medium">{summary}</p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Key Architectural Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-50/50 p-3 rounded-xl border border-slate-200/80 font-medium">
                <span className="text-emerald-600 font-bold shrink-0">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Potential Weaknesses */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            <span>Observed Bottlenecks & Weaknesses</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-50/50 p-3 rounded-xl border border-slate-200/80 font-medium">
                <span className="text-blue-600 font-bold shrink-0">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Observations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full inline-block border border-blue-200">
            User Experience (UX)
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {uxObs.map((obs, idx) => (
              <li key={idx} className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-200/80 font-medium">• {obs}</li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full inline-block border border-blue-200">
            SEO Visibility
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {seoObs.map((obs, idx) => (
              <li key={idx} className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-200/80 font-medium">• {obs}</li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full inline-block border border-blue-200">
            Accessibility (a11y)
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {a11yObs.map((obs, idx) => (
              <li key={idx} className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-200/80 font-medium">• {obs}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Prioritized Recommendations */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <h4 className="text-base font-extrabold text-slate-900">Prioritized Improvement Action Plan</h4>
        </div>

        <div className="space-y-3">
          {recs.map((r, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-xl bg-slate-50/40 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    r.priority === 'High' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                    r.priority === 'Medium' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    {r.priority} Priority
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-slate-900 font-bold uppercase">
                    {r.category}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-slate-900 mb-0.5">{r.recommendation}</h5>
                <p className="text-xs text-slate-600">{r.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conclusion */}
      {conclusion && (
        <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200 text-xs text-slate-700 leading-relaxed italic font-medium">
          "{conclusion}"
        </div>
      )}
    </div>
  );
}
