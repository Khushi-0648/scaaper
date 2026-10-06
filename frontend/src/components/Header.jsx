import React from 'react';
import { Globe, History, BookOpen, Settings, Layers, Sparkles } from 'lucide-react';

export default function Header({ activeView, setActiveView, historyCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Globe },
    { id: 'history', label: 'Analysis History', icon: History, badge: historyCount > 0 ? historyCount : null },
    { id: 'docs', label: 'Documentation', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header className="border-b border-yellow-200/80 bg-white/90 backdrop-blur sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-amber-300 to-yellow-300 flex items-center justify-center shadow-md shadow-yellow-400/20 group-hover:scale-105 transition border border-yellow-300">
            <Layers className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">Website Analyzer</span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300">
                Lemon Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Full-Stack Crawler, SEO & Feature Audit</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-yellow-400 text-slate-950 shadow-sm border border-yellow-400'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-yellow-50 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-slate-950 text-white' : 'bg-yellow-100 text-yellow-900 border border-yellow-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
