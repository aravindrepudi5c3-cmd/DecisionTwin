import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDashed,
  Gauge,
  Lightbulb,
  MoveRight,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataPage } from '../components/common/index.ts'
import { employeeRecords, projectRecords } from '../services/workspaceData.ts'

const riskOrder: Record<string, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 }

function normalizeRisk(level: string) {
  const value = (level ?? 'Medium').toLowerCase()
  if (value === 'critical') return 'Critical'
  if (value === 'high') return 'High'
  if (value === 'medium') return 'Medium'
  if (value === 'low') return 'Low'
  return 'Medium'
}

function severityFromRisk(level: string) {
  const normalized = normalizeRisk(level)
  if (normalized === 'Critical') return 'CRITICAL'
  if (normalized === 'High') return 'HIGH'
  if (normalized === 'Medium') return 'MEDIUM'
  return 'LOW'
}

function severityTone(level: string) {
  const normalized = severityFromRisk(level)
  return normalized === 'CRITICAL' ? 'severity-critical' : normalized === 'HIGH' ? 'severity-high' : normalized === 'MEDIUM' ? 'severity-medium' : 'severity-low'
}

export function Dashboard() {
  const navigate = useNavigate()
  const [demandShift, setDemandShift] = useState(0)
  const [staffShift, setStaffShift] = useState(0)
  const [capacityShift, setCapacityShift] = useState(0)

  const activeProjects = useMemo(() => projectRecords.filter((project) => project.status === 'Active'), [])
  const totalEmployees = employeeRecords.length
  const averageWorkload = Math.round(employeeRecords.reduce((sum, employee) => sum + employee.workload, 0) / Math.max(totalEmployees, 1))
  const averageCapacity = Math.max(0, 100 - averageWorkload)
  const projectRiskLevels = activeProjects.map((project) => project.riskLevel ?? 'Medium')
  const topRiskLevel = projectRiskLevels.reduce((highest, current) => {
    return riskOrder[normalizeRisk(current)] > riskOrder[normalizeRisk(highest)] ? current : highest
  }, projectRiskLevels[0] ?? 'Medium')

  const metricCards = [
    {
      label: 'Total employees',
      value: totalEmployees.toLocaleString(),
      foot: 'Active workforce',
      icon: Users,
    },
    {
      label: 'Active projects',
      value: activeProjects.length.toLocaleString(),
      foot: 'Currently running',
      icon: BriefcaseBusiness,
    },
    {
      label: 'Workforce load',
      value: `${averageWorkload}%`,
      foot: 'Current utilization',
      icon: Gauge,
    },
    {
      label: 'Available capacity',
      value: `${averageCapacity}%`,
      foot: 'Remaining capacity',
      icon: TrendingUp,
    },
    {
      label: 'Decision risk',
      value: severityFromRisk(topRiskLevel),
      foot: `${Math.max(1, projectRiskLevels.filter((level) => normalizeRisk(level) !== 'Low').length)} signals`,
      icon: ShieldAlert,
    },
  ]

  const organizationHealth = [
    { label: 'Workforce load', value: `${averageWorkload}%`, width: averageWorkload },
    { label: 'Capacity utilization', value: `${averageCapacity}%`, width: averageCapacity },
    { label: 'Efficiency', value: `${Math.min(98, Math.max(60, 100 - Math.round(averageWorkload * 0.18)))}%`, width: Math.min(98, Math.max(60, 100 - Math.round(averageWorkload * 0.18))) },
    { label: 'Resource balance', value: `${Math.min(95, Math.max(55, 100 - Math.round((employeeRecords.filter((employee) => employee.status === 'Limited').length / Math.max(totalEmployees, 1)) * 100)))}%`, width: Math.min(95, Math.max(55, 100 - Math.round((employeeRecords.filter((employee) => employee.status === 'Limited').length / Math.max(totalEmployees, 1)) * 100))) },
    { label: 'Risk level', value: severityFromRisk(topRiskLevel), width: topRiskLevel.toLowerCase() === 'critical' ? 90 : topRiskLevel.toLowerCase() === 'high' ? 72 : topRiskLevel.toLowerCase() === 'medium' ? 52 : 28 },
  ]

  const bottlenecks = useMemo(() => {
    return [...activeProjects]
      .sort((a, b) => (b.workload + (normalizeRisk(b.riskLevel) === 'High' ? 10 : 0)) - (a.workload + (normalizeRisk(a.riskLevel) === 'High' ? 10 : 0)))
      .slice(0, 3)
      .map((project) => ({
        projectId: project.id,
        team: project.name,
        capacity: Math.min(99, project.workload),
        workload: Math.min(99, project.capacityRequired),
        backlog: `${Math.max(6, Math.round((project.capacityRequired - project.workload) / Math.max(project.workload, 1) * 100))}%`,
        severity: severityFromRisk(project.riskLevel),
        factor: project.workload >= 80 ? `Current demand is approaching available capacity for ${project.name}.` : `Demand is intensifying in ${project.businessUnit} and driving pressure on delivery capacity.`,
      }))
  }, [activeProjects])

  const riskSignals = useMemo(() => {
    return [
      {
        name: 'Capacity pressure',
        severity: 'HIGH',
        area: bottlenecks[0]?.team ?? 'Portfolio overview',
        condition: `${bottlenecks[0]?.capacity ?? 85}% utilization`,
        impact: 'Backlog and queue time risk under current demand.',
      },
      {
        name: 'Delivery delay',
        severity: 'MEDIUM',
        area: activeProjects[1]?.name ?? 'Active initiatives',
        condition: `${Math.max(50, activeProjects[1]?.workload ?? 68)}% workload`,
        impact: 'Schedule pressure may emerge if workload remains elevated.',
      },
      {
        name: 'Resource imbalance',
        severity: 'MEDIUM',
        area: activeProjects[2]?.businessUnit ?? 'Operations',
        condition: `${Math.max(55, activeProjects[2]?.capacityRequired ?? 72)}% required capacity`,
        impact: 'Support coverage may become uneven across teams.',
      },
      {
        name: 'Skill gap',
        severity: 'LOW',
        area: 'Cross-functional coverage',
        condition: `${Math.max(12, Math.min(32, totalEmployees / 120))}% coverage pressure`,
        impact: 'Specialist coverage may limit rapid reassignment.',
      },
    ]
  }, [activeProjects, bottlenecks, totalEmployees])

  const aiInsight = bottlenecks[0] ? {
    title: 'Potential capacity bottleneck',
    summary: `${bottlenecks[0].team} is approaching the current operating capacity under the present workload profile.`,
    detail: 'The current profile suggests a higher risk of backlog growth and slower delivery if incoming demand stays flat or rises.',
    area: bottlenecks[0].team,
  } : {
    title: 'No critical bottleneck flagged',
    summary: 'Current workload is within a manageable range across the active portfolio.',
    detail: 'The system is ready for decision review when utilization trends shift upward.',
    area: 'Portfolio overview',
  }

  const quickSimulation = useMemo(() => {
    const simulatedCapacity = Math.max(40, 100 + capacityShift)
    const simulatedDemand = Math.max(35, 100 + demandShift - staffShift)
    const utilization = Math.min(100, Math.round((simulatedDemand / simulatedCapacity) * 100))
    return {
      capacity: simulatedCapacity,
      demand: simulatedDemand,
      utilization,
      signal: utilization > 80 ? 'Capacity warning' : 'Within range',
    }
  }, [capacityShift, demandShift, staffShift])

  const workforceHealth = [
    { label: 'Available capacity', value: `${averageCapacity}%` },
    { label: 'Current workload', value: `${averageWorkload}%` },
    { label: 'Overloaded', value: `${employeeRecords.filter((employee) => employee.status === 'Unavailable').length}` },
    { label: 'Underutilized', value: `${employeeRecords.filter((employee) => employee.status === 'Available').length}` },
  ]

  const projectHealth = [...activeProjects].sort((a, b) => b.workload - a.workload).slice(0, 3).map((project) => ({
    name: project.name,
    workload: project.workload,
    capacity: project.capacityRequired,
    risk: severityFromRisk(project.riskLevel),
    status: project.status,
  }))

  const recentDecisions = [
    'Portfolio load reviewed',
    'Scenario assumptions refreshed',
    'Workforce allocation signals updated',
    'Decision review queued for active projects',
  ]

  const decisionSignals = ['↑ Demand increasing', '! Capacity pressure', '↓ Team utilization', '⚠ Resource imbalance', '→ Skill gap monitored']

  const openScenario = (projectIdOrName: string, capacityChange = 0, demandChange = 0, source = 'overview') => {
    const project = projectRecords.find((item) => item.id === projectIdOrName || item.name === projectIdOrName || item.code === projectIdOrName)
    const resolvedProjectId = project?.id ?? projectRecords[0]?.id ?? ''
    const params = new URLSearchParams()

    if (resolvedProjectId) {
      params.set('project', resolvedProjectId)
    }

    if (capacityChange !== 0) {
      params.set('capacity', String(capacityChange))
    }

    if (demandChange !== 0) {
      params.set('demand', String(demandChange))
    }

    if (source) {
      params.set('source', source)
    }

    navigate(`/simulator${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className="manager-dashboard-theme">
      <DataPage eyebrow="Workspace overview" title="Decision Intelligence Command Center" description="Monitor organizational health, identify emerging risks, and simulate the impact of workforce decisions.">
      <section className="overview-shell">
        <div className="overview-header-row">
          <div>
            <p className="eyebrow">Northstar Operations</p>
          </div>
          <div className="workspace-pill">
            <CircleDashed size={14} />
            Live workspace
          </div>
        </div>

        <div className="metric-grid">
          {metricCards.map(({ label, value, foot, icon: Icon }) => (
            <article className="metric-card" key={label}>
              <div className="metric-card__topline">
                <span>{label}</span>
                <Icon size={16} />
              </div>
              <strong>{value}</strong>
              <small>{foot}</small>
            </article>
          ))}
        </div>

        <section className="overview-panel overview-panel--wide">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Organization health</p>
              <h2>Current operating condition</h2>
            </div>
            <TrendPill />
          </div>
          <div className="health-grid">
            {organizationHealth.map((item) => (
              <div className="health-row" key={item.label}>
                <div className="health-row__header">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className="bar">
                  <i style={{ width: `${item.width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="overview-columns">
          <section className="overview-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Bottlenecks</p>
                <h2>Identified bottlenecks</h2>
              </div>
              <AlertTriangle size={18} />
            </div>
            <div className="stack-list">
              {bottlenecks.map((item) => (
                <article className="stack-card" key={item.team}>
                  <div className="stack-card__header">
                    <strong>{item.team}</strong>
                    <span className={`severity-badge ${severityTone(item.severity)}`}>{item.severity}</span>
                  </div>
                  <div className="stack-card__stats">
                    <div>
                      <small>Capacity</small>
                      <strong>{item.capacity}%</strong>
                    </div>
                    <div>
                      <small>Workload</small>
                      <strong>{item.workload}%</strong>
                    </div>
                    <div>
                      <small>Backlog</small>
                      <strong>{item.backlog}</strong>
                    </div>
                  </div>
                  <p>{item.factor}</p>
                  <div className="stack-card__actions">
                    <button type="button" className="ghost-button" onClick={() => navigate('/projects')}>
                      View details
                    </button>
                    <button type="button" className="primary-button" onClick={() => openScenario(item.projectId, 10, 0, 'capacity-pressure')}>
                      Simulate <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="overview-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Risk signals</p>
                <h2>What could go wrong?</h2>
              </div>
              <ShieldAlert size={18} />
            </div>
            <div className="stack-list">
              {riskSignals.map((signal) => (
                <article className="signal-card" key={signal.name}>
                  <div className="signal-card__header">
                    <strong>{signal.name}</strong>
                    <span className={`severity-badge ${severityTone(signal.severity)}`}>{signal.severity}</span>
                  </div>
                  <div className="signal-card__meta">
                    <span>Affected: {signal.area}</span>
                    <span>Current: {signal.condition}</span>
                  </div>
                  <p>{signal.impact}</p>
                  <button type="button" className="text-button" onClick={() => navigate('/insights')}>
                    Analyze <MoveRight size={14} />
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="overview-panel overview-panel--wide">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Decision options</p>
              <h2>Recommended actions</h2>
            </div>
            <Target size={18} />
          </div>
          <div className="options-grid">
            {[
              {
                title: 'Add resources',
                description: 'Increase available workforce capacity for the most constrained area.',
                effects: ['Capacity ↑', 'Backlog ↓', 'Pressure ↓', 'Cost ↑'],
                projectId: bottlenecks[0]?.projectId ?? projectRecords[0]?.id ?? '',
                capacityChange: 10,
                demandChange: 0,
              },
              {
                title: 'Reallocate resources',
                description: 'Shift high-value capacity from lower-utilization teams into the bottleneck.',
                effects: ['Team balance ↑', 'Pressure ↓', 'Coordination ↑'],
                projectId: bottlenecks[0]?.projectId ?? projectRecords[0]?.id ?? '',
                capacityChange: 8,
                demandChange: -5,
              },
              {
                title: 'Reduce / redistribute demand',
                description: 'Temporarily defer lower-priority demand and refocus effort on critical delivery.',
                effects: ['Demand ↓', 'Backlog ↓', 'Scope impact possible'],
                projectId: bottlenecks[0]?.projectId ?? projectRecords[0]?.id ?? '',
                capacityChange: 0,
                demandChange: -10,
              },
            ].map((option) => (
              <article className="option-card" key={option.title}>
                <span className="option-card__eyebrow">Option 01</span>
                <h3>{option.title}</h3>
                <p>{option.description}</p>
                <ul>
                  {option.effects.map((effect) => <li key={effect}>{effect}</li>)}
                </ul>
                <button type="button" className="primary-button" onClick={() => openScenario(option.projectId, option.capacityChange, option.demandChange, option.title.toLowerCase().replace(/\s+/g, '-'))}>
                  Simulate option <ArrowRight size={14} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="overview-panel overview-panel--wide">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Quick simulation</p>
              <h2>Test a decision before implementing it.</h2>
            </div>
            <Zap size={18} />
          </div>
          <div className="simulation-panel">
            <div className="range-group">
              <label>
                <span>Demand</span>
                <input type="range" min={-20} max={20} value={demandShift} onChange={(event) => setDemandShift(Number(event.target.value))} />
                <strong>{demandShift > 0 ? '+' : ''}{demandShift}%</strong>
              </label>
              <label>
                <span>Staff</span>
                <input type="range" min={-20} max={20} value={staffShift} onChange={(event) => setStaffShift(Number(event.target.value))} />
                <strong>{staffShift > 0 ? '+' : ''}{staffShift}%</strong>
              </label>
              <label>
                <span>Capacity</span>
                <input type="range" min={-20} max={20} value={capacityShift} onChange={(event) => setCapacityShift(Number(event.target.value))} />
                <strong>{capacityShift > 0 ? '+' : ''}{capacityShift}%</strong>
              </label>
            </div>
            <div className="simulation-summary">
              <div>
                <small>Projected demand</small>
                <strong>{quickSimulation.demand}%</strong>
              </div>
              <div>
                <small>Projected capacity</small>
                <strong>{quickSimulation.capacity}%</strong>
              </div>
              <div>
                <small>Utilization</small>
                <strong>{quickSimulation.utilization}%</strong>
              </div>
            </div>
            <button type="button" className="primary-button full-width" onClick={() => navigate(`/simulator?demand=${demandShift}&staff=${staffShift}&capacity=${capacityShift}`)}>
              Run simulation <ArrowRight size={14} />
            </button>
          </div>
        </section>

        <div className="overview-columns overview-columns--balanced">
          <section className="overview-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">AI insight</p>
                <h2>{aiInsight.title}</h2>
              </div>
              <Lightbulb size={18} />
            </div>
            <div className="ai-insight">
              <p>{aiInsight.summary}</p>
              <div className="insight-callout">
                <span>Why this matters</span>
                <strong>{aiInsight.detail}</strong>
              </div>
              <div className="insight-fact">
                <small>Affected area</small>
                <strong>{aiInsight.area}</strong>
              </div>
              <button type="button" className="text-button" onClick={() => navigate('/insights')}>
                View insight <MoveRight size={14} />
              </button>
            </div>
          </section>

          <section className="overview-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Workforce health</p>
                <h2>Capacity and workload</h2>
              </div>
              <Users size={18} />
            </div>
            <div className="mini-stats">
              {workforceHealth.map((item) => (
                <div key={item.label} className="mini-stat">
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="overview-columns overview-columns--balanced">
          <section className="overview-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Project health</p>
                <h2>Delivery confidence</h2>
              </div>
              <BarChart3 size={18} />
            </div>
            <div className="project-health-list">
              {projectHealth.map((project) => (
                <div className="project-health-item" key={project.name}>
                  <div>
                    <strong>{project.name}</strong>
                    <small>{project.status}</small>
                  </div>
                  <div className="project-health-metrics">
                    <span>Workload {project.workload}%</span>
                    <span>Capacity {project.capacity}%</span>
                    <span className={`severity-badge ${severityTone(project.risk)}`}>{project.risk}</span>
                  </div>
                  <button type="button" className="ghost-button" onClick={() => navigate('/projects')}>
                    View project
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="overview-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Recent decisions</p>
                <h2>Decision activity</h2>
              </div>
              <Sparkles size={18} />
            </div>
            <ul className="timeline-list">
              {recentDecisions.map((item) => (
                <li key={item}>
                  <span className="timeline-dot" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="overview-columns overview-columns--balanced">
          <section className="overview-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Decision signals</p>
                <h2>Quick indicators</h2>
              </div>
              <CheckCircle2 size={18} />
            </div>
            <div className="signal-token-list">
              {decisionSignals.map((signal) => (
                <button type="button" className="signal-token" key={signal} onClick={() => navigate('/insights')}>
                  {signal}
                </button>
              ))}
            </div>
          </section>

          <section className="overview-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Quick actions</p>
                <h2>Next steps</h2>
              </div>
              <ArrowRight size={18} />
            </div>
            <div className="quick-actions-grid">
              <button type="button" className="action-button" onClick={() => navigate('/simulator')}>+ New Scenario</button>
              <button type="button" className="action-button" onClick={() => navigate('/skill-matching')}>Find Skill Match</button>
              <button type="button" className="action-button" onClick={() => navigate('/team-builder')}>Build Team</button>
              <button type="button" className="action-button" onClick={() => navigate('/insights')}>View Insights</button>
            </div>
          </section>
        </div>
      </section>
    </DataPage>
    </div>
  )
}

function TrendPill() {
  return (
    <span className="trend-pill">
      <TrendingUp size={14} />
      Monitoring
    </span>
  )
}
