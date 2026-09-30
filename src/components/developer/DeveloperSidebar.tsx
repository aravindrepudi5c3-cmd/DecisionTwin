import React from 'react'
import {
  LayoutDashboard,
  FolderGit2,
  GitBranch,
  Zap,
  Network,
  GitFork,
  CheckSquare,
  History,
  Settings,
  LogOut,
  X,
  Code2,
} from 'lucide-react'

export type DeveloperTab =
  | 'overview'
  | 'projects'
  | 'repository'
  | 'change-analyzer'
  | 'impact-graph'
  | 'dependencies'
  | 'test-recommendations'
  | 'history'
  | 'settings'

interface DeveloperSidebarProps {
  activeTab: DeveloperTab
  setActiveTab: (tab: DeveloperTab) => void
  onLogout: () => void
  isOpen: boolean
  onClose: () => void
}

export const DeveloperSidebar: React.FC<DeveloperSidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  isOpen,
  onClose,
}) => {
  const navItems: Array<{ id: DeveloperTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'projects', label: 'My Projects', icon: <FolderGit2 size={18} /> },
    { id: 'repository', label: 'Repository', icon: <GitBranch size={18} /> },
    { id: 'change-analyzer', label: 'Change Analyzer', icon: <Zap size={18} /> },
    { id: 'impact-graph', label: 'Impact Graph', icon: <Network size={18} /> },
    { id: 'dependencies', label: 'Code Dependencies', icon: <GitFork size={18} /> },
    { id: 'test-recommendations', label: 'Test Recommendations', icon: <CheckSquare size={18} /> },
    { id: 'history', label: 'Analysis History', icon: <History size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`dt-dev-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand header */}
        <div className="dt-dev-sidebar-brand flex items-center justify-between">
          <div className="dt-dev-logo-wrap">
            <div className="dt-dev-logo-icon">D</div>
            <div>
              <div className="text-xs font-mono font-bold tracking-widest text-sky-400 uppercase">
                DecisionTwin
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
                <Code2 size={14} className="text-purple-400" />
                Developer Twin
              </div>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden text-slate-400 hover:text-white p-1"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="dt-dev-sidebar-nav">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 px-3 mb-1">
            Simulation Platform
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id)
                  onClose()
                }}
                className={`dt-dev-nav-item ${isActive ? 'active' : ''}`}
              >
                {isActive && <span className="dt-dev-nav-indicator" />}
                <span className={isActive ? 'text-sky-400' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Sidebar footer with Logout */}
        <div className="dt-dev-sidebar-footer">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-400">
            <div className="text-white font-medium flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Engine v2.4 Active
            </div>
            <div className="text-[11px] text-slate-500">Deterministic Impact Engine</div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="dt-dev-nav-item text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/20"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
