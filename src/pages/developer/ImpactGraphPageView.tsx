import React, { useState, useEffect } from 'react'
import { Network, Zap } from 'lucide-react'
import type { DeveloperProject, DeveloperComponent, DeveloperDependency } from '../../types/developer'
import { componentService } from '../../services/developer/componentService'
import { dependencyService } from '../../services/developer/dependencyService'
import { DependencyGraphView } from '../../components/developer/DependencyGraphView'

interface ImpactGraphPageViewProps {
  projects: DeveloperProject[]
  onNavigateToAnalyzer: (project: DeveloperProject, component?: DeveloperComponent) => void
}

export const ImpactGraphPageView: React.FC<ImpactGraphPageViewProps> = ({
  projects,
  onNavigateToAnalyzer,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '')
  const [components, setComponents] = useState<DeveloperComponent[]>([])
  const [dependencies, setDependencies] = useState<DeveloperDependency[]>([])
  const [selectedComp, setSelectedComp] = useState<DeveloperComponent | null>(null)

  const loadData = async (projId: string) => {
    if (!projId) return
    const [comps, deps] = await Promise.all([
      componentService.getComponents(projId),
      dependencyService.getDependencies(projId),
    ])
    setComponents(comps)
    setDependencies(deps)
    setSelectedComp(comps[0] || null)
  }

  useEffect(() => {
    if (selectedProjectId) {
      loadData(selectedProjectId)
    }
  }, [selectedProjectId])

  const selectedProj = projects.find((p) => p.id === selectedProjectId)

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono">
            Interactive Architecture & Impact Graph
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Visualize component topologies, microservice callers, and upstream/downstream boundaries
          </p>
        </div>

        {/* Project Selector */}
        {projects.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 uppercase">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="dt-dev-input py-1.5 px-3 text-xs w-auto min-w-[200px]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="dt-dev-card text-center py-16">
          <Network size={36} className="mx-auto text-slate-600 mb-2" />
          <h3 className="text-base font-bold text-white mb-1">No Projects Available</h3>
          <p className="text-xs text-slate-400">
            Create a project or load the demo architecture to visualize its impact graph.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {components.length} Components • {dependencies.length} Directed Dependency Edges
              </span>
            </div>
            {selectedComp && selectedProj && (
              <button
                type="button"
                onClick={() => onNavigateToAnalyzer(selectedProj, selectedComp)}
                className="dt-dev-btn-primary py-1 px-3 text-xs flex items-center gap-1.5"
              >
                <Zap size={13} />
                <span>Simulate Change for {selectedComp.name}</span>
              </button>
            )}
          </div>

          <DependencyGraphView
            components={components}
            dependencies={dependencies}
            onSelectComponent={(c) => setSelectedComp(c)}
            highlightedComponentId={selectedComp?.id}
          />
        </div>
      )}
    </div>
  )
}
