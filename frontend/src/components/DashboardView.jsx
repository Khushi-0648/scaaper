import React, { useEffect, useState } from 'react';
import { 
  Globe, 
  MapPin, 
  FileSpreadsheet, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  Activity,
  Layers,
  ExternalLink,
  ShieldCheck,
  Zap,
  Search
} from 'lucide-react';
import { getDashboardStats } from '../services/api';

export default function DashboardView({ onNavigate, onSelectAnalysis }) {
  const [stats, setStats] = useState({
    total_websites_analyzed: 0,
    total_businesses_found: 0,
    total_searches: 0,
    total_issues_detected: 0,
    average_website_score: 78,
    recent_analyses: [],
    recent_searches: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const coreActions = [
    {
      id: 'business',
      title: 'Find Businesses',
      description: 'Discover companies across global cities by category with phone, Gmail, and reviews.',
      icon: MapPin,
      badge: 'Discovery',
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      id: 'analyzer',
      title: 'Audit Website',
      description: 'Inspect SEO structure, loading speed, passive security headers, and tech stack.',
      icon: Search,
      badge: 'Deep Audit',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    },
    {
      id: 'reports',
      title: 'Excel Reports',
      description: 'Export all discovered businesses into clean single-sheet Excel files with contact & AI pitches.',
      icon: FileSpreadsheet,
      badge: 'Single Sheet',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      id: 'batch',
      title: 'Batch Analysis',
      description: 'Queue and audit dozens of client websites concurrently with rate-limited crawling.',
      icon: Layers,
      badge: 'Bulk Queue',
      color: 'text-slate-700 bg-slate-100 border-slate-200'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-3 sm:px-6 lg:px-8 space-y-6 animate-fade-in-up">
      
      {/* Hero Welcome Card with Gradient Motion */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 rounded-3xl p-5 sm:p-8 text-white shadow-xl space-y-4 relative overflow-hidden border border-slate-800">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-float" />

        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse-subtle" />
            <span>AI-Powered Digital Growth Platform</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Discover Businesses &amp; Audit Websites
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            Search verified companies worldwide, inspect digital presence, extract direct Gmail outreach leads, and generate audit reports.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onNavigate('business')}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 btn-motion transition flex items-center justify-center gap-2 active:scale-95"
            >
              <MapPin className="w-4 h-4" />
              <span>Search Businesses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('analyzer')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 btn-motion transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Globe className="w-4 h-4" />
              <span>Analyze Website URL</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Platform Action Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {coreActions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-400 cursor-pointer flex flex-col justify-between space-y-4 card-motion"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="badge bg-light text-secondary rounded-pill px-2.5 py-1 text-[10px] font-bold">
                    {action.badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:gap-2.5 transition-all">
                <span>Launch tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        
        {/* Recent Website Analyses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 card-motion">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Recent Website Audits</span>
            </h3>
            <button 
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
            >
              View All
            </button>
          </div>

          {stats.recent_analyses.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <p>No recent website audits.</p>
              <button
                onClick={() => onNavigate('analyzer')}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-semibold btn-motion"
              >
                Start First Audit
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.recent_analyses.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectAnalysis(item.id)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 flex items-center justify-between cursor-pointer btn-motion"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 truncate">{item.domain}</div>
                    <div className="text-[11px] text-slate-400 truncate">{item.url}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="badge bg-primary text-white rounded-pill px-2 py-0.5 text-[10px]">
                      {item.score || 85}/100
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Business Searches */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 card-motion">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Recent Business Searches</span>
            </h3>
            <button 
              onClick={() => onNavigate('business')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
            >
              Search New
            </button>
          </div>

          {stats.recent_searches.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <p>No recent business queries.</p>
              <button
                onClick={() => onNavigate('business')}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-semibold btn-motion"
              >
                Find Businesses
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.recent_searches.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate('business')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 flex items-center justify-between cursor-pointer btn-motion"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {item.keyword} in {item.location}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {item.business_count || 10} businesses found
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
