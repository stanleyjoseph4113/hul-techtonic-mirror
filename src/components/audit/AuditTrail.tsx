import React, { useState } from 'react';
import type { AuditLogEntry } from '../../engine/types';
import { TierBadge } from '../common/Badge';
import { 
  History, 
  Download, 
  Trash2, 
  Search, 
  FileText, 
  ChevronRight
} from 'lucide-react';

interface AuditTrailProps {
  auditLog: AuditLogEntry[];
  onSelectEntry: (entry: AuditLogEntry) => void;
  onClearHistory: () => void;
  onDeleteEntry: (id: string) => void;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({
  auditLog,
  onSelectEntry,
  onClearHistory,
  onDeleteEntry
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');

  const filteredLogs = auditLog.filter(entry => {
    const matchesSearch = 
      entry.strategy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.strategy.creativeAngle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.strategy.brandId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBrand = selectedBrandFilter === 'all' || entry.strategy.brandId === selectedBrandFilter;
    const matchesTier = selectedTierFilter === 'all' || entry.simulation.launchTier === selectedTierFilter;

    return matchesSearch && matchesBrand && matchesTier;
  });

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mirror_audit_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    const headers = ["Timestamp", "Strategy Title", "Brand", "Type", "Budget USD", "Reach Expected", "Confidence Score", "Launch Tier", "Risk Flags Count", "Overrides Count"];
    const rows = auditLog.map(e => [
      e.timestamp,
      `"${e.strategy.title.replace(/"/g, '""')}"`,
      e.strategy.brandId,
      e.strategy.strategyType,
      e.strategy.budget,
      e.simulation.expectedTotalReach,
      e.simulation.confidenceScore,
      e.simulation.launchTier,
      e.simulation.guardrailFlags.length,
      e.manualOverrides.length
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mirror_governance_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Enterprise Audit Trail & Governance Log
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Immutable local session log tracking every simulation run, probability score, risk screening result, and brand director override note.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={exportCSV}
              disabled={auditLog.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={exportJSON}
              disabled={auditLog.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Clear all logged simulation history?')) onClearHistory();
              }}
              disabled={auditLog.length === 0}
              className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search simulated strategies by title, keyword, or brand..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={selectedBrandFilter}
            onChange={e => setSelectedBrandFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Brands</option>
            <option value="rexona">Rexona</option>
            <option value="dove">Dove</option>
            <option value="knorr">Knorr</option>
            <option value="magnum">Magnum</option>
            <option value="hellmanns">Hellmann's</option>
            <option value="lifebuoy">Lifebuoy</option>
          </select>

          <select
            value={selectedTierFilter}
            onChange={e => setSelectedTierFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Launch Tiers</option>
            <option value="full_scale">🟢 Full-Scale Launch</option>
            <option value="regional_test">🟡 Regional Test First</option>
            <option value="micro_test">🔴 Micro-Test / Hold</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      {filteredLogs.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center">
          <History className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-200">No Simulation Runs Recorded Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Run a simulation from the Studio tab to automatically log candidate strategies, prediction scores, and guardrails here.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Strategy & Brand</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Projected Reach</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Launch Tier</th>
                  <th className="py-3 px-4">Guardrails</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredLogs.map(entry => {
                  const date = new Date(entry.timestamp);
                  const timeFormatted = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {timeFormatted}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-100 truncate" title={entry.strategy.title}>
                          {entry.strategy.title}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="uppercase text-cyan-400 font-semibold">{entry.strategy.brandId}</span>
                          <span>•</span>
                          <span>{entry.strategy.markets.join(', ')}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                        ${entry.strategy.budget.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-200">
                        {(entry.simulation.expectedTotalReach / 1000000).toFixed(1)}M
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                        {entry.simulation.confidenceScore}/100
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <TierBadge tier={entry.simulation.launchTier} size="sm" />
                      </td>

                      <td className="py-3.5 px-4">
                        {entry.simulation.guardrailFlags.length === 0 ? (
                          <span className="text-[11px] text-emerald-400 font-semibold">Cleared (0)</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-rose-400 font-bold">
                              {entry.simulation.guardrailFlags.length} Flag(s)
                            </span>
                            {entry.manualOverrides.length > 0 && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                                Overridden
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectEntry(entry)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
                            title="Load back into Studio"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => onDeleteEntry(entry.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
