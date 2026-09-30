import React, { useState } from 'react'
import { X, FolderGit2, AlertCircle } from 'lucide-react'
import type { DeveloperProject } from '../../types/developer'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: {
    name: string
    description?: string
    repository_url?: string
    language?: string
    framework?: string
  }) => Promise<void>
  initialProject?: DeveloperProject | null
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProject,
}) => {
  const [name, setName] = useState(initialProject?.name || '')
  const [description, setDescription] = useState(initialProject?.description || '')
  const [repositoryUrl, setRepositoryUrl] = useState(initialProject?.repository_url || '')
  const [language, setLanguage] = useState(initialProject?.language || 'Python')
  const [framework, setFramework] = useState(initialProject?.framework || 'FastAPI')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Project name is required.')
      return
    }

    if (repositoryUrl.trim() && !repositoryUrl.startsWith('http://') && !repositoryUrl.startsWith('https://')) {
      setError('Please provide a valid repository URL (e.g. https://github.com/org/repo).')
      return
    }

    try {
      setIsSubmitting(true)
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        repository_url: repositoryUrl.trim() || undefined,
        language: language.trim() || undefined,
        framework: framework.trim() || undefined,
      })
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to save project. Please check database permissions.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="dt-dev-modal-backdrop">
      <div className="dt-dev-modal">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <FolderGit2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialProject ? 'Edit Project' : 'Add Project / Repository'}
              </h3>
              <p className="text-xs text-slate-400">
                Connect a software codebase for blast-radius impact analysis
              </p>
            </div>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-white p-1 rounded-lg"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
              Project Name <span className="text-sky-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. E-Commerce Backend"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="dt-dev-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Online shopping microservice architecture and payment gateway"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="dt-dev-input resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
              GitHub Repository URL
            </label>
            <input
              type="url"
              placeholder="https://github.com/example/ecommerce-backend"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              className="dt-dev-input"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Supports public repository structure and metadata inspection.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
                Language
              </label>
              <input
                type="text"
                placeholder="Python, TypeScript, Go..."
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="dt-dev-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
                Framework
              </label>
              <input
                type="text"
                placeholder="FastAPI, Next.js, Express..."
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="dt-dev-input"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              className="dt-dev-btn-secondary py-2 px-4 text-xs"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dt-dev-btn-primary py-2 px-4 text-xs"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : initialProject ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
