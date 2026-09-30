import React, { useState } from 'react'
import {
  FolderGit2,
  Plus,
  GitBranch,
  Trash2,
  Edit2,
  Zap,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import type { DeveloperProject } from '../../types/developer'

interface MyProjectsViewProps {
  projects: DeveloperProject[]
  onOpenProject: (project: DeveloperProject) => void
  onAddProject: () => void
  onEditProject: (project: DeveloperProject) => void
  onDeleteProject: (projectId: string) => Promise<void>
  onAnalyzeProject: (project: DeveloperProject) => void
  onLoadDemoProject: () => void
  isLoadingDemo: boolean
}

export const MyProjectsView: React.FC<MyProjectsViewProps> = ({
  projects,
  onOpenProject,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onAnalyzeProject,
  onLoadDemoProject,
  isLoadingDemo,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (projectId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete project "${name}" and all its components?`)) {
      try {
        setDeletingId(projectId)
        await onDeleteProject(projectId)
      } finally {
        setDeletingId(null)
      }
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono">
            My Projects & Repositories
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Registered codebases and microservice systems configured for blast-radius simulation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {projects.length === 0 && (
            <button
              type="button"
              onClick={onLoadDemoProject}
              disabled={isLoadingDemo}
              className="dt-dev-btn-secondary text-xs py-2 px-3 border-purple-500/30 text-purple-300"
            >
              <Sparkles size={14} />
              <span>{isLoadingDemo ? 'Loading Demo...' : 'Load Demo Project'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onAddProject}
            className="dt-dev-btn-primary text-xs py-2 px-3.5"
          >
            <Plus size={15} />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="dt-dev-card text-center py-16 border-dashed border-slate-800">
          <FolderGit2 size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white font-mono mb-1">No Projects Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            Add a project with its repository link or load the demo project to start modeling software architecture.
          </p>
          <div className="flex justify-center gap-3">
            <button type="button" onClick={onAddProject} className="dt-dev-btn-primary text-xs py-2 px-4">
              <Plus size={14} />
              <span>+ Add Project</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="dt-dev-card dt-dev-card-interactive flex flex-col justify-between"
            >
              <div>
                {/* Header tag */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-white font-mono truncate" title={proj.name}>
                      {proj.name}
                    </h3>
                    <div className="text-xs text-sky-400 font-mono mt-0.5">
                      {proj.language || 'Multi-language'} • {proj.framework || 'Framework'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditProject(proj)}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                      title="Edit Project"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(proj.id, proj.name)}
                      disabled={deletingId === proj.id}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800"
                      title="Delete Project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {proj.description || 'No description provided for this codebase.'}
                </p>

                {/* Repository URL */}
                {proj.repository_url ? (
                  <a
                    href={proj.repository_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-purple-400 hover:text-purple-300 mb-4 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20 max-w-full truncate"
                  >
                    <GitBranch size={12} className="flex-shrink-0" />
                    <span className="truncate">{proj.repository_url.replace('https://github.com/', '')}</span>
                    <ExternalLink size={10} className="flex-shrink-0" />
                  </a>
                ) : (
                  <div className="text-[11px] font-mono text-slate-500 mb-4">
                    Local Architecture Workspace
                  </div>
                )}
              </div>

              {/* Actions & Metrics */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenProject(proj)}
                    className="dt-dev-btn-secondary text-xs py-1.5 px-3 flex-1"
                  >
                    <span>Open Project</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onAnalyzeProject(proj)}
                    className="dt-dev-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Zap size={13} />
                    <span>Analyze Change</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
