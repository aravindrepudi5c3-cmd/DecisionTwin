import { ArrowRight, BarChart3, BriefcaseBusiness, CheckCircle2, Lightbulb, MoveRight, Sparkles, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DataPage } from '../components/common/index.ts'
import { employeeRecords, projectRecords, simulationRecords } from '../services/workspaceData.ts'

const riskOrder: Record<string, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 }

function normalizeRisk(level: string) {
  const value = (level ?? 'Medium').toLowerCase()
  if (value === 'critical') return 'Critical'
  if (value === 'high') return 'High'
  if (value === 'medium') return 'Medium'
  if (value === 'low') return 'Low'
  return 'Medium'
}

function riskLabel(level: string) {
  const normalized = normalizeRisk(level)
  return normalized === 'Critical' ? 'CRITICAL' : normalized === 'High' ? 'HIGH' : normalized === 'Medium' ? 'MEDIUM' : 'LOW'
}

function riskTone(level: string) {
  const normalized = riskLabel(level)
  return normalized === 'CRITICAL' ? 'severity-critical' : normalized === 'HIGH' ? 'severity-high' : normalized === 'MEDIUM' ? 'severity-medium' : 'severity-low'
}

export function Insights() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [decisionSaved, setDecisionSaved] = useState(false)

  const capacity = employeeRecords.reduce((sum, employee) => sum + employee.capacity, 0)
  const workload = employeeRecords.reduce((sum, employee) => sum + employee.workload, 0)
  const utilization = Math.round((workload / Math.max(capacity + workload, 1)) * 100)
  const risks = projectRecords.filter((project) => project.riskLevel === 'High').slice(0, 5)
  const skillCounts = employeeRecords.flatMap((employee) => employee.skills).reduce<Record<string, number>>((result, skill) => {
    result[skill] = (result[skill] ?? 0) + 1
    return result
  }, {})
  const gaps = Object.entries(skillCounts).sort(([, a], [, b]) => a - b).slice(0, 4)

  const projectId = searchParams.get('project')
  const capacityParam = searchParams.get('capacity')
  const demandParam = searchParams.get('demand')
  const capacityChange = capacityParam ? Number.parseFloat(capacityParam) : Number.NaN
  const demandChange = demandParam ? Number.parseFloat(demandParam) : Number.NaN

  const scenarioProject = useMemo(() => {
    if (!projectId) return null
    return projectRecords.find((project) => project.id === projectId || project.code === projectId || project.name === projectId) ?? null
  }, [projectId])

  const scenarioBaseline = useMemo(() => {
    if (!scenarioProject) return null
    return simulationRecords.find((item) => item.projectId === scenarioProject.id) ?? simulationRecords[0] ?? null
  }, [scenarioProject])

  const simulationImpact = useMemo(() => {
    if (!scenarioProject || !scenarioBaseline) return null

    const beforeCapacity = scenarioBaseline.capacity
    const beforeDemand = scenarioBaseline.demand
    const beforeUtilization = beforeCapacity ? beforeDemand / beforeCapacity : 0
    const effectiveCapacityDelta = Number.isNaN(capacityChange) ? 0 : capacityChange
    const effectiveDemandDelta = Number.isNaN(demandChange) ? 0 : demandChange
    const projectedCapacity = Math.max(0, beforeCapacity * (1 + effectiveCapacityDelta / 100))
    const projectedDemand = Math.max(0, beforeDemand * (1 + effectiveDemandDelta / 100))
    const projectedUtilization = projectedCapacity ? projectedDemand / projectedCapacity : 0
    const riskBefore = beforeUtilization >= 0.8 ? 'High' : beforeUtilization >= 0.6 ? 'Medium' : 'Low'
    const riskAfter = projectedUtilization >= 0.8 ? 'High' : projectedUtilization >= 0.6 ? 'Medium' : 'Low'

    return {
      project: scenarioProject.name,
      beforeCapacity,
      projectedCapacity,
      beforeDemand,
      projectedDemand,
      beforeUtilization,
      projectedUtilization,
      riskBefore,
      riskAfter,
      capacityDelta: effectiveCapacityDelta,
      demandDelta: effectiveDemandDelta,
      utilizationDelta: projectedUtilization - beforeUtilization,
    }
  }, [capacityChange, demandChange, scenarioBaseline, scenarioProject])

  const decisionInsight = simulationImpact ? (
    simulationImpact.projectedUtilization <= simulationImpact.beforeUtilization
      ? 'The projected scenario reduces utilization pressure and creates more operating headroom relative to current demand.'
      : 'The projected scenario increases demand pressure and should be reviewed before implementation.'
  ) : null

  const decisionTradeoffs = simulationImpact ? {
    positive: [
      'Increased available capacity',
      'Lower projected utilization',
      'Greater workload headroom',
    ],
    negative: [
      'Additional workforce or resource requirement',
      'Possible increase in staffing cost',
      'Resource availability may need validation',
    ],
  } : null

  return (
    <DataPage eyebrow="Decision tools" title="Insights" description="Bring the signals, risks, and trade-offs behind a decision into focus.">
      <div className="metric-grid">
        <article className="metric-card">
          <small>Workforce capacity</small>
          <strong>{Math.round(capacity).toLocaleString()}</strong>
          <span><TrendingUp size={14} /> available units</span>
        </article>
        <article className="metric-card">
          <small>Current workload</small>
          <strong>{Math.round(workload).toLocaleString()}</strong>
          <span>across {employeeRecords.length} employees</span>
        </article>
        <article className="metric-card">
          <small>Capacity utilization</small>
          <strong>{utilization}%</strong>
          <div className="meter"><i style={{ width: `${utilization}%` }} /></div>
        </article>
        <article className="metric-card">
          <small>Staffing risks</small>
          <strong>{risks.length}</strong>
          <span>high-risk projects in view</span>
        </article>
      </div>

      <div className="insight-grid">
        <section className="data-panel insight-panel">
          <div className="panel-heading">
            <div>
              <h2>Skill availability</h2>
              <p>Smallest mapped pools need attention first.</p>
            </div>
            <BarChart3 size={20} />
          </div>
          {gaps.map(([skill, count]) => (
            <div className="bar-row" key={skill}>
              <span>{skill}</span>
              <div className="bar"><i style={{ width: `${Math.min((count / 4) * 100, 100)}%` }} /></div>
              <strong>{count}</strong>
            </div>
          ))}
        </section>

        <section className="data-panel insight-panel">
          <div className="panel-heading">
            <div>
              <h2>Project staffing risks</h2>
              <p>Projects requiring review</p>
            </div>
            <BriefcaseBusiness size={20} />
          </div>
          {risks.map((project) => (
            <button type="button" className="risk-row risk-row--button" key={project.id} onClick={() => navigate(`/projects/${project.id}`)}>
              <span>
                <strong>{project.name}</strong>
                <small>{project.priority} priority · {project.capacityRequired}% capacity need</small>
              </span>
              <span className={`status ${riskTone(project.riskLevel)}`}>{project.riskLevel}</span>
            </button>
          ))}
        </section>
      </div>

      <section className="data-panel insight-panel insight-panel--large">
        <div className="panel-heading">
          <div>
            <h2>Simulation impact</h2>
            <p>Scenario-driven impact on capacity, demand, and risk.</p>
          </div>
          <Sparkles size={20} />
        </div>

        {simulationImpact ? (
          <>
            <div className="simulation-impact-header">
              <strong>{simulationImpact.project}</strong>
            </div>

            <div className="impact-table">
              <div className="impact-row impact-row--head">
                <span>Measure</span>
                <span>Before</span>
                <span>Projected</span>
                <span>Change</span>
              </div>
              <div className="impact-row">
                <span>Capacity</span>
                <span>{Math.round(simulationImpact.beforeCapacity)}</span>
                <span>{Math.round(simulationImpact.projectedCapacity)}</span>
                <span>{simulationImpact.capacityDelta >= 0 ? '+' : ''}{Math.round(simulationImpact.capacityDelta)}%</span>
              </div>
              <div className="impact-row">
                <span>Demand</span>
                <span>{Math.round(simulationImpact.beforeDemand)}</span>
                <span>{Math.round(simulationImpact.projectedDemand)}</span>
                <span>{simulationImpact.demandDelta >= 0 ? '+' : ''}{Math.round(simulationImpact.demandDelta)}%</span>
              </div>
              <div className="impact-row">
                <span>Utilization</span>
                <span>{Math.round(simulationImpact.beforeUtilization * 100)}%</span>
                <span>{Math.round(simulationImpact.projectedUtilization * 100)}%</span>
                <span>{simulationImpact.utilizationDelta <= 0 ? '' : '+'}{Math.round((simulationImpact.utilizationDelta) * 100)} pts</span>
              </div>
              <div className="impact-row">
                <span>Risk</span>
                <span className={`status ${riskTone(simulationImpact.riskBefore)}`}>{simulationImpact.riskBefore}</span>
                <span className={`status ${riskTone(simulationImpact.riskAfter)}`}>{simulationImpact.riskAfter}</span>
                <span>{riskOrder[normalizeRisk(simulationImpact.riskAfter)] <= riskOrder[normalizeRisk(simulationImpact.riskBefore)] ? '↓' : '↑'}</span>
              </div>
            </div>

            <div className="before-after-visualization">
              <div>
                <span>Current state</span>
                <div className="comparison-meter">
                  <i style={{ width: `${Math.min(Math.max(simulationImpact.beforeUtilization * 100, 0), 100)}%` }} />
                </div>
                <strong>{Math.round(simulationImpact.beforeUtilization * 100)}%</strong>
              </div>
              <div>
                <span>Projected state</span>
                <div className="comparison-meter comparison-meter--projected">
                  <i style={{ width: `${Math.min(Math.max(simulationImpact.projectedUtilization * 100, 0), 100)}%` }} />
                </div>
                <strong>{Math.round(simulationImpact.projectedUtilization * 100)}%</strong>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-scenario">
            <p>No scenario has been simulated yet.</p>
            <button type="button" className="primary-button" onClick={() => navigate('/simulator')}>
              Run a simulation <ArrowRight size={14} />
            </button>
          </div>
        )}
      </section>

      {simulationImpact && (
        <>
          <section className="data-panel insight-panel">
            <div className="panel-heading">
              <div>
                <h2>Decision impact</h2>
                <p>How the scenario changes operating pressure.</p>
              </div>
              <TrendingUp size={20} />
            </div>
            <div className="decision-impact-grid">
              <article className="decision-impact-card">
                <small>Capacity impact</small>
                <strong>{simulationImpact.capacityDelta >= 0 ? '+' : ''}{Math.round(simulationImpact.capacityDelta)}%</strong>
              </article>
              <article className="decision-impact-card">
                <small>Workload / demand impact</small>
                <strong>{simulationImpact.demandDelta >= 0 ? '+' : ''}{Math.round(simulationImpact.demandDelta)}%</strong>
              </article>
              <article className="decision-impact-card">
                <small>Risk impact</small>
                <strong>{simulationImpact.riskBefore} → {simulationImpact.riskAfter}</strong>
              </article>
            </div>
          </section>

          <section className="data-panel insight-panel">
            <div className="panel-heading">
              <div>
                <h2>Trade-off analysis</h2>
                <p>Potential benefits and follow-on considerations.</p>
              </div>
              <CheckCircle2 size={20} />
            </div>
            <div className="tradeoff-grid">
              <div>
                <h3>Potential benefits</h3>
                <ul>
                  {decisionTradeoffs?.positive.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h3>Potential trade-offs</h3>
                <ul>
                  {decisionTradeoffs?.negative.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </section>

          <section className="data-panel insight-panel insight-panel--highlight">
            <div className="panel-heading">
              <div>
                <h2>Decision insight</h2>
                <p>Clear interpretation of the outcome.</p>
              </div>
              <Lightbulb size={20} />
            </div>
            <p className="decision-insight-copy">{decisionInsight}</p>
            <div className="why-matters">
              <strong>Why this matters</strong>
              <p>Capacity and demand drive utilization, and utilization shapes risk. Under this scenario, the projected balance improves the operating window and reduces pressure on delivery commitments.</p>
            </div>
          </section>
        </>
      )}

      <section className="data-panel insight-panel">
        <div className="panel-heading">
          <div>
            <h2>Next actions</h2>
            <p>Choose the next step in the decision flow.</p>
          </div>
          <MoveRight size={20} />
        </div>
        <div className="next-actions-grid">
          <button type="button" className="action-button" onClick={() => navigate('/simulator')}>View scenario</button>
          <button type="button" className="action-button" onClick={() => navigate('/team-builder')}>Build team</button>
          <button type="button" className="action-button" onClick={() => navigate('/skill-matching')}>Find skill match</button>
          <button type="button" className="action-button" onClick={() => setDecisionSaved((current) => !current)}>{decisionSaved ? 'Decision saved' : 'Save decision'}</button>
        </div>
      </section>
    </DataPage>
  )
}

