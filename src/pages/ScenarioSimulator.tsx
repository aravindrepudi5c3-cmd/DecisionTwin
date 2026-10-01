import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, Minus, Workflow } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DataPage } from '../components/common/index.ts'
import { projectRecords, simulationRecords } from '../services/workspaceData.ts'

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

type RiskState = {
  level: RiskLevel
  label: string
  className: string
  explanation: string
  recommendation: string
}

type SimulationProjection = {
  capacity: number
  demand: number
  utilization: number
  gap: number
  capacityStatus: string
  risk: RiskState
}

const getRiskState = (utilization: number): RiskState => {
  if (utilization <= 70) {
    return {
      level: 'LOW',
      label: 'LOW RISK',
      className: 'risk-low',
      explanation: 'Current resources can handle the projected demand with sufficient headroom.',
      recommendation: 'Proceed with the current allocation.',
    }
  }

  if (utilization <= 85) {
    return {
      level: 'MEDIUM',
      label: 'MEDIUM RISK',
      className: 'risk-medium',
      explanation: 'Projected utilization is approaching the available capacity. Consider reallocating resources.',
      recommendation: 'Consider reallocating available employees or adjusting project assignments.',
    }
  }

  return {
    level: 'HIGH',
    label: 'HIGH RISK',
    className: 'risk-high',
    explanation: 'Projected demand may exceed safe workforce capacity. Immediate resource adjustment is recommended.',
    recommendation: 'Consider adding workforce capacity, redistributing projects, or delaying lower-priority work.',
  }
}

const calculateProjection = (
  currentCapacity: number,
  currentDemand: number,
  capacityChangePercent: number,
  demandChangePercent: number,
): SimulationProjection => {
  const normalizedCapacityChange = Number.isFinite(capacityChangePercent) ? capacityChangePercent : 0
  const normalizedDemandChange = Number.isFinite(demandChangePercent) ? demandChangePercent : 0

  const projectedCapacity = Math.max(0, currentCapacity * (1 + normalizedCapacityChange / 100))
  const projectedDemand = Math.max(0, currentDemand * (1 + normalizedDemandChange / 100))
  const projectedUtilization = projectedCapacity > 0 ? (projectedDemand / projectedCapacity) * 100 : 0
  const gap = projectedCapacity - projectedDemand
  const capacityStatus = gap > 0 ? 'Available capacity' : gap > -Math.max(projectedCapacity * 0.05, 1) ? 'Limited capacity' : 'Capacity shortage'

  return {
    capacity: projectedCapacity,
    demand: projectedDemand,
    utilization: projectedUtilization,
    gap,
    capacityStatus,
    risk: getRiskState(projectedUtilization),
  }
}

const formatSignedPercent = (value: number) => `${value >= 0 ? '+' : ''}${Math.round(value)}%`

function getBaselineProject(projectId: string) {
  return simulationRecords.find((item) => item.projectId === projectId) ?? simulationRecords[0] ?? {
    id: '',
    scenarioId: '',
    name: 'Baseline scenario',
    projectId,
    demand: 0,
    capacity: 0,
    utilization: 0,
    riskLevel: 'MEDIUM',
    capacityChange: 0,
    demandChange: 0,
    backlog: 0,
    completed: 0,
  }
}

