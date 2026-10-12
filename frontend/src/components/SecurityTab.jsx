import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  Cookie, 
  Server, 
  FileCode,
  ShieldX
} from 'lucide-react';

export default function SecurityTab({ technical = {}, url = '' }) {
  const secScore = technical.security_score ?? 70;
  const isHttps = technical.is_https ?? (url ? url.startsWith('https://') : false);
  const secHeaders = technical.security_headers || [];
  const mixedContent = technical.mixed_content || [];
  const cookieSecurity = technical.cookie_security || [];
  const serverDisclosures = technical.server_disclosures || [];

  const configuredCount = secHeaders.filter(h => h.status === 'Configured').length;
  const missingCount = secHeaders.length - configuredCount;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Top Security Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Security Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Security Score</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{secScore}</span>
            <span className="text-xs font-medium text-slate-400">/ 100</span>
          </div>
          <span className={`inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getScoreColor(secScore)}`}>
            {secScore >= 80 ? 'Well Hardened' : secScore >= 60 ? 'Moderate Posture' : 'Action Recommended'}
          </span>
        </div>

        {/* Transport Encryption */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Transport Layer</span>
            {isHttps ? <Lock className="w-4 h-4 text-emerald-600" /> : <Unlock className="w-4 h-4 text-rose-600" />}
          </div>
          <div className="text-lg font-bold text-slate-900">
            {isHttps ? 'HTTPS / TLS Active' : 'Unencrypted HTTP'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isHttps ? 'Traffic is encrypted in transit' : 'Traffic vulnerable to eavesdropping'}
          </p>
        </div>

        {/* Security Headers Ratio */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Security Headers</span>
            <FileCode className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{configuredCount}</span>
            <span className="text-xs text-slate-400 font-medium">/ {secHeaders.length || 6} set</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {missingCount === 0 ? 'All baseline headers active' : `${missingCount} recommendations pending`}
          </p>
        </div>

        {/* Mixed Content Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Mixed Content</span>
            {mixedContent.length === 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
          </div>
          <div className="text-lg font-bold text-slate-900">
            {mixedContent.length === 0 ? 'Clean (0 Insecure)' : `${mixedContent.length} Assets Found`}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {mixedContent.length === 0 ? 'No unencrypted sub-resources' : 'HTTP assets on HTTPS page'}
          </p>
        </div>
      </div>

      {/* HTTP Security Headers Detailed Checklist */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">HTTP Security Headers Audit</h3>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            OWASP Standard
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {secHeaders.map((sh, idx) => {
            const isOk = sh.status === 'Configured';
            return (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold text-slate-900">{sh.header}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOk ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {sh.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mb-2">{sh.name}</p>
                </div>

                <div className="text-[11px] p-2.5 rounded-lg bg-white border border-slate-200/80 font-mono text-slate-700">
                  {isOk ? (
                    <span className="text-emerald-700 truncate block">{sh.value}</span>
                  ) : (
                    <span className="text-slate-500">{sh.details}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mixed Content & Cookie Security Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Mixed Content Audit */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Mixed Content Inspection</h3>
          </div>
          
          {mixedContent.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900">No Mixed Content Detected</h4>
                <p className="text-xs text-emerald-700 mt-0.5">All audited scripts, stylesheets, images, and iframes load securely over HTTPS.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Insecure HTTP assets detected on encrypted page:</p>
              {mixedContent.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-mono text-rose-800 truncate">
                  <span className="font-bold uppercase text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded mr-2">&lt;{item.tag}&gt;</span>
                  {item.resource}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cookie Security Audit */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Cookie className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Cookie Security Attributes</h3>
          </div>

          {cookieSecurity.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              No session or tracking cookies set on initial page response.
            </div>
          ) : (
            <div className="space-y-2">
              {cookieSecurity.map((c, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-800">{c.cookie}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${c.secure ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {c.secure ? 'Secure' : 'No Secure'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${c.httponly ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {c.httponly ? 'HttpOnly' : 'No HttpOnly'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Server Version Disclosure */}
      {serverDisclosures.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-700" />
            <h4 className="text-xs font-bold text-amber-900">Server Information Disclosure</h4>
          </div>
          {serverDisclosures.map((d, idx) => (
            <p key={idx} className="text-xs text-amber-800 font-medium">
              &bull; {d}
            </p>
          ))}
          <p className="text-[11px] text-amber-700">
            Recommendation: Suppress version details in production web server configuration (e.g., set <code className="font-mono">ServerTokens Prod</code> or <code className="font-mono">server_tokens off;</code>).
          </p>
        </div>
      )}
    </div>
  );
}
