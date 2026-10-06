import React, { useState, useEffect } from 'react';
import { Settings, Server, Key, Shield, HardDrive } from 'lucide-react';

export default function SettingsView() {
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    fetch('/health')
      .then(res => res.json())
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-yellow-600" />
          <span>System & Engine Settings</span>
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Configuration settings for crawling engine, database storage, and AI inference.
        </p>
      </div>

      <div className="space-y-4">
        {/* Connection Status */}
        <div className="p-6 rounded-3xl bg-white border border-yellow-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">FastAPI Backend API</h4>
              <p className="text-xs text-slate-500 font-mono">http://localhost:8000</p>
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

        {/* Database */}
        <div className="p-6 rounded-3xl bg-white border border-yellow-200 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Database Engine</h4>
              <p className="text-xs text-slate-500">SQLite (Zero-configuration persistent local storage)</p>
            </div>
          </div>
          <div className="bg-yellow-50/60 p-3 rounded-xl border border-yellow-200 text-xs font-mono text-slate-800 font-semibold">
            backend/data/analyzer.db
          </div>
        </div>

        {/* AI Provider */}
        <div className="p-6 rounded-3xl bg-white border border-yellow-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Configured AI Engine</h4>
              <p className="text-xs text-slate-500">Powered by Google Gemini with deterministic offline fallback</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            To activate real-time Gemini LLM calls, define <code>GEMINI_API_KEY=your_key_here</code> in <code>backend/.env</code>.
            If no key is supplied, the built-in deterministic evidence synthesis engine operates seamlessly with zero dependencies or API costs.
          </p>
        </div>

        {/* User Agent */}
        <div className="p-6 rounded-3xl bg-white border border-yellow-200 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Bot Identification Header</h4>
              <p className="text-xs text-slate-500">Sent during HTTP crawling to declare bot identity ethically</p>
            </div>
          </div>
          <div className="bg-yellow-50/60 p-3 rounded-xl border border-yellow-200 text-xs font-mono text-slate-800 font-semibold">
            WebsiteAnalyzerBot/1.0 (+https://websiteanalyzer.local; contact@websiteanalyzer.local)
          </div>
        </div>
      </div>
    </div>
  );
}
