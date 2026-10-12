import React, { useState, useEffect } from 'react';
import { Settings, Server, Key, Shield, HardDrive, MapPin, Sliders, CheckCircle2 } from 'lucide-react';

export default function SettingsView() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [provider, setProvider] = useState('osm_overpass');
  const [aiProvider, setAiProvider] = useState('gemini');

  useEffect(() => {
    fetch('/health')
      .then(res => res.json())
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure API connectors, crawler rate limits, and audit defaults.
        </p>
      </div>

      <div className="space-y-4">
        {/* Backend Connection */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">FastAPI Intelligence Server</h4>
              <p className="text-xs text-slate-500 font-mono">http://127.0.0.1:8000</p>
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase flex items-center gap-1.5 ${
            backendStatus === 'connected' 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-rose-100 text-rose-800 border border-rose-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {backendStatus === 'connected' ? 'Connected & Operational' : 'Offline'}
          </span>
        </div>

        {/* Business Search Provider Abstraction */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Business Search Provider Abstraction</h4>
              <p className="text-xs text-slate-500">Configure data source for Location + Keyword discovery</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <label className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition ${
              provider === 'google_places' ? 'border-blue-500 bg-slate-50/50' : 'border-slate-200 bg-white'
            }`}>
              <input
                type="radio"
                name="biz_provider"
                checked={provider === 'google_places'}
                onChange={() => setProvider('google_places')}
                className="mt-1 accent-slate-950"
              />
              <div>
                <div className="text-xs font-black text-slate-950">Google Places API</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Live Google Maps & Places data for locations, phone, reviews, ratings, and operating hours.
                </div>
              </div>
            </label>

            <label className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition ${
              provider === 'osm_overpass' ? 'border-blue-500 bg-slate-50/50' : 'border-slate-200 bg-white'
            }`}>
              <input
                type="radio"
                name="biz_provider"
                checked={provider === 'osm_overpass'}
                onChange={() => setProvider('osm_overpass')}
                className="mt-1 accent-slate-950"
              />
              <div>
                <div className="text-xs font-black text-slate-950">OpenStreetMap (Free / Open)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  100% terms-compliant open POI directory with Nominatim geocoding & Overpass queries.
                </div>
              </div>
            </label>

            <label className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition ${
              provider === 'directory' ? 'border-blue-500 bg-slate-50/50' : 'border-slate-200 bg-white'
            }`}>
              <input
                type="radio"
                name="biz_provider"
                checked={provider === 'directory'}
                onChange={() => setProvider('directory')}
                className="mt-1 accent-slate-950"
              />
              <div>
                <div className="text-xs font-black text-slate-950">Local Directory Fallback</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Offline-resilient verified regional datasets for high-speed local development and zero rate-limits.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* AI Engine & API Keys */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">AI Intelligence Provider</h4>
              <p className="text-xs text-slate-500">Multimodal synthesis across 10 specialized intelligence agents</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Configure <code>GEMINI_API_KEY=your_key_here</code> in <code>backend/.env</code> to route synthesis to Google Gemini. If omitted, WebIntel AI utilizes its built-in deterministic rule-grounded inference engine with zero cost and 100% uptime.
          </p>
        </div>

        {/* Data Ethics & Protection */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Data Ethics & Security Guardrails</h4>
              <p className="text-xs text-slate-500">Compliance with scraping regulations and website terms of service</p>
            </div>
          </div>
          <ul className="text-xs text-slate-700 space-y-2 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Only publicly accessible information is parsed (no CAPTCHA bypass, no paywall evasion, no authenticated scraping).</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full SSRF protection: Localhost and internal private IP address ranges are strictly blocked.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Conforms to robots.txt directives and gentle request rate throttling (default 0.2s–0.3s delay).</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
