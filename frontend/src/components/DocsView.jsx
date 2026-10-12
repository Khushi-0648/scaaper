import React from 'react';
import { BookOpen, ShieldCheck, FileSpreadsheet, Sparkles, CheckCircle2 } from 'lucide-react';

export default function DocsView() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span>Documentation & Architecture Guide</span>
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Technical specifications, security safeguards, and data governance principles behind Website Analyzer.
        </p>
      </div>

      {/* Core Data Principle Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span>Fundamental Data Governance Principle</span>
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed font-medium">
          The application maintains a strict architectural distinction between what is directly observed, what is objectively calculated, and what is inferred by AI models:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-1">
            <span className="font-extrabold text-slate-900 uppercase tracking-wider block">1. Observed Data</span>
            <p className="text-slate-600 font-medium">Raw HTTP response codes, actual HTML tags, contact info, response latency, and extracted anchor links.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-1">
            <span className="font-extrabold text-slate-900 uppercase tracking-wider block">2. Analyzed Data</span>
            <p className="text-slate-600 font-medium">Deterministic scoring algorithms (0-100), heading hierarchy checks, and 30+ feature pattern detections.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-1">
            <span className="font-extrabold text-slate-900 uppercase tracking-wider block">3. AI Inference</span>
            <p className="text-slate-600 font-medium">Contextual summaries and UX suggestions clearly flagged as probabilistic recommendations, never presented as facts.</p>
          </div>
        </div>
      </div>

      {/* Security & SSRF Protection */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Security & Ethical Crawling Safeguards</span>
        </h3>
        <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>SSRF Protection:</strong> Domain names undergo pre-flight DNS lookups. Requests targeting private networks (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, loopbacks 127.0.0.1, ::1) are strictly rejected.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>robots.txt Compliance:</strong> Urllib robotparser reads <code>/robots.txt</code> directives and skips disallow-listed paths.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Resource Quotas:</strong> Enforces 5 MB response truncation limits and polite crawl pacing to prevent memory exhaustion or target server denial-of-service.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>No Credential Bypassing:</strong> Does not scrape behind paywalls, CAPTCHAs, or authenticated internal dashboards.</span>
          </li>
        </ul>
      </div>

      {/* Excel Structure */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          <span>Excel Workbook Sheets Specification (.xlsx)</span>
        </h3>
        <p className="text-xs text-slate-600">
          Generated using <code>openpyxl</code> with professional SaaS styling, frozen headers, formatted tables, contact details, and automatic column widths:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
          {['1. Overview & Contacts', '2. Features', '3. Pages', '4. SEO', '5. Technical', '6. Performance', '7. Accessibility', '8. Advantages', '9. Drawbacks', '10. Recommendations'].map((s, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono text-slate-800 font-bold">
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
