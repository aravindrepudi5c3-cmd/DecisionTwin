import React, { useState } from 'react'
import { X, Layers, AlertCircle } from 'lucide-react'
import type { DeveloperComponent, ComponentType } from '../../types/developer'

interface ComponentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: { name: string; type: string; file_path?: string }) => Promise<void>
  initialComponent?: DeveloperComponent | null
}

const COMPONENT_TYPES: ComponentType[] = [
  'service',
  'API',
  'backend',
  'frontend',
  'database',
  'middleware',
  'module',
  'component',
]

export const ComponentModal: React.FC<ComponentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialComponent,
}) => {
  const [name, setName] = useState(initialComponent?.name || '')
  const [type, setType] = useState(initialComponent?.type || 'service')
  const [filePath, setFilePath] = useState(initialComponent?.file_path || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Component name is required.')
      return
    }

    try {
      setIsSubmitting(true)
      await onSave({
        name: name.trim(),
        type,
        file_path: filePath.trim() || undefined,
      })
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to save component.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="dt-dev-modal-backdrop">
      <div className="dt-dev-modal">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialComponent ? 'Edit Component' : 'Add Component'}
              </h3>
              <p className="text-xs text-slate-400">
                Register a microservice, database model, or API module
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
              Component Name <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Customer Service"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="dt-dev-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
              Component Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="dt-dev-input"
            >
              {COMPONENT_TYPES.map((t) => (
                <option key={t} value={t} className="bg-slate-900 text-white">
                  {t.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
              Source File Path
            </label>
            <input
              type="text"
              placeholder="e.g. src/services/customer_service.py"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              className="dt-dev-input font-mono text-xs"
            />
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
              {isSubmitting ? 'Saving...' : initialComponent ? 'Update' : 'Add Component'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
