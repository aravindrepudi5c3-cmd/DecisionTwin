import React, { useState, useEffect } from 'react'
import {
  Play,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Save,
  Sparkles,
} from 'lucide-react'
import type {
  DeveloperProject,
  DeveloperComponent,
  DeveloperDependency,
  ChangeType,
  ImpactAnalysisSimulation,
} from '../../types/developer'
import { componentService } from '../../services/developer/componentService'
import { dependencyService } from '../../services/developer/dependencyService'
import { analysisService } from '../../services/developer/analysisService'
import { simulateChangeImpact } from '../../services/developer/engine/impactEngine'
import { AnalysisProgressModal } from '../../components/developer/AnalysisProgressModal'
import { ImpactGraphView } from '../../components/developer/ImpactGraphView'

const CHANGE_TYPES: ChangeType[] = [
  'Database Schema Change',
  'API Change',
  'Function Change',
  'Component Change',
  'Dependency Change',
  'Configuration Change',
  'Authentication Change',
  'Data Type Change',
  'Architecture Change',
]

interface ChangeAnalyzerViewProps {
  projects: DeveloperProject[]
  developerId: string
  initialProject?: DeveloperProject | null
  initialComponent?: DeveloperComponent | null
  onAnalysisSaved?: () => void
}

export const ChangeAnalyzerView: React.FC<ChangeAnalyzerViewProps> = ({
  projects,
  developerId,
  initialProject,
  initialComponent,
  onAnalysisSaved,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProject?.id || projects[0]?.id || ''
  )
  const [components, setComponents] = useState<DeveloperComponent[]>([])
  const [dependencies, setDependencies] = useState<DeveloperDependency[]>([])
  const [selectedComponentId, setSelectedComponentId] = useState<string>(
    initialComponent?.id || ''
  )

  const [changeType, setChangeType] = useState<ChangeType>('Database Schema Change')
  const [currentValue, setCurrentValue] = useState('customer_id INTEGER')
  const [proposedValue, setProposedValue] = useState('customer_id UUID')
  const [description, setDescription] = useState(
    'Change customer_id column from 32-bit INTEGER to standard UUID string across database and API payload contracts.'
  )

  // Simulation state
  const [isSimulatingModal, setIsSimulatingModal] = useState(false)
  const [simulationResult, setSimulationResult] = useState<ImpactAnalysisSimulation | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(initialProject?.id || projects[0].id)
    }
  }, [projects, selectedProjectId, initialProject])

  // Load components and dependencies for selected project
  useEffect(() => {
    if (!selectedProjectId) {
      setComponents([])
      setDependencies([])
      return
    }

    const loadData = async () => {
      const [comps, deps] = await Promise.all([
        componentService.getComponents(selectedProjectId),
        dependencyService.getDependencies(selectedProjectId),
      ])
      setComponents(comps)
      setDependencies(deps)

      if (comps.length > 0 && !comps.some((c) => c.id === selectedComponentId)) {
        // default to Customer Service if present, otherwise first
        const cust = comps.find((c) => c.name.toLowerCase().includes('customer'))
        setSelectedComponentId(cust ? cust.id : comps[0].id)
      }
    }
    loadData()
  }, [selectedProjectId])

  // Handle Preset Button
  const handleLoadDemoPreset = () => {
    setChangeType('Database Schema Change')
    setCurrentValue('customer_id INTEGER')
    setProposedValue('customer_id UUID')
    setDescription('Change customer_id from INTEGER to UUID.')
    const cust = components.find((c) => c.name.toLowerCase().includes('customer'))
    if (cust) {
      setSelectedComponentId(cust.id)
    }
  }

  // Execute Analysis
  const handleAnalyzeClick = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId || !selectedComponentId) {
      alert('Please select both a project and a component to simulate.')
      return
    }
    setIsSimulatingModal(true)
  }

  const handleSimulationProgressDone = () => {
    setIsSimulatingModal(false)

    const project = projects.find((p) => p.id === selectedProjectId)
    const targetComp = components.find((c) => c.id === selectedComponentId)

    if (project && targetComp) {
      const result = simulateChangeImpact({
        project,
        targetComponent: targetComp,
        changeType,
        currentValue: currentValue.trim() || 'Unspecified baseline',
        proposedValue: proposedValue.trim() || 'Unspecified change',
        description: description.trim(),
        allComponents: components,
        allDependencies: dependencies,
      })
      setSimulationResult(result)
      setSaveSuccess(false)
    }
  }

  // Save Analysis to Supabase
  const handleSaveAnalysis = async () => {
    if (!simulationResult) return
    setIsSaving(true)
    try {
      await analysisService.saveSimulationAnalysis(developerId, simulationResult)
      setSaveSuccess(true)
      if (onAnalysisSaved) onAnalysisSaved()
    } catch (err) {
      console.error('Failed to save analysis:', err)
      alert('Failed to save analysis. Please verify your connection.')
    } finally {
      setIsSaving(false)
    }
  }



  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-widest text-sky-400 uppercase">
              Core Simulation Engine
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-purple-400">Deterministic Analysis</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-mono">Change Impact Analyzer</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Simulate the consequences and blast radius of a software change before implementation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadDemoPreset}
          className="dt-dev-btn-secondary text-xs py-2 px-3 border-purple-500/30 text-purple-300 hover:border-purple-400"
          title="Fills the form with standard demo scenario"
        >
          <Sparkles size={14} />
          <span>Preset: customer_id INTEGER → UUID</span>
        </button>
      </div>

      {/* Main Analyzer Form Card */}
      <div className="dt-dev-card border-slate-800">
        <form onSubmit={handleAnalyzeClick} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Project Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
                Project <span className="text-sky-400">*</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="dt-dev-input"
                required
              >
                {projects.length === 0 && (
                  <option value="">No projects available (Create one first)</option>
                )}
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name} ({p.language || 'Codebase'})
                  </option>
                ))}
              </select>
            </div>

            {/* Change Type Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
                Change Type <span className="text-purple-400">*</span>
              </label>
              <select
                value={changeType}
                onChange={(e) => setChangeType(e.target.value as ChangeType)}
                className="dt-dev-input"
                required
              >
                {CHANGE_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-slate-900 text-white">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Component Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
                Component <span className="text-sky-400">*</span>
              </label>
              <select
                value={selectedComponentId}
                onChange={(e) => setSelectedComponentId(e.target.value)}
                className="dt-dev-input"
                required
              >
                {components.length === 0 && (
                  <option value="">No components found for this project</option>
                )}
                {components.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Value / State */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
                Current Value / State
              </label>
              <input
                type="text"
                placeholder="e.g. customer_id INTEGER"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="dt-dev-input font-mono text-xs"
              />
            </div>

            {/* Proposed Value / State */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
                Proposed Value / State
              </label>
              <input
                type="text"
                placeholder="e.g. customer_id UUID"
                value={proposedValue}
                onChange={(e) => setProposedValue(e.target.value)}
                className="dt-dev-input font-mono text-xs"
              />
            </div>
          </div>

          {/* Change Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
              Change Description & Intent
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Migrate customer identifier from INTEGER to UUID to avoid identifier collisions and support multi-region tenancy."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="dt-dev-input resize-none"
            />
          </div>

          {/* CTA Row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div className="text-xs font-mono text-slate-400">
              {components.length} components • {dependencies.length} dependency edges indexed
            </div>
            <button
              type="submit"
              disabled={components.length === 0}
              className="dt-dev-btn-primary py-2.5 px-6 font-mono text-sm tracking-wide"
            >
              <Play size={16} />
              <span>Analyze Impact</span>
            </button>
          </div>
        </form>
      </div>

      {/* Simulation Result Presentation */}
      {simulationResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Banner / Card */}
          <div className="dt-dev-card border-slate-800 bg-[#070b14] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                  CHANGE IMPACT REPORT
                </span>
                <h2 className="text-xl font-extrabold text-white font-mono mt-1 flex items-center gap-3">
                  <span>{simulationResult.targetComponent.name}</span>
                  <span className="text-slate-500 text-sm font-normal">→</span>
                  <span className="text-sky-400 text-base font-normal">
                    {simulationResult.currentValue} → {simulationResult.proposedValue}
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`dt-dev-risk-pill dt-dev-risk-${simulationResult.riskLevel.toLowerCase()} text-sm py-1.5 px-4`}
                >
                  <AlertTriangle size={15} />
                  <span>{simulationResult.riskLevel} RISK (Score: {simulationResult.riskScore})</span>
                </span>

                <button
                  type="button"
                  onClick={handleSaveAnalysis}
                  disabled={isSaving || saveSuccess}
                  className={`dt-dev-btn-primary text-xs py-2 px-4 ${
                    saveSuccess ? 'bg-emerald-500 text-white border border-emerald-400' : ''
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Analysis Saved to Supabase</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>{isSaving ? 'Saving...' : 'Save Analysis'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  Affected Components
                </span>
                <div className="text-2xl font-bold text-white font-mono">
                  {simulationResult.affectedComponents.length}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  Affected Files
                </span>
                <div className="text-2xl font-bold text-purple-400 font-mono">
                  {simulationResult.affectedFiles.length}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  Affected APIs
                </span>
                <div className="text-2xl font-bold text-cyan-400 font-mono">
                  {simulationResult.affectedApis.length}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  Recommended Tests
                </span>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {simulationResult.recommendedTests.length}
                </div>
              </div>
            </div>

            {/* Why is this risky? */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 mb-6">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <ShieldAlert size={14} />
                <span>Why is this risky?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {simulationResult.impactSummary}
              </p>
            </div>

            {/* Affected APIs and Files Pills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-2">
                  Impacted APIs & Endpoints ({simulationResult.affectedApis.length})
                </span>
                <div className="space-y-1">
                  {simulationResult.affectedApis.map((api, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 rounded bg-slate-950 text-cyan-300 border border-slate-800 truncate"
                    >
                      {api}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-2">
                  Impacted Files ({simulationResult.affectedFiles.length})
                </span>
                <div className="space-y-1">
                  {simulationResult.affectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 rounded bg-slate-950 text-purple-300 border border-slate-800 truncate"
                    >
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Blast Radius Graph */}
          <ImpactGraphView
            originComponentName={simulationResult.targetComponent.name}
            affectedComponents={simulationResult.affectedComponents}
            riskLevel={simulationResult.riskLevel}
          />

          {/* Affected Components Detailed List */}
          <div className="dt-dev-card border-slate-800">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide mb-4">
              Affected Components ({simulationResult.affectedComponents.length})
            </h3>
            <div className="space-y-3">
              {simulationResult.affectedComponents.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white font-mono text-sm">
                        {item.component.name}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item.component.type}
                      </span>
                      <span className="text-purple-400 font-mono text-[11px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {item.dependencyRelationship}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.reason}</p>
                  </div>

                  <div className="flex items-center gap-3 text-right flex-shrink-0">
                    <div className="text-[11px] font-mono">
                      <span className="text-slate-500 block">Risk Contribution</span>
                      <span className="text-rose-400 font-bold font-mono">
                        +{item.riskContribution} pts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Tests */}
          <div className="dt-dev-card border-slate-800">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide mb-4">
              Recommended Tests & Verification Suites ({simulationResult.recommendedTests.length})
            </h3>
            <div className="space-y-2.5">
              {simulationResult.recommendedTests.map((test, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs font-mono">
                        {test.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          test.priority === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : test.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}
                      >
                        {test.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{test.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Realistic Analysis Progress Modal */}
      <AnalysisProgressModal
        isOpen={isSimulatingModal}
        onComplete={handleSimulationProgressDone}
      />
    </div>
  )
}