export function ScenarioSimulator() {
  const [searchParams] = useSearchParams()

  const initialProjectId = (() => {
    const projectParam = searchParams.get('project')
    if (!projectParam) return projectRecords[0]?.id ?? ''

    const match = projectRecords.find((project) => project.id === projectParam || project.code === projectParam || project.name === projectParam)
    return match?.id ?? projectRecords[0]?.id ?? ''
  })()

  const initialCapacityChange = (() => {
    const capacityParam = searchParams.get('capacity')
    const staffParam = searchParams.get('staff')
    const parsedCapacity = capacityParam !== null ? Number.parseFloat(capacityParam) : Number.NaN
    if (!Number.isNaN(parsedCapacity)) return parsedCapacity

    const parsedStaff = staffParam !== null ? Number.parseFloat(staffParam) : Number.NaN
    return Number.isNaN(parsedStaff) ? 0 : parsedStaff
  })()

  const initialDemandChange = (() => {
    const demandParam = searchParams.get('demand')
    const parsedDemand = demandParam !== null ? Number.parseFloat(demandParam) : Number.NaN
    return Number.isNaN(parsedDemand) ? 0 : parsedDemand
  })()

  const [projectId, setProjectId] = useState(initialProjectId)
  const [capacityChange, setCapacityChange] = useState(initialCapacityChange)
  const [demandChange, setDemandChange] = useState(initialDemandChange)
  const [isRunning, setIsRunning] = useState(false)
  const [statusMessage, setStatusMessage] = useState('Simulation ready')
  const [hasRun, setHasRun] = useState(false)

  const baseline = useMemo(() => getBaselineProject(projectId), [projectId])
  const currentCapacity = useMemo(() => {
    if (baseline.capacity > 0) return baseline.capacity
    const project = projectRecords.find((item) => item.id === projectId) ?? projectRecords[0]
    return project?.capacityRequired ?? 0
  }, [baseline.capacity, projectId])

  const currentDemand = useMemo(() => {
    if (baseline.demand > 0) return baseline.demand
    const project = projectRecords.find((item) => item.id === projectId) ?? projectRecords[0]
    return project?.workload ?? 0
  }, [baseline.demand, projectId])

  const baselineUtilization = useMemo(() => {
    if (baseline.utilization > 0) return Number(baseline.utilization)
    return currentCapacity > 0 ? (currentDemand / currentCapacity) * 100 : 0
  }, [baseline.utilization, currentCapacity, currentDemand])

  const baselineRisk = useMemo(() => getRiskState(baselineUtilization), [baselineUtilization])

  const [projected, setProjected] = useState<SimulationProjection>(() =>
    calculateProjection(currentCapacity, currentDemand, capacityChange, demandChange),
  )

  const updateProjectedPreview = (nextProjectId: string, nextCapacityValue: number, nextDemandValue: number) => {
    const nextBaseline = getBaselineProject(nextProjectId)
    const nextCapacity = nextBaseline.capacity > 0 ? nextBaseline.capacity : currentCapacity
    const nextDemand = nextBaseline.demand > 0 ? nextBaseline.demand : currentDemand

    setProjected(calculateProjection(nextCapacity, nextDemand, nextCapacityValue, nextDemandValue))
    setHasRun(false)
    setStatusMessage('Simulation ready')
  }

  const runSimulation = () => {
    if (isRunning) return

    setIsRunning(true)
    setStatusMessage('Running Simulation...')
    setHasRun(false)

    window.setTimeout(() => {
      const nextProjection = calculateProjection(currentCapacity, currentDemand, capacityChange, demandChange)
      setProjected(nextProjection)
      setHasRun(true)
      setStatusMessage('Results Updated')
      setIsRunning(false)
    }, 450)
  }

  const projectedUtilization = Math.round(projected.utilization)
  const currentLoad = Math.round(baselineUtilization)
  const capacityDelta = currentCapacity > 0 ? ((projected.capacity - currentCapacity) / currentCapacity) * 100 : 0
  const demandDelta = currentDemand > 0 ? ((projected.demand - currentDemand) / currentDemand) * 100 : 0
  const workloadDelta = projected.utilization - baselineUtilization
  const utilizationDelta = formatSignedPercent(workloadDelta)

  const comparisonData = [
    { name: 'Capacity', current: Math.round(currentCapacity), simulated: Math.round(projected.capacity) },
    { name: 'Demand', current: Math.round(currentDemand), simulated: Math.round(projected.demand) },
    { name: 'Utilization', current: currentLoad, simulated: projectedUtilization },
  ]

  const summaryCards = [
    {
      label: 'Workforce Load',
      value: `${projectedUtilization}%`,
      detail: `${utilizationDelta} vs current`,
    },
    {
      label: 'Capacity Impact',
      value: `${formatSignedPercent(capacityDelta)}`,
      detail: 'Change vs current',
    },
    {
      label: 'Demand Impact',
      value: `${formatSignedPercent(demandDelta)}`,
      detail: 'Change vs current',
    },
    {
      label: 'Decision Risk',
      value: projected.risk.label,
      detail: `${projected.risk.level} risk profile`,
    },
    {
      label: 'Capacity Gap',
      value: projected.capacityStatus,
      detail: `${Math.round(projected.gap)} units`,
    },
  ]

  const buttonLabel = isRunning ? 'Running Simulation...' : 'Run Simulation'

  return (
    <DataPage eyebrow="Decision intelligence" title="Decision Simulation" description="Simulate workforce decisions and measure their impact before execution.">
      <section className="data-panel simulator-panel manager-theme">
        <div className="simulator-toolbar">
          <div className="simulator-status">
            <span className="simulator-status__dot" />
            {statusMessage}
          </div>
          <button type="button" className="button primary" onClick={runSimulation} disabled={isRunning}>
            {buttonLabel}
          </button>
        </div>

        {hasRun && (
          <div className="success-banner">
            <CheckCircle2 size={16} />
            Simulation completed
          </div>
        )}

        <div className="simulator-metrics">
          {[
            { label: 'Workforce load', value: `${projectedUtilization}%`, detail: 'Projected utilization' },
            { label: 'Capacity gap', value: `${Math.round(projected.gap)}`, detail: projected.capacityStatus },
            { label: 'Decision risk', value: projected.risk.label, detail: `Threshold: ${projected.risk.level}` },
            { label: 'Capacity impact', value: `${formatSignedPercent(capacityDelta)}`, detail: 'Change vs current' },
          ].map(({ label, value, detail }) => (
            <article key={label} className="simulator-card">
              <span className="simulator-meta">{label}</span>
              <strong className="simulator-value">{value}</strong>
              <small className="simulator-subtle">{detail}</small>
            </article>
          ))}
        </div>

        <div className="simulator-body">
          <div className="simulator-parameter">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Simulation parameters</p>
                <h2>Scenario inputs</h2>
              </div>
            </div>

            <div className="toolbar">
              <label className="field">
                <span>Project</span>
                <select
                  value={projectId}
                  onChange={(event) => {
                    const nextProjectId = event.target.value
                    setProjectId(nextProjectId)
                    updateProjectedPreview(nextProjectId, capacityChange, demandChange)
                  }}
                >
                  {projectRecords.slice(0, 40).map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="simulator-controls">
              <label>
                <span>Capacity change %</span>
                <input
                  type="number"
                  value={capacityChange}
                  onChange={(event) => {
                    const nextValue = Number.isFinite(Number(event.target.value)) ? Number(event.target.value) : 0
                    setCapacityChange(nextValue)
                    updateProjectedPreview(projectId, nextValue, demandChange)
                  }}
                />
              </label>

              <label>
                <span>Demand change %</span>
                <input
                  type="number"
                  value={demandChange}
                  onChange={(event) => {
                    const nextValue = Number.isFinite(Number(event.target.value)) ? Number(event.target.value) : 0
                    setDemandChange(nextValue)
                    updateProjectedPreview(projectId, capacityChange, nextValue)
                  }}
                />
              </label>
            </div>
          </div>

          <div className="simulator-result">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Current vs simulated</p>
                <h2>Projected outcome</h2>
              </div>
            </div>

            <div className="before-after">
              <div className="before-box">
                <p>Before</p>
                <strong>{Math.round(currentCapacity)}</strong>
                <small>capacity units</small>
                <strong>{Math.round(currentDemand)}</strong>
                <small>demand units</small>
                <strong>{currentLoad}%</strong>
                <small>utilization</small>
                <span className={`risk-badge ${baselineRisk.className}`}>{baselineRisk.label}</span>
              </div>

              <div className="projection-arrow">
                {capacityChange > 0 ? <ArrowUp /> : capacityChange < 0 ? <ArrowDown /> : <Minus />}
              </div>

              <div className={projected.risk.level === 'HIGH' ? 'after warning-tint' : 'after'}>
                <p>Projected</p>
                <strong>{Math.round(projected.capacity)}</strong>
                <small>capacity units</small>
                <strong>{Math.round(projected.demand)}</strong>
                <small>demand units</small>
                <strong>{projectedUtilization}%</strong>
                <small>utilization</small>
                <span className={`risk-badge ${projected.risk.className}`}>{projected.risk.label}</span>
              </div>
            </div>

            <div className="utilization-row">
              <span>Projected utilization</span>
              <strong>{projectedUtilization}%</strong>
              <div className="meter">
                <i style={{ width: `${Math.min(projectedUtilization, 100)}%` }} />
              </div>
            </div>

            {projected.risk.level === 'HIGH' ? (
              <div className="warning">
                <strong>
                  <Workflow size={16} />
                  Capacity insufficient
                </strong>
                <span>Projected demand exceeds capacity by {Math.round(projected.gap * -1)} units.</span>
              </div>
            ) : (
              <div className="success-box">
                <CheckCircle2 size={16} />
                Projected capacity covers demand under these assumptions.
              </div>
            )}
          </div>
        </div>

        <div className="chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Current vs simulated</p>
              <h2>Current vs Simulated</h2>
            </div>
          </div>

          <div className="simulator-chart-wrap">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparisonData} barGap={14}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9aaec9', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9aaec9', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(125, 211, 252, 0.08)' }}
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: 12,
                    color: '#edf4ff',
                  }}
                  formatter={(value, name) => {
                    const rawValue = Array.isArray(value) ? value[0] : value
                    const displayValue = typeof rawValue === 'number' ? rawValue : Number(rawValue ?? 0)
                    const label = name === 'current' ? 'Current' : 'Simulated'

                    return [`${displayValue}`, label]
                  }}
                />
                <Bar dataKey="current" name="current" fill="#7dd3fc" radius={[6, 6, 0, 0]} />
                <Bar dataKey="simulated" name="simulated" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="impact-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Decision impact summary</p>
              <h2>Decision Impact Summary</h2>
            </div>
          </div>

          <div className="impact-grid">
            {summaryCards.map(({ label, value, detail }) => (
              <article key={label} className="impact-card">
                <span className="impact-label">{label}</span>
                <strong>{value}</strong>
                <small>{detail}</small>
              </article>
            ))}
          </div>

          <div className={`risk-panel ${projected.risk.className}`}>
            <div className="risk-header">
              <AlertTriangle size={18} />
              <span>{projected.risk.label}</span>
            </div>
            <p>{projected.risk.explanation}</p>
          </div>

          <div className="recommendation-box">
            <p className="eyebrow">Recommended action</p>
            <strong>{projected.risk.recommendation}</strong>
          </div>
        </div>
      </section>
    </DataPage>
  )
}
