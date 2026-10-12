import React, { useState } from 'react';
import { 
  Bot, 
  Search, 
  Gauge, 
  Eye, 
  ShieldCheck, 
  Cpu, 
  Layout, 
  FileText, 
  CheckSquare, 
  ThumbsUp, 
  AlertTriangle, 
  Sparkles,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';

const AGENT_META = [
  { id: 'master', name: 'Master AI Agent', icon: Sparkles, color: 'text-blue-500 bg-blue-100' },
  { id: 'seo', name: 'SEO Agent', icon: Search, color: 'text-blue-500 bg-blue-100' },
  { id: 'perf', name: 'Performance Agent', icon: Gauge, color: 'text-emerald-500 bg-emerald-100' },
  { id: 'a11y', name: 'Accessibility Agent', icon: Eye, color: 'text-purple-500 bg-purple-100' },
  { id: 'sec', name: 'Security Agent', icon: ShieldCheck, color: 'text-rose-500 bg-rose-100' },
  { id: 'tech', name: 'Technology Agent', icon: Cpu, color: 'text-cyan-500 bg-cyan-100' },
  { id: 'ux', name: 'UX Agent', icon: Layout, color: 'text-indigo-500 bg-indigo-100' },
  { id: 'content', name: 'Content Agent', icon: FileText, color: 'text-orange-500 bg-orange-100' },
  { id: 'gap', name: 'Feature Gap Agent', icon: CheckSquare, color: 'text-pink-500 bg-pink-100' },
  { id: 'adv', name: 'Advantage Agent', icon: ThumbsUp, color: 'text-teal-500 bg-teal-100' },
  { id: 'draw', name: 'Issue/Drawback Agent', icon: AlertTriangle, color: 'text-red-500 bg-red-100' },
];

export default function AiAgentsView({ currentAnalysis }) {
  const [selectedAgentName, setSelectedAgentName] = useState('Master AI Agent');

  const specialists = currentAnalysis?.agents?.specialists || [];
  const master = currentAnalysis?.agents?.master || null;

  // Selected agent object
  const activeAgent = selectedAgentName === 'Master AI Agent'
    ? null
    : specialists.find(s => s.name === selectedAgentName) || specialists[0];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Specialist Agents
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ten dedicated specialist agents analyze SEO, speed, security, accessibility, and tech stacks.
        </p>
      </div>

      {/* Target Domain Badge */}
      {currentAnalysis && (
        <div className="p-4 rounded-2xl bg-white border border-blue-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Currently Audited Target:</span>
            <span className="text-sm font-black text-slate-950">{currentAnalysis.domain}</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-xl bg-blue-600 text-white font-bold border border-blue-600">
            Overall Health: {currentAnalysis.health_scores?.overall || 80}/100
          </span>
        </div>
      )}

      {/* Agent Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth touch-pan-x">
        {AGENT_META.map((meta) => {
          const Icon = meta.icon;
          const isSelected = selectedAgentName === meta.name;
          return (
            <button
              key={meta.id}
              onClick={() => setSelectedAgentName(meta.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap border touch-manipulation ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 shadow-xs'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{meta.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Agent Details */}
      {selectedAgentName === 'Master AI Agent' ? (
        /* MASTER AI AGENT VIEW */
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-blue-200 shadow-xl shadow-blue-50/50 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 border border-blue-700 flex items-center justify-center font-black text-white shadow-xs">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-950">Master AI Agent</h2>
                  <p className="text-xs text-slate-500 font-medium">Executive Intelligence & Strategic Synthesis Engine</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-slate-950">
                  {master?.overall_health_score || currentAnalysis?.health_scores?.overall || 78}/100
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Overall Health Score</div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200 space-y-2">
              <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-blue-600" />
                Executive Briefing
              </div>
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {master?.executive_summary || (
                  "The Master AI Agent receives raw telemetry and analyzed audit trees from all 10 specialized intelligence agents. It correlates foundational SEO, response performance, accessibility compliance, and passive security headers into an authoritative executive intelligence assessment."
                )}
              </p>
            </div>

            {/* Priority Actions Breakdown */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-slate-950">Prioritized Interventions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* High Priority */}
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px] uppercase">
                    High Priority
                  </span>
                  <div className="text-xs text-slate-700 space-y-1.5 mt-2">
                    {master?.priority_actions?.HIGH_PRIORITY?.length > 0 ? (
                      master.priority_actions.HIGH_PRIORITY.map((r, i) => (
                        <div key={i} className="font-bold text-rose-950">&bull; {r.action}</div>
                      ))
                    ) : (
                      <div className="text-rose-900 font-bold">&bull; Remediate uncompressed asset streams and missing title/meta descriptions</div>
                    )}
                  </div>
                </div>

                {/* Medium Priority */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-slate-200 space-y-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-500 text-slate-950 font-black text-[10px] uppercase">
                    Medium Priority
                  </span>
                  <div className="text-xs text-slate-700 space-y-1.5 mt-2">
                    {master?.priority_actions?.MEDIUM_PRIORITY?.length > 0 ? (
                      master.priority_actions.MEDIUM_PRIORITY.map((r, i) => (
                        <div key={i} className="font-bold text-slate-900">&bull; {r.action}</div>
                      ))
                    ) : (
                      <div className="text-slate-900 font-bold">&bull; Deploy HSTS and X-Frame-Options security headers; provide descriptive image ALT text</div>
                    )}
                  </div>
                </div>

                {/* Low Priority */}
                <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-500 text-slate-950 font-black text-[10px] uppercase border border-blue-500">
                    Low Priority
                  </span>
                  <div className="text-xs text-slate-700 space-y-1.5 mt-2">
                    {master?.priority_actions?.LOW_PRIORITY?.length > 0 ? (
                      master.priority_actions.LOW_PRIORITY.map((r, i) => (
                        <div key={i} className="font-bold text-slate-800">&bull; {r.action}</div>
                      ))
                    ) : (
                      <div className="text-slate-800 font-bold">&bull; Update frontend framework packages to latest LTS releases and refine layout CTA buttons</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeAgent ? (
        /* SPECIALIST AGENT VIEW */
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-blue-200 shadow-xl shadow-blue-50/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-950">{activeAgent.name}</h2>
              <p className="text-xs text-slate-500 font-medium">{activeAgent.role}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-950">{activeAgent.score}/100</span>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Agent Score</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
            {activeAgent.summary}
          </div>

          {/* Three-Tier Grounded Methodology Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Observed Evidence */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>1. Observed Evidence</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-2">
                {activeAgent.observed_evidence?.map((ev, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">&bull;</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Technical Analysis */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-blue-600" />
                <span>2. Technical Analysis</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-2">
                {activeAgent.analysis?.map((an, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">&bull;</span>
                    <span>{an}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. AI Inference */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-purple-600" />
                <span>3. AI Inference</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-2">
                {activeAgent.ai_inference?.map((inf, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-purple-600 font-bold">&bull;</span>
                    <span>{inf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          {activeAgent.recommendations?.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Agent Recommendations
              </h3>
              <div className="space-y-2">
                {activeAgent.recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50/60 border border-slate-200 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-950">{rec.action}</div>
                      <div className="text-slate-500 mt-0.5">{rec.impact}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
                      rec.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-slate-900'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
          <Bot className="w-8 h-8 text-blue-500 mx-auto" />
          <h3 className="font-extrabold text-slate-900 text-base">Select an agent above to view findings</h3>
        </div>
      )}
    </div>
  );
}
