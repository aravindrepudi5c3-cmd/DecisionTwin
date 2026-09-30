import React, { useState } from 'react'
import { X, GitFork, AlertCircle } from 'lucide-react'
import type { DeveloperComponent, DependencyType } from '../../types/developer'

interface DependencyModalProps {
  isOpen: boolean
  onClose: () => void
  components: DeveloperComponent[]
  onSave: (payload: {
    source_component_id: string
    target_component_id: string
    dependency_type: string
  }) => Promise<void>
}

const DEPENDENCY_TYPES: DependencyType[] = [
  'calls',
  'depends_on',
  'imports',
  'uses',
  'database_access',
  'API_call',
]

export const DependencyModal: React.FC<DependencyModalProps> = ({
  isOpen,
  onClose,
  components,
  onSave,
}) => {
  const [sourceId, setSourceId] = useState(components[0]?.id || '')
  const [targetId, setTargetId] = useState(components[1]?.id || components[0]?.id || '')
  const [depType, setDepType] = useState<DependencyType>('calls')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!sourceId || !targetId) {
      setError('Please select both source and target components.')
      return
    }

    if (sourceId === targetId) {
      setError('A component cannot have a self-dependency loop.')
      return
    }

    try {
      setIsSubmitting(true)
      await onSave({
        source_component_id: sourceId,
        target_component_id: targetId,
        dependency_type: depType,
      })
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to create dependency link.')
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
              <GitFork size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Dependency Link</h3>
              <p className="text-xs text-slate-400">
                Connect components to model architectural blast radiuses
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
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
              Source Component (Caller / Consumer)
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="dt-dev-input"
            >
              {components.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
              Dependency Type
            </label>
            <select
              value={depType}
              onChange={(e) => setDepType(e.target.value as DependencyType)}
              className="dt-dev-input"
            >
              {DEPENDENCY_TYPES.map((t) => (
                <option key={t} value={t} className="bg-slate-900 text-white">
                  {t.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
              Target Component (Dependency)
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="dt-dev-input"
            >
              {components.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            <span className="text-white font-medium">Simulation impact: </span>
            Changes to the target will propagate downstream to the source component during blast radius calculation.
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
              {isSubmitting ? 'Connecting...' : 'Connect Dependency'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
