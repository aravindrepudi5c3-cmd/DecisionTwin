import React, { useState } from 'react'
import {
  GitBranch,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import type { DeveloperProject } from '../../types/developer'
import { GithubIcon } from '../../components/developer/GithubIcon'

interface RepositoryViewProps {
  projects: DeveloperProject[]
  onOpenAddProject: () => void
}

export const RepositoryView: React.FC<RepositoryViewProps> = ({
  projects,
  onOpenAddProject,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '')

  const selectedProj = projects.find((p) => p.id === selectedProjectId) || projects[0]

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono">
            Repository & Codebase Metadata
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Git repository configuration, remote origins, and AST parsing readiness
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddProject}
          className="dt-dev-btn-primary text-xs py-2 px-3.5"
        >
          <Plus size={15} />
          <span>Connect Repository</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="dt-dev-card text-center py-16 border-dashed border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <GithubIcon size={24} />
          </div>
          <h3 className="text-base font-bold text-white font-mono mb-1">No Repositories Linked</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Connect a GitHub repository URL to index its software components and dependencies.
          </p>
          <button type="button" onClick={onOpenAddProject} className="dt-dev-btn-primary text-xs py-2 px-4 mx-auto">
            Connect Repository
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project List */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">
              Connected Repositories ({projects.length})
            </span>
            <div className="space-y-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedProj?.id === p.id
                      ? 'bg-sky-500/10 border-sky-500/40 text-white'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold font-mono text-sm truncate">{p.name}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {p.language || 'Code'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">
                    {p.repository_url || 'Manual Architecture'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Repository Inspection Details */}
          {selectedProj && (
            <div className="lg:col-span-2 space-y-5">
              <div className="dt-dev-card border-slate-800">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                      <GithubIcon size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-mono">{selectedProj.name}</h3>
                      <div className="text-xs text-sky-400 font-mono">
                        {selectedProj.language} • {selectedProj.framework}
                      </div>
                    </div>
                  </div>

                  {selectedProj.repository_url && (
                    <a
                      href={selectedProj.repository_url}
                      target="_blank"
                      rel="noreferrer"
                      className="dt-dev-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <GitBranch size={13} />
                      <span>Open on GitHub</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                      Repository Remote URL
                    </label>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
                      {selectedProj.repository_url || 'No external URL linked (Internal Model)'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                      <span className="text-slate-500 block mb-1">Language Parser</span>
                      <span className="text-white font-bold">{selectedProj.language || 'Python'} AST Ready</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                      <span className="text-slate-500 block mb-1">Security Isolation</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck size={14} />
                        Non-Executable Sandbox
                      </span>
                    </div>
                  </div>

                  {/* Architecture roadmap / Prompt Rule 9 */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                    <div className="font-mono font-bold text-sky-400 uppercase tracking-wide flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      <span>AST Parsing Architecture (v2 Pipeline)</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed text-[11px] font-mono">
                      DecisionTwin utilizes static analysis and declarative component boundaries. No arbitrary private code execution is permitted without user token authorization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
