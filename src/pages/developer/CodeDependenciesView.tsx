import React, { useState, useEffect } from 'react'
import { GitFork, Plus, Trash2 } from 'lucide-react'
import type { DeveloperProject, DeveloperComponent, DeveloperDependency } from '../../types/developer'
import { componentService } from '../../services/developer/componentService'
import { dependencyService } from '../../services/developer/dependencyService'
import { DependencyModal } from '../../components/developer/DependencyModal'

interface CodeDependenciesViewProps {
  projects: DeveloperProject[]
}

export const CodeDependenciesView: React.FC<CodeDependenciesViewProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '')
  const [components, setComponents] = useState<DeveloperComponent[]>([])
  const [dependencies, setDependencies] = useState<DeveloperDependency[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadData = async (projId: string) => {
    if (!projId) return
    const [comps, deps] = await Promise.all([
      componentService.getComponents(projId),
      dependencyService.getDependencies(projId),
    ])
    setComponents(comps)
    setDependencies(deps)
  }

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])

  useEffect(() => {
    if (selectedProjectId) {
      loadData(selectedProjectId)
    }
  }, [selectedProjectId])

  const handleAddDependency = async (payload: {
    source_component_id: string
    target_component_id: string
    dependency_type: string
  }) => {
    await dependencyService.createDependency(selectedProjectId, payload)
    await loadData(selectedProjectId)
  }

  const handleDeleteDependency = async (depId: string) => {
    if (window.confirm('Delete this dependency link?')) {
      await dependencyService.deleteDependency(selectedProjectId, depId)
      await loadData(selectedProjectId)
    }
  }

  const compMap = new Map(components.map((c) => [c.id, c]))

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono">
            Code Dependencies Matrix
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Microservice coupling, call boundaries, and inter-service database access mappings
          </p>
        </div>

        <div className="flex items-center gap-3">
          {projects.length > 0 && (
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
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={components.length < 2}
            className="dt-dev-btn-primary text-xs py-2 px-3.5"
            title={components.length < 2 ? 'Need at least 2 components' : ''}
          >
            <Plus size={15} />
            <span>Connect Dependency</span>
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="dt-dev-card text-center py-16">
          <GitFork size={36} className="mx-auto text-slate-600 mb-2" />
          <h3 className="text-base font-bold text-white mb-1">No Projects Found</h3>
          <p className="text-xs text-slate-400">
            Create a project or load demo data to view component dependencies.
          </p>
        </div>
      ) : dependencies.length === 0 ? (
        <div className="dt-dev-card text-center py-16 border-dashed border-slate-800">
          <GitFork size={36} className="mx-auto text-slate-600 mb-2" />
          <h3 className="text-base font-bold text-white font-mono mb-1">
            No Dependencies Defined
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Connect components using imports, calls, depends_on, or database_access relationships.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={components.length < 2}
            className="dt-dev-btn-primary text-xs py-2 px-4 mx-auto"
          >
            + Connect Dependency Link
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {dependencies.map((dep) => {
            const src = compMap.get(dep.source_component_id)
            const tgt = compMap.get(dep.target_component_id)

            return (
              <div
                key={dep.id}
                className="dt-dev-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-800"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Source */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs font-mono">
                      SRC
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono">
                        {src?.name || 'Unknown Component'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {src?.file_path || 'source file'}
                      </div>
                    </div>
                  </div>

                  {/* Relationship Badge */}
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
                    <span className="text-purple-400 font-bold uppercase text-[11px]">
                      {dep.dependency_type}
                    </span>
                    <span className="text-slate-500">→</span>
                  </div>

                  {/* Target */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs font-mono">
                      TGT
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono">
                        {tgt?.name || 'Unknown Component'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {tgt?.file_path || 'source file'}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteDependency(dep.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 self-end sm:self-center"
                  title="Remove Dependency"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Dependency Modal */}
      <DependencyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        components={components}
        onSave={handleAddDependency}
      />
    </div>
  )
}
