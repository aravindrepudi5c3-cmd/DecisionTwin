import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  GitBranch,
  Layers,
  GitFork,
  Activity,
  Plus,
  Trash2,
  Edit2,
  Zap,
  ExternalLink,
  Network,
} from 'lucide-react'
import type {
  DeveloperProject,
  DeveloperComponent,
  DeveloperDependency,
  AnalysisHistory,
} from '../../types/developer'
import { componentService } from '../../services/developer/componentService'
import { dependencyService } from '../../services/developer/dependencyService'
import { analysisService } from '../../services/developer/analysisService'
import { DependencyGraphView } from '../../components/developer/DependencyGraphView'
import { ComponentModal } from '../../components/developer/ComponentModal'
import { DependencyModal } from '../../components/developer/DependencyModal'

interface ProjectDetailsViewProps {
  project: DeveloperProject
  developerId: string
  onBack: () => void
  onNavigateToAnalyzer: (project: DeveloperProject, component?: DeveloperComponent) => void
}

type DetailTab = 'overview' | 'components' | 'dependencies' | 'graph' | 'history'

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({
  project,
  developerId,
  onBack,
  onNavigateToAnalyzer,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const [components, setComponents] = useState<DeveloperComponent[]>([])
  const [dependencies, setDependencies] = useState<DeveloperDependency[]>([])
  const [analyses, setAnalyses] = useState<AnalysisHistory[]>([])

  // Modals state
  const [isCompModalOpen, setIsCompModalOpen] = useState(false)
  const [editingComp, setEditingComp] = useState<DeveloperComponent | null>(null)
  const [isDepModalOpen, setIsDepModalOpen] = useState(false)

  const loadProjectData = async () => {
    const [comps, deps, hist] = await Promise.all([
      componentService.getComponents(project.id),
      dependencyService.getDependencies(project.id),
      analysisService.getAnalysisHistory(developerId, project.id),
    ])
    setComponents(comps)
    setDependencies(deps)
    setAnalyses(hist)
  }

  useEffect(() => {
    loadProjectData()
  }, [project.id, developerId])

  // Component Actions
  const handleSaveComponent = async (payload: { name: string; type: string; file_path?: string }) => {
    if (editingComp) {
      await componentService.updateComponent(project.id, editingComp.id, payload)
    } else {
      await componentService.createComponent(project.id, payload)
    }
    await loadProjectData()
  }

  const handleDeleteComponent = async (componentId: string, name: string) => {
    if (window.confirm(`Delete component "${name}"? Connected dependencies will be removed.`)) {
      await componentService.deleteComponent(project.id, componentId)
      await loadProjectData()
    }
  }

  // Dependency Actions
  const handleSaveDependency = async (payload: {
    source_component_id: string
    target_component_id: string
    dependency_type: string
  }) => {
    await dependencyService.createDependency(project.id, payload)
    await loadProjectData()
  }

  const handleDeleteDependency = async (depId: string) => {
    if (window.confirm('Delete this dependency link?')) {
      await dependencyService.deleteDependency(project.id, depId)
      await loadProjectData()
    }
  }

  const compMap = new Map(components.map((c) => [c.id, c.name]))
  const highRiskAnalyses = analyses.filter(
    (a) => a.impact_report?.risk_level === 'HIGH' || a.impact_report?.risk_level === 'CRITICAL'
  ).length

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back button & Project Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            title="Back to Projects"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">{project.name}</h1>
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {project.language || 'Architecture'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {project.description || 'Microservice and architectural model'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {project.repository_url && (
            <a
              href={project.repository_url}
              target="_blank"
              rel="noreferrer"
              className="dt-dev-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <GitBranch size={13} />
              <span>Repository</span>
              <ExternalLink size={11} />
            </a>
          )}
          <button
            type="button"
            onClick={() => onNavigateToAnalyzer(project)}
            className="dt-dev-btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Zap size={14} />
            <span>Analyze New Change</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 overflow-x-auto pb-1 text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'overview'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('graph')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'graph'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Network size={14} />
          <span>Dependency Graph ({components.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('components')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'components'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers size={14} />
          <span>Components ({components.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dependencies')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'dependencies'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <GitFork size={14} />
          <span>Dependencies ({dependencies.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity size={14} />
          <span>History ({analyses.length})</span>
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="dt-dev-card border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Total Components
              </span>
              <div className="text-2xl font-bold text-white font-mono">{components.length}</div>
            </div>
            <div className="dt-dev-card border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Total Dependencies
              </span>
              <div className="text-2xl font-bold text-purple-400 font-mono">{dependencies.length}</div>
            </div>
            <div className="dt-dev-card border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Total Analyses
              </span>
              <div className="text-2xl font-bold text-sky-400 font-mono">{analyses.length}</div>
            </div>
            <div className="dt-dev-card border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                High-Risk Analyses
              </span>
              <div className="text-2xl font-bold text-rose-400 font-mono">{highRiskAnalyses}</div>
            </div>
          </div>

          {/* Quick Graph Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Architecture Topology
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('graph')}
                className="text-xs text-sky-400 hover:text-white font-mono"
              >
                Expand Interactive Graph →
              </button>
            </div>
            <DependencyGraphView
              components={components}
              dependencies={dependencies}
              onSelectComponent={(c) => onNavigateToAnalyzer(project, c)}
            />
          </div>
        </div>
      )}

      {/* Tab: Graph */}
      {activeTab === 'graph' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Click any component node to trigger a simulated code change.</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingComp(null)
                  setIsCompModalOpen(true)
                }}
                className="dt-dev-btn-secondary py-1 px-2.5 text-xs"
              >
                + Component
              </button>
              <button
                type="button"
                onClick={() => setIsDepModalOpen(true)}
                className="dt-dev-btn-secondary py-1 px-2.5 text-xs"
              >
                + Dependency Link
              </button>
            </div>
          </div>
          <DependencyGraphView
            components={components}
            dependencies={dependencies}
            onSelectComponent={(c) => onNavigateToAnalyzer(project, c)}
          />
        </div>
      )}

      {/* Tab: Components */}
      {activeTab === 'components' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono">
              Project Components ({components.length})
            </h3>
            <button
              type="button"
              onClick={() => {
                setEditingComp(null)
                setIsCompModalOpen(true)
              }}
              className="dt-dev-btn-primary text-xs py-1.5 px-3"
            >
              <Plus size={14} />
              <span>Add Component</span>
            </button>
          </div>

          {components.length === 0 ? (
            <div className="dt-dev-card text-center py-10">
              <Layers size={30} className="mx-auto text-slate-600 mb-2" />
              <p className="text-xs text-slate-400">No components registered yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {components.map((c) => (
                <div
                  key={c.id}
                  className="dt-dev-card p-4 flex flex-col justify-between border-slate-800"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white font-mono truncate">{c.name}</h4>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {c.type}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 break-all mb-3">
                      {c.file_path || 'No source file specified'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => onNavigateToAnalyzer(project, c)}
                      className="text-xs text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1"
                    >
                      <Zap size={12} />
                      <span>Simulate Change</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingComp(c)
                          setIsCompModalOpen(true)
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteComponent(c.id, c.name)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Dependencies */}
      {activeTab === 'dependencies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono">
              Dependency Links ({dependencies.length})
            </h3>
            <button
              type="button"
              onClick={() => setIsDepModalOpen(true)}
              className="dt-dev-btn-primary text-xs py-1.5 px-3"
            >
              <Plus size={14} />
              <span>Connect Dependency</span>
            </button>
          </div>

          {dependencies.length === 0 ? (
            <div className="dt-dev-card text-center py-10">
              <GitFork size={30} className="mx-auto text-slate-600 mb-2" />
              <p className="text-xs text-slate-400">No dependency relationships defined.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dependencies.map((d) => (
                <div
                  key={d.id}
                  className="dt-dev-card p-3 flex items-center justify-between border-slate-800"
                >
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-white font-bold">
                      {compMap.get(d.source_component_id) || 'Unknown Source'}
                    </span>
                    <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 text-[10px]">
                      {d.dependency_type}
                    </span>
                    <span className="text-slate-500">→</span>
                    <span className="text-sky-400 font-bold">
                      {compMap.get(d.target_component_id) || 'Unknown Target'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteDependency(d.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800"
                    title="Remove Dependency Link"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white font-mono">
            Analysis History for {project.name} ({analyses.length})
          </h3>
          {analyses.length === 0 ? (
            <div className="dt-dev-card text-center py-10">
              <Activity size={30} className="mx-auto text-slate-600 mb-2" />
              <p className="text-xs text-slate-400">No analyses run yet for this project.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.map((a) => (
                <div key={a.id} className="dt-dev-card p-4 border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-sky-400">
                        {a.change_type}
                      </span>
                      {a.impact_report && (
                        <span
                          className={`dt-dev-risk-pill dt-dev-risk-${a.impact_report.risk_level.toLowerCase()}`}
                        >
                          {a.impact_report.risk_level} RISK
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mb-2">{a.change_description}</p>
                  {a.impact_report && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                      {a.impact_report.impact_summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Component Modal */}
      <ComponentModal
        isOpen={isCompModalOpen}
        onClose={() => {
          setIsCompModalOpen(false)
          setEditingComp(null)
        }}
        onSave={handleSaveComponent}
        initialComponent={editingComp}
      />

      {/* Dependency Modal */}
      <DependencyModal
        isOpen={isDepModalOpen}
        onClose={() => setIsDepModalOpen(false)}
        components={components}
        onSave={handleSaveDependency}
      />
    </div>
  )
}
