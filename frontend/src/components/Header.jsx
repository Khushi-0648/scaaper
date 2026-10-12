import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  Globe, 
  MapPin, 
  Layers, 
  FileSpreadsheet, 
  History, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export default function Header({ activeView, setActiveView, historyCount = 0 }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'analyzer', label: 'Website Analyzer', icon: Search },
    { id: 'business', label: 'Business Finder', icon: MapPin },
    { id: 'batch', label: 'Batch Analysis', icon: Layers },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'history', label: 'History', icon: History, badge: historyCount > 0 ? historyCount : null }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand Logo with Gentle Float Motion */}
          <div 
            onClick={() => { setActiveView('dashboard'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0 btn-motion"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all duration-300">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-float" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  WebIntel<span className="text-blue-600">.AI</span>
                </span>
                <span className="badge bg-primary text-white rounded-pill px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  Pro
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold btn-motion whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-0.5 ${
                      isActive ? 'bg-white text-blue-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button - Accessible 44px Tap Target */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition touch-manipulation"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation with Backdrop Blur */}
      {mobileMenuOpen && (
        <>
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 top-16 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          />
          <div className="relative z-50 lg:hidden border-t border-slate-200 bg-white px-3 sm:px-4 pt-3 pb-6 space-y-1 shadow-2xl max-h-[calc(100vh-4.5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all touch-manipulation active:scale-[0.98] ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </header>
  );
}
