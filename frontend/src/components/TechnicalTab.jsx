import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Server, Lock } from 'lucide-react';

export default function TechnicalTab({ technical = {} }) {
  const techs = technical.technologies || [];
  const secHeaders = technical.security_headers || [];
  const secScore = technical.security_score || 0;
  const server = technical.server || 'Hidden';
  const compression = technical.compression || 'None';
  const caching = technical.caching || 'None';

  return (
    <div className="space-y-6">
      {/* Top Technical Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-yellow-200 shadow-xs">
          <span className="text-[10px] text-yellow-800 uppercase font-extrabold block mb-1">Web Server</span>
          <span className="text-sm font-extrabold text-slate-900 font-mono truncate block">{server}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-yellow-200 shadow-xs">
          <span className="text-[10px] text-yellow-800 uppercase font-extrabold block mb-1">Compression</span>
          <span className="text-sm font-extrabold text-emerald-700 font-mono truncate block">{compression}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-yellow-200 shadow-xs">
          <span className="text-[10px] text-yellow-800 uppercase font-extrabold block mb-1">Cache Policy</span>
          <span className="text-sm font-extrabold text-slate-900 font-mono truncate block">{caching}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-yellow-200 shadow-xs">
          <span className="text-[10px] text-yellow-800 uppercase font-extrabold block mb-1">Security Posture</span>
          <span className="text-sm font-extrabold text-slate-900 font-mono truncate block">{secScore} / 100</span>
        </div>
      </div>

      {/* Technologies Detected */}
      <div className="p-6 rounded-2xl bg-white border border-yellow-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-5 h-5 text-yellow-600" />
          <h3 className="text-base font-extrabold text-slate-900">Detected Frameworks & Infrastructure</h3>
        </div>

        {techs.length === 0 ? (
          <p className="text-sm text-slate-500">No public tech stack signatures identified in headers or DOM.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {techs.map((t, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-yellow-50/50 border border-yellow-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-sm font-extrabold text-slate-900">{t.technology}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-950 font-bold">
                      {t.confidence}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mb-2 font-medium">{t.category}</span>
                </div>
                <div className="text-[10px] text-slate-700 font-mono truncate bg-white p-2 rounded-lg border border-yellow-100">
                  {t.evidence}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Headers Audit */}
      <div className="p-6 rounded-2xl bg-white border border-yellow-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-yellow-600" />
            <h3 className="text-base font-extrabold text-slate-900">HTTP Security Headers Audit</h3>
          </div>
          <span className="text-xs text-yellow-900 font-bold bg-yellow-100 px-2.5 py-0.5 rounded-full border border-yellow-300">
            OWASP Baseline
          </span>
        </div>

        <div className="space-y-3">
          {secHeaders.map((sh, idx) => {
            const isOk = sh.status === 'Configured';
            return (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-yellow-50/40 border border-yellow-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  {isOk ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-extrabold text-slate-900 font-mono">{sh.header}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                        isOk ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {sh.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">{sh.name}</p>
                    <p className="text-[11px] text-slate-800 font-mono bg-white px-2.5 py-1 rounded-lg border border-yellow-200 inline-block font-medium">
                      {isOk ? sh.value : sh.details}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    sh.severity === 'Info' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {sh.severity}
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
