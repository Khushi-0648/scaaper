import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, MapPin, Layers } from 'lucide-react';

export default function Banner({ onNavigate }) {
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('webintel_banner_dismissed') !== 'true';
  });

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('webintel_banner_dismissed', 'true');
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 text-white shadow-md border-b border-blue-500/30 overflow-hidden animate-fade-in-up">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4 text-center md:text-left">
          
          {/* Left badge & message */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider border border-white/30 shadow-xs animate-pulse-subtle">
              <Sparkles className="w-3 h-3 text-blue-200" />
              <span>Update</span>
            </span>
            <span className="font-medium text-slate-100 text-xs sm:text-sm">
              Batch Multi-URL Audits, Direct Gmail Lead Outreach &amp; Single-Sheet Excel Exports now live.
            </span>
          </div>

          {/* Right quick actions & dismiss */}
          <div className="flex items-center justify-center gap-2 shrink-0 w-full md:w-auto">
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('business')}
                  className="px-3 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-xs btn-motion flex items-center gap-1 active:scale-95"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Find Leads</span>
                </button>

                <button
                  onClick={() => onNavigate('batch')}
                  className="px-3 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-900 text-white text-xs font-bold border border-blue-300/40 btn-motion flex items-center gap-1 active:scale-95"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Batch Audit</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </>
            )}

            <button
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="p-1.5 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 active:scale-90 transition ml-1 shrink-0"
              title="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
