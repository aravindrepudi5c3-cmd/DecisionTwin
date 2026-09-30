import React from 'react'
import { Menu, Zap, Database } from 'lucide-react'
import type { DeveloperProfile } from '../../types/auth'
import { isSupabaseConfigured } from '../../services/supabase'
import { GithubIcon } from './GithubIcon'

interface DeveloperHeaderProps {
  developerUser: DeveloperProfile | null
  onOpenMobileSidebar: () => void
  onQuickAnalyze: () => void
}

export const DeveloperHeader: React.FC<DeveloperHeaderProps> = ({
  developerUser,
  onOpenMobileSidebar,
  onQuickAnalyze,
}) => {
  return (
    <header className="dt-dev-topbar">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          onClick={onOpenMobileSidebar}
        >
          <Menu size={22} />
        </button>

        <div className="hidden sm:block">
          <div className="text-xs uppercase font-mono tracking-widest text-slate-400">
            Developer Workspace
          </div>
          <div className="text-sm font-semibold text-slate-200">
            Simulate Before You Commit
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* DB Connection Status */}
        <div
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border"
          style={{
            background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(56, 189, 248, 0.1)',
            borderColor: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.3)',
            color: isSupabaseConfigured ? '#34d399' : '#38bdf8',
          }}
          title={isSupabaseConfigured ? 'Connected to live Supabase PostgreSQL' : 'Local Sandbox Mode Active'}
        >
          <Database size={12} />
          <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Sandbox Ready'}</span>
        </div>

        {/* Quick CTA */}
        <button
          type="button"
          onClick={onQuickAnalyze}
          className="dt-dev-btn-primary py-1.5 px-3 text-xs"
        >
          <Zap size={14} />
          <span>Analyze Change</span>
        </button>

        {/* User Chip */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {developerUser?.fullName ? developerUser.fullName.slice(0, 2).toUpperCase() : 'DV'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">
              {developerUser?.fullName || 'Developer'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <GithubIcon size={11} />
              <span>{developerUser?.githubUsername || 'connected'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
