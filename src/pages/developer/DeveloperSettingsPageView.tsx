import React, { useState } from 'react'
import { User, Mail, Shield, CheckCircle2, Save } from 'lucide-react'
import type { DeveloperProfile } from '../../types/auth'
import { GithubIcon } from '../../components/developer/GithubIcon'

interface DeveloperSettingsPageViewProps {
  developerUser: DeveloperProfile | null
  onUpdateProfile?: (updates: Partial<DeveloperProfile>) => void
}

export const DeveloperSettingsPageView: React.FC<DeveloperSettingsPageViewProps> = ({
  developerUser,
}) => {
  const [fullName, setFullName] = useState(developerUser?.fullName || '')
  const [githubUsername, setGithubUsername] = useState(developerUser?.githubUsername || '')
  const [repositoryUrl, setRepositoryUrl] = useState(developerUser?.repositoryUrl || '')
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    // Persist developer preference
    try {
      const cached = localStorage.getItem('decisiontwin_developer_session')
      if (cached) {
        const parsed = JSON.parse(cached)
        const updated = {
          ...parsed,
          fullName,
          githubUsername,
          repositoryUrl,
        }
        localStorage.setItem('decisiontwin_developer_session', JSON.stringify(updated))
      }
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2500)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl animate-fadeIn">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold text-white font-mono">
          Developer Workspace Settings
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          Manage your software engineer profile, GitHub identity, and simulation preferences
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 size={16} />
          <span>Developer workspace profile updated successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="dt-dev-card border-slate-800">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-5">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <User size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono">Developer Profile</h3>
            <p className="text-[11px] text-slate-400">
              Personalized engineer identity for simulation blast radius logs
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={developerUser?.email || ''}
                className="dt-dev-input opacity-70 cursor-not-allowed pl-9"
              />
              <Mail size={15} className="absolute left-3 top-3 text-slate-500" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Managed via Supabase Authentication. Role: DEVELOPER TWIN.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
              Display Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Mercer"
              className="dt-dev-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
              GitHub Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="e.g. alexmercer-dev"
                className="dt-dev-input pl-9 font-mono text-xs"
              />
              <div className="absolute left-3 top-3 text-slate-500">
                <GithubIcon size={15} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
              Primary Repository URL
            </label>
            <input
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/org/repo"
              className="dt-dev-input font-mono text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="dt-dev-btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Account Security Card */}
      <div className="dt-dev-card border-slate-800">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Shield size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono">Security & Isolation</h3>
            <p className="text-[11px] text-slate-400">
              Developer Twin Row Level Security policies
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs font-mono text-slate-400 leading-relaxed">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 size={14} />
            <span>RLS Enforced: auth.uid() = developer_id</span>
          </div>
          <p>
            Your projects, components, dependency links, change analyses, and test matrices are strictly isolated to your developer user account. Zero Manager Twin resources or organizational metrics are queried or shared.
          </p>
        </div>
      </div>
    </div>
  )
}
