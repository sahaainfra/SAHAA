import { useState, useMemo } from "react";
import {
  phases,
  summaryData,
  parallelTracks,
  phaseColors,
  phaseColorsLight,
  type Part,
  type PhaseData,
} from "../data/parts";

function PartRow({ part }: { part: Part }) {
  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {part.id}
          </span>
          {part.star && (
            <span className="text-amber-500" title="Highest defect risk — assign deliberately">
              ★
            </span>
          )}
          {part.parallel && (
            <span className="text-xs text-green-600 font-medium" title="May run in parallel with previous part">
              ‖
            </span>
          )}
          {part.status === 'complete' && (
            <span className="text-xs text-green-600 font-bold" title="Part complete">
              ✅
            </span>
          )}
          {part.status === 'rebuild' && (
            <span className="text-xs text-orange-600 font-bold" title="Part needs rebuild">
              ⚠️
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-800 max-w-md">{part.title}</td>
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
          {part.depends}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="font-mono text-sm font-semibold text-gray-700">{part.days}d</span>
      </td>
    </tr>
  );
}

function PhaseCard({
  phase,
  isExpanded,
  onToggle,
  searchQuery,
}: {
  phase: PhaseData;
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery: string;
}) {
  const filteredParts = useMemo(() => {
    if (!searchQuery) return phase.parts;
    const q = searchQuery.toLowerCase();
    return phase.parts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.depends.toLowerCase().includes(q)
    );
  }, [phase.parts, searchQuery]);

  if (searchQuery && filteredParts.length === 0) return null;

  const totalDays = phase.parts.reduce((sum, p) => sum + p.days, 0);
  const starCount = phase.parts.filter((p) => p.star).length;
  const completeCount = phase.parts.filter((p) => p.status === 'complete').length;
  const rebuildCount = phase.parts.filter((p) => p.status === 'rebuild').length;
  const allComplete = completeCount === phase.parts.length && phase.parts.length > 0;

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-200 ${phaseColorsLight[phase.phase] || "bg-white border-gray-200"}`}>
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg ${phaseColors[phase.phase]} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
            {phase.phase}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{phase.name}</h3>
              {allComplete && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                  ✅ COMPLETE
                </span>
              )}
              {rebuildCount > 0 && !allComplete && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-medium">
                  ⚠️ {rebuildCount} need rebuild
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-gray-500">{phase.parts.length} parts</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{totalDays} days</span>
              {completeCount > 0 && !allComplete && (
                <>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-green-600 font-medium">✅ {completeCount} complete</span>
                </>
              )}
              {starCount > 0 && (
                <>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-amber-600 font-medium">★ {starCount} high-risk</span>
                </>
              )}
              {phase.parallelWith && (
                <>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-green-600 font-medium">‖ {phase.parallelWith}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="bg-white border-t border-gray-200">
          {phase.gate && (
            <div className="px-5 py-3 bg-green-50 border-b border-green-200">
              <p className="text-xs text-green-800">
                <span className="font-semibold">Gate: </span>
                {phase.gate}
              </p>
            </div>
          )}
          {phase.phase === "1" && rebuildCount > 0 && (
            <div className="px-5 py-3 bg-orange-50 border-b border-orange-200">
              <p className="text-xs text-orange-800 mb-2">
                <span className="font-semibold">⚠️ Rebuild Notice: </span>
                Parts 1.2A–D are marked for rebuild. They create <code className="bg-orange-100 px-1 rounded">dx_approval_authority</code> and <code className="bg-orange-100 px-1 rounded">dx_delegation</code>, which 0.5A already creates with different columns — the migrations would fail. All four also use names the rebuilt 1.1 no longer has (<code className="bg-orange-100 px-1 rounded">sodExcludes</code>, <code className="bg-orange-100 px-1 rounded">executeAction</code>, <code className="bg-orange-100 px-1 rounded">STALE_DOCUMENT</code>).
              </p>
              <p className="text-xs text-orange-800 font-semibold">
                Do not build 1.2 from the current files.
              </p>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Part</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Depends</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Days</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.map((part) => (
                  <PartRow key={part.id} part={part} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PartIndex() {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(["0"]));
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPhase, setFilterPhase] = useState<string>("all");
  const [showLegend, setShowLegend] = useState(false);

  const togglePhase = (phase: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) {
        next.delete(phase);
      } else {
        next.add(phase);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedPhases(new Set(phases.map((p) => p.phase)));
  };

  const collapseAll = () => {
    setExpandedPhases(new Set());
  };

  const filteredPhases = useMemo(() => {
    if (filterPhase === "all") return phases;
    return phases.filter((p) => p.phase === filterPhase);
  }, [filterPhase]);

  const totalParts = phases.reduce((sum, p) => sum + p.parts.length, 0);
  const totalDays = phases.reduce((sum, p) => sum + p.parts.reduce((s, part) => s + part.days, 0), 0);
  const starParts = phases.reduce((sum, p) => sum + p.parts.filter((part) => part.star).length, 0);

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-3xl font-bold text-blue-700">{totalParts}</p>
          <p className="text-xs text-gray-500 mt-1">Total Parts</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-3xl font-bold text-indigo-700">{phases.length}</p>
          <p className="text-xs text-gray-500 mt-1">Phases</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-3xl font-bold text-amber-700">{starParts}</p>
          <p className="text-xs text-gray-500 mt-1">★ High-Risk Parts</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-3xl font-bold text-green-700">{totalDays}</p>
          <p className="text-xs text-gray-500 mt-1">Days (1 developer)</p>
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Phase Timeline</h3>
        <div className="space-y-1.5">
          {phases.map((phase) => {
            const phaseDays = phase.parts.reduce((sum, p) => sum + p.days, 0);
            const maxDays = 26;
            const width = (phaseDays / maxDays) * 100;
            return (
              <div key={phase.phase} className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-500 w-6 text-right">{phase.phase}</span>
                <div className="flex-1">
                  <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${phaseColors[phase.phase]} rounded-full flex items-center px-2 transition-all`}
                      style={{ width: `${Math.max(width, 8)}%` }}
                    >
                      <span className="text-white text-[10px] font-medium whitespace-nowrap">
                        {phase.name} ({phaseDays}d)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Parallel tracks */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Parallel Development Tracks (4 developers)</h3>
        <p className="text-sm text-gray-600 mb-4">
          With a team of four working the parallel tracks: roughly <strong>14–16 months</strong>.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {parallelTracks.map((track) => {
            const colorMap: Record<string, string> = {
              blue: "border-blue-300 bg-blue-50",
              purple: "border-purple-300 bg-purple-50",
              green: "border-green-300 bg-green-50",
              amber: "border-amber-300 bg-amber-50",
            };
            const textColorMap: Record<string, string> = {
              blue: "text-blue-800",
              purple: "text-purple-800",
              green: "text-green-800",
              amber: "text-amber-800",
            };
            return (
              <div key={track.track} className={`rounded-lg border p-4 ${colorMap[track.color]}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-bold text-lg ${textColorMap[track.color]}`}>Track {track.track}</span>
                  <span className="text-xs text-gray-500">{track.description}</span>
                </div>
                <p className={`text-sm font-mono ${textColorMap[track.color]}`}>{track.path}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search parts by title, ID, or dependency..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
          />
        </div>
        <select
          value={filterPhase}
          onChange={(e) => setFilterPhase(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm bg-white"
        >
          <option value="all">All Phases</option>
          {phases.map((p) => (
            <option key={p.phase} value={p.phase}>
              Phase {p.phase}: {p.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
          >
            Collapse
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          <svg className={`w-4 h-4 transition-transform ${showLegend ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Legend
        </button>
        {showLegend && (
          <div className="mt-2 bg-gray-50 rounded-lg border border-gray-200 p-4 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">★</span>
              <span className="text-sm text-gray-600">Highest defect risk — assign deliberately</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-medium text-sm">‖</span>
              <span className="text-sm text-gray-600">May run in parallel with previous part (different developer)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-700">2.5d</span>
              <span className="text-sm text-gray-600">Days for one developer, including testing</span>
            </div>
          </div>
        )}
      </div>

      {/* Phase cards */}
      <div className="space-y-3">
        {filteredPhases.map((phase) => (
          <PhaseCard
            key={phase.phase}
            phase={phase}
            isExpanded={expandedPhases.has(phase.phase)}
            onToggle={() => togglePhase(phase.phase)}
            searchQuery={searchQuery}
          />
        ))}
      </div>

      {/* Summary table */}
      <div className="mt-10">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Summary</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Phase</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Parts</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Days (1 dev)</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Days (parallel)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summaryData.map((row) => (
                <tr key={row.phase} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-900">{row.phase}</td>
                  <td className="px-4 py-2.5 text-center font-mono">{row.parts}</td>
                  <td className="px-4 py-2.5 text-center font-mono">{row.days1dev}</td>
                  <td className="px-4 py-2.5 text-center font-mono">{row.daysParallel}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 border-t-2 border-gray-300">
              <tr>
                <td className="px-4 py-3 font-bold text-gray-900">Total</td>
                <td className="px-4 py-3 text-center font-bold font-mono text-lg">175</td>
                <td className="px-4 py-3 text-center font-bold font-mono">~296</td>
                <td className="px-4 py-3 text-center font-bold font-mono">~265</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            <strong>With a team of four working the parallel tracks: roughly 14–16 months.</strong> That is the realistic figure for a system of this scope. Treat any shorter estimate with suspicion — the previous 46-part series implied roughly half this, and the gap between the two numbers is exactly the detail that was missing when the build stalled.
          </p>
        </div>
      </div>
    </div>
  );
}
