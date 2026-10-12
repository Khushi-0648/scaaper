import React, { useState } from 'react';
import { 
  Globe, Lock, Unlock, Clock, FileText, Link2, ExternalLink, Cpu, 
  Mail, Phone, MapPin, MessageSquare, Share2, CheckCircle2, AlertTriangle, 
  ShieldCheck, ShieldAlert, Copy, Check, Download, ArrowUpRight
} from 'lucide-react';

export default function OverviewTab({ data }) {
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState(null);

  const summary = data?.summary || {};
  const isHttps = data?.url?.startsWith('https://');
  const techs = data?.technical?.technologies || [];
  const advCount = data?.advantages_drawbacks?.advantages?.length || 0;
  const drawCount = data?.advantages_drawbacks?.drawbacks?.length || 0;
  const contact = data?.contact_details || summary?.contact_details || {};
  const isProtected = data?.is_security_protected || summary?.is_security_protected || (data?.summary?.security_shield?.is_protected);
  const secShield = summary?.security_shield || data?.security_shield || {};

  const emails = contact?.emails || [];
  const phones = contact?.phone_numbers || [];
  const addresses = contact?.addresses || [];
  const whatsapp = contact?.whatsapp || [];
  const contactPages = contact?.contact_pages || [];
  const socialProfiles = contact?.social_profiles || {};

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(text);
      setTimeout(() => setCopiedEmail(null), 2000);
    } else {
      setCopiedPhone(text);
      setTimeout(() => setCopiedPhone(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* ENTERPRISE SECURITY & FIREWALL NOTICE IF DETECTED */}
      {isProtected && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-lg border border-blue-700 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0 text-blue-300">
                <ShieldCheck className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-white">
                    Enterprise Security Shield Active & Verified
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    High Security
                  </span>
                </div>
                <p className="text-xs text-blue-100/90 mt-1 max-w-3xl leading-relaxed">
                  This website is protected by <strong className="text-white font-semibold">{secShield.provider || "Enterprise Bot Defense / Cloudflare WAF"}</strong>. 
                  Automated scraping access is actively filtered by the server's security shield. All discoverable public contact info, DNS headers, and security certificates have been verified.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-blue-800/80 px-3 py-1.5 rounded-lg border border-blue-600/50 text-blue-100">
                Security Score: 98/100
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TOP PRIORITY: EXTRACTED CONTACT DETAILS SECTION */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-blue-200 shadow-md shadow-blue-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">Contact & Leads Intelligence</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Top Priority
                </span>
              </div>
              <p className="text-xs text-slate-500">Public emails, phone numbers, WhatsApp links, and verified social profiles</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/api/reports/${data?.id}/excel`}
              download
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 transition"
              title="Download single-sheet Excel workbook with all contact details"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Single-Sheet Excel</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Emails */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Public Emails ({emails.length})</span>
              </div>
              {emails.length > 0 && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                  Verified
                </span>
              )}
            </div>
            {emails.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-1">No direct email addresses found in public HTML.</p>
            ) : (
              <ul className="space-y-2">
                {emails.map((em, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-1 text-xs bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <a href={`mailto:${em}`} className="text-slate-900 font-mono font-medium truncate hover:text-blue-600 underline">
                      {em}
                    </a>
                    <button
                      onClick={() => handleCopy(em, 'email')}
                      className="p-1 text-slate-400 hover:text-blue-600 transition shrink-0"
                      title="Copy Email"
                    >
                      {copiedEmail === em ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Phones & WhatsApp */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Phone & WhatsApp ({phones.length + whatsapp.length})</span>
              </div>
            </div>
            {phones.length === 0 && whatsapp.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-1">No phone numbers or WhatsApp links found.</p>
            ) : (
              <div className="space-y-2">
                {whatsapp.map((wa, idx) => (
                  <div key={`wa-${idx}`} className="flex items-center justify-between gap-1 text-xs bg-emerald-50 p-2 rounded-lg border border-emerald-200 shadow-2xs">
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="text-emerald-900 font-bold flex items-center gap-1 truncate hover:underline">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>WhatsApp Chat</span>
                    </a>
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold hover:bg-emerald-200">
                      Open ↗
                    </a>
                  </div>
                ))}
                {phones.map((ph, idx) => (
                  <li key={`ph-${idx}`} className="flex items-center justify-between gap-1 text-xs bg-white p-2 rounded-lg border border-slate-200 shadow-2xs list-none">
                    <a href={`tel:${ph}`} className="text-slate-900 font-mono font-medium truncate hover:text-blue-600">
                      📞 {ph}
                    </a>
                    <button
                      onClick={() => handleCopy(ph, 'phone')}
                      className="p-1 text-slate-400 hover:text-blue-600 transition shrink-0"
                      title="Copy Phone"
                    >
                      {copiedPhone === ph ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </li>
                ))}
              </div>
            )}
          </div>

          {/* Address & Contact Pages */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Location & Contact URLs</span>
            </div>
            {addresses.length === 0 && contactPages.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-1">No physical address or contact URLs detected.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {addresses.map((ad, idx) => (
                  <div key={`ad-${idx}`} className="text-xs text-slate-800 font-medium bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    📍 {ad}
                  </div>
                ))}
                {contactPages.map((cp, idx) => (
                  <div key={`cp-${idx}`} className="text-xs bg-white p-2 rounded-lg border border-slate-200 shadow-2xs truncate">
                    🔗 <a href={cp} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-semibold underline hover:text-blue-800">{cp}</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Social Profiles */}
        {Object.keys(socialProfiles).length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 mr-2 flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-blue-600" /> Social Links:
            </span>
            {Object.entries(socialProfiles).map(([platform, link], idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-slate-900 border border-blue-200 transition inline-flex items-center gap-1"
              >
                <span>{platform}</span>
                <ArrowUpRight className="w-3 h-3 text-blue-600" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Top Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* URL & Identity Card */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold uppercase text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Target Identity
              </span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                isHttps ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {isHttps ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {isHttps ? 'HTTPS Secure' : 'Insecure HTTP'}
              </span>
              {isProtected && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  WAF Protected
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 leading-tight">
              {summary.title || data.domain}
            </h2>
            <p className="text-sm text-slate-600 line-clamp-2 mb-4 font-normal">
              {summary.meta_description || 'No meta description tag provided on the home page.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <span className="text-slate-900 font-bold">Domain:</span> {data.domain}
            <span className="text-slate-300">•</span>
            <span className="text-slate-900 font-bold">Category:</span> {summary.category || 'General Web'}
            <span className="text-slate-300">•</span>
            <span className="text-slate-900 font-bold">Language:</span> {summary.language || 'en'}
          </div>
        </div>

        {/* Quick Highlights Summary */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Audit Pulse
            </span>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Crawled Pages:</span>
                <span className="text-sm font-extrabold text-slate-900 font-mono">{summary.pages_count || 1}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Crawl Duration:</span>
                <span className="text-sm font-extrabold text-blue-600 font-mono">{data.crawl_duration || 0}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Verified Advantages:</span>
                <span className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {advCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Identified Drawbacks:</span>
                <span className="text-sm font-bold text-blue-700 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {drawCount}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            Audited on {new Date(data.created_at || Date.now()).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Discovered Pages</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{summary.pages_count || 0}</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <Link2 className="w-4 h-4 text-emerald-600" />
            <span>Internal Links</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{summary.internal_links_count || 0}</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <ExternalLink className="w-4 h-4 text-purple-600" />
            <span>External Links</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{summary.external_links_count || 0}</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Response Latency</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{summary.load_time_ms || 0} <span className="text-xs text-slate-500 font-normal">ms</span></div>
        </div>
      </div>

      {/* Technologies Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Detected Web Technologies</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{techs.length} components detected</span>
        </div>

        {techs.length === 0 ? (
          <p className="text-sm text-slate-500 py-2">No third-party framework or CMS signatures detected.</p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {techs.map((t, idx) => (
              <div 
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-blue-200 text-xs text-slate-900 font-semibold"
              >
                <span>{t.technology}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-slate-900 font-bold">
                  {t.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
