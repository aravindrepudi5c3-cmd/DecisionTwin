import React from 'react'
import {
  Zap,
  Plus,
  FolderGit2,
  ArrowRight,
  Sparkles,
  History,
  Activity,
} from 'lucide-react'
import type { DeveloperProject, AnalysisHistory } from '../../types/developer'
import { DeveloperStats } from '../../components/developer/DeveloperStats'
import type { DeveloperTab } from '../../components/developer/DeveloperSidebar'

interface DeveloperOverviewViewProps {
  projects: DeveloperProject[]
  analyses: AnalysisHistory[]
  onNavigateTab: (tab: DeveloperTab) => void
  onOpenAddProject: () => void
  onLoadDemoProject: () => void
  onOpenProject: (project: DeveloperProject) => void
  isLoadingDemo: boolean
}

export const DeveloperOverviewView: React.FC<DeveloperOverviewViewProps> = ({
  projects,
  analyses,
  onNavigateTab,
  onOpenAddProject,
  onLoadDemoProject,
  onOpenProject,
  isLoadingDemo,
}) => {
  // Compute real counts
  const projectsCount = projects.length
  const analysesCount = analyses.length
  const highRiskCount = analyses.filter(
    (a) => a.impact_report?.risk_level === 'HIGH' || a.impact_report?.risk_level === 'CRITICAL'
  ).length
  const affectedComponentsCount = analyses.reduce(
    (acc, a) => acc + (a.impact_report?.affected_components || 0),
    0
  )

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-widest text-sky-400 uppercase">
              Developer Twin
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-purple-400">Simulation Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            Simulate Before You Commit
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mt-1">
            Understand the potential blast radius, architectural impact, and regression risks of your software changes before deploying to production.
          </p>
        </div>

        {/* Primary & Secondary CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('change-analyzer')}
            className="dt-dev-btn-primary"
          >
            <Zap size={16} />
            <span>Analyze New Change</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddProject}
            className="dt-dev-btn-secondary"
          >
            <Plus size={16} />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Developer Statistics Cards */}
      <DeveloperStats
        projectsCount={projectsCount}
        analysesCount={analysesCount}
        highRiskCount={highRiskCount}
        affectedComponentsCount={affectedComponentsCount}
      />

      {/* First-time Empty State / Demo Project Banner */}
      {projectsCount === 0 && (
        <div className="dt-dev-card border-dashed border-sky-500/30 bg-sky-500/5 p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto mb-3">
            <FolderGit2 size={24} />
          </div>
          <h3 className="text-lg font-bold text-white font-mono mb-1">No Projects Indexed Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
            Connect a GitHub repository, create your first project, or load the pre-configured microservices demo to run change simulations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenAddProject}
              className="dt-dev-btn-primary text-xs py-2 px-4"
            >
              <Plus size={14} />
              <span>+ Add Project</span>
            </button>
            <button
              type="button"
              onClick={onLoadDemoProject}
              disabled={isLoadingDemo}
              className="dt-dev-btn-secondary text-xs py-2 px-4 border-purple-500/30 hover:border-purple-500/60 text-purple-300"
            >
              <Sparkles size={14} />
              <span>{isLoadingDemo ? 'Seeding Architectures...' : 'Load Demo Showcase (4 Enterprise Twins)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Projects Section */}
      {projectsCount > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 size={18} className="text-sky-400" />
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                Connected Projects ({projects.length})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onLoadDemoProject}
                disabled={isLoadingDemo}
                className="hidden sm:inline-flex text-xs text-purple-400 hover:text-purple-300 font-mono items-center gap-1 border border-purple-500/30 px-2.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20"
                title="Reload the 4 pre-configured demo architectures"
              >
                <Sparkles size={12} className={isLoadingDemo ? 'animate-spin' : ''} />
                <span>{isLoadingDemo ? 'Seeding...' : 'Reload Demo Showcase'}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('projects')}
                className="text-xs text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {projects.slice(0, 4).map((proj) => (
              <div
                key={proj.id}
                className="dt-dev-card dt-dev-card-interactive flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-white text-base font-mono truncate" title={proj.name}>
                      {proj.name}
                    </h3>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {proj.language || 'Codebase'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>{proj.framework || 'Framework'}</span>
                    <span className="text-slate-500">
                      {proj.repository_url ? 'GitHub Repo Linked' : 'Manual Architecture'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onOpenProject(proj)}
                      className="dt-dev-btn-secondary text-xs py-1.5 px-3 flex-1"
                    >
                      <span>Open Project</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('change-analyzer')}
                      className="dt-dev-btn-primary text-xs py-1.5 px-3"
                      title="Analyze Change for this Project"
                    >
                      <Zap size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Simulation Analyses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-purple-400" />
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
              Recent Change Simulations ({analyses.length})
            </h2>
          </div>
          {analyses.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigateTab('history')}
              className="text-xs text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1"
            >
              <span>View History</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        {analyses.length === 0 ? (
          <div className="dt-dev-card text-center py-10">
            <History size={30} className="mx-auto text-slate-600 mb-2" />
            <h4 className="text-sm font-semibold text-white mb-1">No Analyses Run Yet</h4>
            <p className="text-xs text-slate-400 mb-4">
              Simulate a database schema modification or API change to inspect blast radius.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('change-analyzer')}
              className="dt-dev-btn-primary text-xs py-1.5 px-3 mx-auto"
            >
              <Zap size={14} />
              <span>Simulate First Change</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {analyses.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="dt-dev-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-white">
                      {a.project_name || 'Project'}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      {a.change_type}
                    </span>
                    {a.impact_report && (
                      <span
                        className={`dt-dev-risk-pill dt-dev-risk-${a.impact_report.risk_level.toLowerCase()}`}
                      >
                        {a.impact_report.risk_level}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-mono line-clamp-1">
                    {a.change_description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 flex-shrink-0">
                  <div>
                    {a.impact_report?.affected_components || 0} Affected Components
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('history')}
                    className="text-sky-400 hover:text-white"
                  >
                    View Report →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
