import React, { useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronRight, Layers, ShieldCheck, Zap } from 'lucide-react'
import type { AffectedComponentDetail, RiskLevel } from '../../types/developer'

interface ImpactGraphViewProps {
  originComponentName: string
  affectedComponents: AffectedComponentDetail[]
  riskLevel: RiskLevel
}

export const ImpactGraphView: React.FC<ImpactGraphViewProps> = ({
  originComponentName,
  affectedComponents,
  riskLevel,
}) => {
  const [selectedDetail, setSelectedDetail] = useState<AffectedComponentDetail | null>(
    affectedComponents[0] || null
  )

  const directItems = affectedComponents.filter(
    (c) => c.direct && c.component.name !== originComponentName
  )
  const transitiveItems = affectedComponents.filter((c) => !c.direct)

  return (
    <div className="dt-dev-card border border-slate-800 bg-[#070b14] p-5">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-purple-400" />
          <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
            Blast Radius Propagation Topology
          </h4>
        </div>
        <span
          className={`dt-dev-risk-pill dt-dev-risk-${riskLevel.toLowerCase()}`}
        >
          {riskLevel} RISK
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Graph Hierarchy */}
        <div className="lg:col-span-2 flex flex-col items-center gap-4 py-4 bg-slate-950/60 rounded-xl border border-slate-800/80 p-4">
          {/* Level 0: Change Origin */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider mb-1">
              [Change Origin]
            </span>
            <button
              type="button"
              onClick={() => setSelectedDetail(affectedComponents[0] || null)}
              className={`px-5 py-3 rounded-xl border-2 font-mono text-xs font-bold transition-all shadow-lg ${
                selectedDetail?.component.name === originComponentName
                  ? 'border-purple-400 bg-purple-500/20 text-white shadow-purple-500/30 ring-2 ring-purple-400/50'
                  : 'border-purple-500/60 bg-purple-500/10 text-purple-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-purple-300" />
                <span>{originComponentName}</span>
              </div>
            </button>
          </div>

          {/* Directed Connector Arrow */}
          <div className="w-0.5 h-6 bg-gradient-to-b from-purple-500 to-sky-500" />

          {/* Level 1: Direct Consumers */}
          <div className="w-full flex flex-col items-center">
            <span className="text-[10px] font-mono text-sky-400 uppercase font-bold tracking-wider mb-2">
              [Direct Affected Downstream - {directItems.length} Nodes]
            </span>
            <div className="flex flex-wrap justify-center gap-3 w-full">
              {directItems.map((item, idx) => {
                const isSelected = selectedDetail?.component.id === item.component.id
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDetail(item)}
                    className={`px-3.5 py-2 rounded-lg border text-xs font-mono font-medium transition-all ${
                      isSelected
                        ? 'border-sky-400 bg-sky-500/20 text-white shadow-sky-500/30 ring-2 ring-sky-400/40'
                        : 'border-sky-500/40 bg-sky-500/10 text-sky-200 hover:border-sky-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Layers size={13} className="text-sky-300" />
                      <span>{item.component.name}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Directed Connector Arrow if transitive items exist */}
          {transitiveItems.length > 0 && (
            <>
              <div className="w-0.5 h-6 bg-gradient-to-b from-sky-500 to-indigo-500" />

              {/* Level 2: Transitive Consumers */}
              <div className="w-full flex flex-col items-center">
                <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider mb-2">
                  [Transitive Impact Chain - {transitiveItems.length} Nodes]
                </span>
                <div className="flex flex-wrap justify-center gap-3 w-full">
                  {transitiveItems.map((item, idx) => {
                    const isSelected = selectedDetail?.component.id === item.component.id
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedDetail(item)}
                        className={`px-3.5 py-2 rounded-lg border text-xs font-mono font-medium transition-all ${
                          isSelected
                            ? 'border-indigo-400 bg-indigo-500/20 text-white shadow-indigo-500/30 ring-2 ring-indigo-400/40'
                            : 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200 hover:border-indigo-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <ChevronRight size={13} className="text-indigo-300" />
                          <span>{item.component.name}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* Connector to Tests */}
          <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500 to-emerald-500" />

          {/* Level 3: Recommended Validation Tests */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
            <ShieldCheck size={15} />
            <span>Targeted Validation & Test Suites Required</span>
          </div>
        </div>

        {/* Selected Component Inspection Panel */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
              Node Inspector
            </div>

            {selectedDetail ? (
              <div className="space-y-3">
                <div>
                  <div className="text-base font-bold text-white font-mono">
                    {selectedDetail.component.name}
                  </div>
                  <div className="text-xs text-sky-400 uppercase font-mono mt-0.5">
                    Type: {selectedDetail.component.type}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300">
                  <span className="text-slate-500 block mb-1">File Location:</span>
                  <span className="text-amber-300 break-all">
                    {selectedDetail.component.file_path || 'src/services/component.ts'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Relationship:</span>
                    <span className="font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {selectedDetail.dependencyRelationship}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Reason Affected:</span>
                    <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      {selectedDetail.reason}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Risk Contribution:</span>
                    <span className="font-mono text-rose-400 font-bold">
                      +{selectedDetail.riskContribution} Points
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs italic py-8 text-center">
                Click any component in the graph above to inspect its blast radius telemetry.
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-mono mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-sky-400" />
            <span>Deterministic Blast Radius Matrix</span>
          </div>
        </div>
      </div>
    </div>
  )
}
