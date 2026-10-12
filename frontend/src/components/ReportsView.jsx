import React, { useEffect, useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  FileCode, 
  Download, 
  Search, 
  Globe, 
  Building2,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { getReports } from '../services/api';

export default function ReportsView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await getReports();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reports.filter((r) => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (searchTerm && !r.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Reports Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Download Excel workbooks, PDF audit dossiers, and JSON/CSV data files.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:border-slate-950 font-bold"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50/50 border border-slate-200 font-bold text-slate-800"
          >
            <option value="all">All Report Types</option>
            <option value="website">Website Audits</option>
            <option value="business">Business Intelligence</option>
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500">
          Showing {filtered.length} reports
        </span>
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto rounded-3xl bg-white border border-slate-200 shadow-sm">
        <table className="w-full text-left text-xs border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
              <th className="py-3 px-4">Report Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Date Generated</th>
              <th className="py-3 px-4 text-right">Available Exports</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                  No generated reports found matching the criteria.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      {r.type === 'website' ? (
                        <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                      ) : (
                        <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                      <span>{r.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-600 capitalize">{r.type}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{r.date || 'Recent'}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {r.excel_url && (
                        <a
                          href={r.excel_url}
                          download
                          className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] border border-blue-600 shadow-xs flex items-center gap-1"
                          title="Download Excel Workbook"
                        >
                          <FileSpreadsheet className="w-3 h-3 text-white" />
                          <span>.XLSX</span>
                        </a>
                      )}

                      {r.pdf_url && (
                        <a
                          href={r.pdf_url}
                          download
                          className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-black text-[11px] border border-rose-200 flex items-center gap-1"
                          title="Download PDF Dossier"
                        >
                          <FileText className="w-3 h-3 text-rose-600" />
                          <span>.PDF</span>
                        </a>
                      )}

                      {r.json_url && (
                        <a
                          href={r.json_url}
                          download
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] border border-slate-300 flex items-center gap-1"
                          title="Download Raw JSON"
                        >
                          <FileCode className="w-3 h-3 text-slate-600" />
                          <span>.JSON</span>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
