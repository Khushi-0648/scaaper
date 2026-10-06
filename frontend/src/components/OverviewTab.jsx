import React from 'react';
import { Globe, Lock, Unlock, Clock, FileText, Link2, ExternalLink, Cpu, Mail, Phone, MapPin, MessageSquare, Share2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function OverviewTab({ data }) {
  const summary = data?.summary || {};
  const isHttps = data?.url?.startsWith('https://');
  const techs = data?.technical?.technologies || [];
  const advCount = data?.advantages_drawbacks?.advantages?.length || 0;
  const drawCount = data?.advantages_drawbacks?.drawbacks?.length || 0;
  const contact = data?.contact_details || summary?.contact_details || {};

  const emails = contact?.emails || [];
  const phones = contact?.phone_numbers || [];
  const addresses = contact?.addresses || [];
  const whatsapp = contact?.whatsapp || [];
  const contactPages = contact?.contact_pages || [];
  const socialProfiles = contact?.social_profiles || {};

  return (
    <div className="space-y-6">
      {/* Top Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* URL & Identity Card */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white border border-yellow-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-300">
                Target Identity
              </span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                isHttps ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {isHttps ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {isHttps ? 'HTTPS Secure' : 'Insecure HTTP'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 leading-tight">
              {summary.title || data.domain}
            </h2>
            <p className="text-sm text-slate-600 line-clamp-2 mb-4 font-normal">
              {summary.meta_description || 'No meta description tag provided on the home page.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-yellow-100 text-xs text-slate-600">
            <span className="text-slate-900 font-bold">Domain:</span> {data.domain}
            <span className="text-slate-300">•</span>
            <span className="text-slate-900 font-bold">Category:</span> {summary.category || 'General Web'}
            <span className="text-slate-300">•</span>
            <span className="text-slate-900 font-bold">Language:</span> {summary.language || 'en'}
          </div>
        </div>

        {/* Quick Highlights Summary */}
        <div className="p-6 rounded-2xl bg-white border border-yellow-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-300">
              Audit Pulse
            </span>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Crawled Pages:</span>
                <span className="text-sm font-extrabold text-slate-900 font-mono">{summary.pages_count || 1}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Crawl Duration:</span>
                <span className="text-sm font-extrabold text-yellow-600 font-mono">{data.crawl_duration || 0}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Verified Advantages:</span>
                <span className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {advCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Identified Drawbacks:</span>
                <span className="text-sm font-bold text-amber-700 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {drawCount}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-yellow-100">
            Audited on {new Date(data.created_at || Date.now()).toLocaleString()}
          </div>
        </div>
      </div>

      {/* EXTRACTED CONTACT DETAILS SECTION */}
      <div className="p-6 rounded-2xl bg-white border-2 border-yellow-300 shadow-md shadow-yellow-100/50">
        <div className="flex items-center justify-between mb-4 border-b border-yellow-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-slate-950 font-bold shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Extracted Website Contact Details</h3>
              <p className="text-xs text-slate-500">Public communication channels discovered during the crawl</p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300">
            Included in Excel Sheet
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Emails */}
          <div className="p-4 rounded-xl bg-yellow-50/50 border border-yellow-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
              <Mail className="w-4 h-4 text-yellow-600" />
              <span>Public Email Addresses ({emails.length})</span>
            </div>
            {emails.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No email addresses detected.</p>
            ) : (
              <ul className="space-y-1">
                {emails.map((em, idx) => (
                  <li key={idx} className="text-xs text-slate-900 font-mono font-medium truncate">
                    <a href={`mailto:${em}`} className="hover:text-yellow-600 underline">{em}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Phones */}
          <div className="p-4 rounded-xl bg-yellow-50/50 border border-yellow-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
              <Phone className="w-4 h-4 text-yellow-600" />
              <span>Phone Numbers ({phones.length})</span>
            </div>
            {phones.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No phone numbers detected.</p>
            ) : (
              <ul className="space-y-1">
                {phones.map((ph, idx) => (
                  <li key={idx} className="text-xs text-slate-900 font-mono font-medium">
                    <a href={`tel:${ph}`} className="hover:text-yellow-600">{ph}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Address & Contact Pages */}
          <div className="p-4 rounded-xl bg-yellow-50/50 border border-yellow-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
              <MapPin className="w-4 h-4 text-yellow-600" />
              <span>Address & Contact Pages</span>
            </div>
            {addresses.length === 0 && contactPages.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No physical address or contact page paths found.</p>
            ) : (
              <div className="space-y-2 text-xs text-slate-700">
                {addresses.map((ad, idx) => (
                  <div key={idx} className="text-xs text-slate-800 font-medium truncate">
                    📍 {ad}
                  </div>
                ))}
                {contactPages.map((cp, idx) => (
                  <div key={idx} className="text-xs truncate">
                    🔗 <a href={cp} target="_blank" rel="noopener noreferrer" className="text-yellow-700 font-semibold underline">{cp}</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Social Profiles */}
        {Object.keys(socialProfiles).length > 0 && (
          <div className="mt-4 pt-3 border-t border-yellow-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 mr-2 flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-yellow-600" /> Social Links:
            </span>
            {Object.entries(socialProfiles).map(([platform, link], idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-950 border border-yellow-300 transition"
              >
                {platform} ↗
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-yellow-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <FileText className="w-4 h-4 text-yellow-600" />
            <span>Discovered Pages</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{summary.pages_count || 0}</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-yellow-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <Link2 className="w-4 h-4 text-emerald-600" />
            <span>Internal Links</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{summary.internal_links_count || 0}</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-yellow-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <ExternalLink className="w-4 h-4 text-purple-600" />
            <span>External Links</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{summary.external_links_count || 0}</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-yellow-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Response Latency</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{summary.load_time_ms || 0} <span className="text-xs text-slate-500 font-normal">ms</span></div>
        </div>
      </div>

      {/* Technologies Section */}
      <div className="p-6 rounded-2xl bg-white border border-yellow-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-yellow-600" />
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
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-50 border border-yellow-300 text-xs text-slate-900 font-semibold"
              >
                <span>{t.technology}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-200 text-yellow-950 font-bold">
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
