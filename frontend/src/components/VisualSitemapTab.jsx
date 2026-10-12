import React from 'react';
import { GitBranch, ExternalLink, Globe, FileText, CheckCircle2 } from 'lucide-react';

function TreeNode({ node, isRoot = false }) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative pl-6 space-y-2">
      {/* Node Row */}
      <div className="flex items-center gap-2 group">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
          isRoot 
            ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
            : 'bg-white border-slate-200 text-slate-700 shadow-xs'
        }`}>
          {isRoot ? <Globe className="w-4 h-4" /> : <FileText className="w-3.5 h-3.5" />}
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-500 transition flex items-center gap-3">
          <div>
            <div className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
              <span>{node.title || node.name}</span>
              {node.url && (
                <a 
                  href={node.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-blue-600 hover:text-slate-950"
                  title="Open URL"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">{node.path}</div>
          </div>

          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {node.status_code || 200}
          </span>
        </div>
      </div>

      {/* Children Nodes */}
      {hasChildren && (
        <div className="border-l-2 border-slate-200 ml-4 pl-2 space-y-3 pt-1">
          {node.children.map((child, idx) => (
            <TreeNode key={idx} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function VisualSitemapTab({ visualSitemap, domain }) {
  if (!visualSitemap) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
        <GitBranch className="w-8 h-8 text-blue-500 mx-auto" />
        <h4 className="font-bold text-slate-900 text-sm">Visual Sitemap not available</h4>
        <p className="text-xs text-slate-500">Run an analysis with at least 2 pages discovered to generate the hierarchical map.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-base text-slate-950 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            <span>Discovered Hierarchy & Visual Sitemap</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tree visualization of site architecture mapped from internal crawl links for {domain}.
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50/20 border border-slate-200 overflow-x-auto">
        <TreeNode node={visualSitemap} isRoot={true} />
      </div>
    </div>
  );
}
