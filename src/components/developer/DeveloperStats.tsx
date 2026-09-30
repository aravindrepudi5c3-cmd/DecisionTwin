import React from 'react'
import { FolderGit2, Activity, AlertTriangle, Layers } from 'lucide-react'

interface DeveloperStatsProps {
  projectsCount: number
  analysesCount: number
  highRiskCount: number
  affectedComponentsCount: number
}

export const DeveloperStats: React.FC<DeveloperStatsProps> = ({
  projectsCount,
  analysesCount,
  highRiskCount,
  affectedComponentsCount,
}) => {
  const statCards = [
    {
      label: 'Connected Projects',
      value: projectsCount,
      icon: <FolderGit2 size={20} className="text-sky-400" />,
      subtext: 'Software repositories indexed',
      accentColor: 'border-sky-500/20 bg-sky-500/5',
    },
    {
      label: 'Code Analyses',
      value: analysesCount,
      icon: <Activity size={20} className="text-purple-400" />,
      subtext: 'Simulated blast radiuses',
      accentColor: 'border-purple-500/20 bg-purple-500/5',
    },
    {
      label: 'High-Risk Changes',
      value: highRiskCount,
      icon: <AlertTriangle size={20} className="text-rose-400" />,
      subtext: 'High & Critical blast scores',
      accentColor: 'border-rose-500/20 bg-rose-500/5',
    },
    {
      label: 'Affected Components',
      value: affectedComponentsCount,
      icon: <Layers size={20} className="text-cyan-400" />,
      subtext: 'Downstream microservice nodes',
      accentColor: 'border-cyan-500/20 bg-cyan-500/5',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className={`dt-dev-card flex flex-col justify-between border ${card.accentColor}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              {card.label}
            </span>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              {card.icon}
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {card.value}
            </div>
            <div className="text-xs text-slate-400 mt-1">{card.subtext}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
