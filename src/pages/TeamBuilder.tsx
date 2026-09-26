import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Gauge,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataPage } from '../components/common/index.ts'
import { employeeRecords, findProject, projectRecords } from '../services/workspaceData.ts'

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function TeamBuilder() {
  const navigate = useNavigate()
  const [projectId, setProjectId] = useState(projectRecords[0]?.id ?? '')
  const [selectedIds, setSelectedIds] = useState<string[]>(employeeRecords.slice(0, 4).map((employee) => employee.id))

  const project = findProject(projectId)
  const selected = employeeRecords.filter((employee) => selectedIds.includes(employee.id))
  const available = employeeRecords.filter((employee) => !selectedIds.includes(employee.id)).slice(0, 18)

  const selectedSkills = useMemo(() => [...new Set(selected.flatMap((employee) => employee.skills))], [selected])
  const missingSkills = project.skills.filter((skill) => !selectedSkills.includes(skill))
  const skillCoverage = project.skills.length
    ? Math.round((project.skills.filter((skill) => selectedSkills.includes(skill)).length / project.skills.length) * 100)
    : 0
  const capacityCoverage = project.capacityRequired
    ? Math.min(100, Math.round((selected.reduce((total, employee) => total + employee.capacity, 0) / project.capacityRequired) * 100))
    : 0
  const workloadBalance = selected.length
    ? Math.round(100 - selected.reduce((total, employee) => total + employee.workload, 0) / selected.length)
    : 0

  const teamRisk =
    skillCoverage < 70 || capacityCoverage < 70 || selected.some((employee) => employee.workload > 82)
      ? 'MEDIUM'
      : 'LOW'

  const recommendationMap = useMemo(() => {
    const map = new Set<string>()
    for (const employee of available) {
      const overlap = employee.skills.filter((skill) => project.skills.includes(skill)).length
      const isStrongCandidate = overlap > 0 && employee.capacity >= 60 && employee.workload <= 80
      if (isStrongCandidate) {
        map.add(employee.id)
      }
    }
    return map
  }, [available, project.skills])

  const teamHealth = [
    { label: 'Skill Coverage', value: `${skillCoverage}%`, width: skillCoverage },
    { label: 'Capacity Coverage', value: `${capacityCoverage}%`, width: capacityCoverage },
    { label: 'Workload Balance', value: `${workloadBalance}%`, width: workloadBalance },
    { label: 'Resource Utilization', value: `${Math.min(100, clamp(selected.reduce((sum, employee) => sum + employee.workload, 0) / Math.max(selected.length, 1), 0, 100))}%`, width: clamp(selected.reduce((sum, employee) => sum + employee.workload, 0) / Math.max(selected.length, 1), 0, 100) },
  ]

  const skillBreakdown = project.skills.map((skill) => {
    const individualsWithSkill = selected.filter((employee) => employee.skills.includes(skill)).length
    const percent = selected.length ? Math.round((individualsWithSkill / selected.length) * 100) : 0
    return { skill, percent }
  })

  const teamRisks = [
    missingSkills.length > 0 ? { label: `Missing ${missingSkills[0]}` , detail: 'This requirement is still unfilled in the current team configuration.', level: 'HIGH' } : null,
    selected.some((employee) => employee.workload > 80) ? { label: 'High workload on selected staff', detail: 'At least one selected employee is operating beyond the preferred workload band.', level: 'MEDIUM' } : null,
    capacityCoverage < 80 ? { label: 'Capacity may be insufficient', detail: 'The proposed team sits below the current project capacity requirement.', level: 'MEDIUM' } : null,
  ].filter(Boolean) as Array<{ label: string; detail: string; level: string }>

  const comparison = {
    current: { skill: 78, capacity: 69, workload: 88, risk: 'High' },
    proposed: { skill: skillCoverage, capacity: capacityCoverage, workload: workloadBalance, risk: teamRisk },
  }

  const toggleEmployee = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const resetTeam = () => setSelectedIds(employeeRecords.slice(0, 4).map((employee) => employee.id))

  const openScenario = (source: string) => navigate(`/simulator?project=${encodeURIComponent(project.name)}&source=${encodeURIComponent(source)}`)

  return (
    <DataPage
      eyebrow="Decision tools"
      title="Team builder"
      description="Build a proposed team while balancing skills, capacity, workload, and project constraints."
    >
      <section className="team-builder-shell">
        <div className="toolbar standalone">
          <label className="field">
            <span>Project</span>
            <select value={project.id} onChange={(event) => setProjectId(event.target.value)}>
              {projectRecords.slice(0, 40).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="team-builder-grid team-builder-grid--top">
          <section className="team-builder-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Project requirements</p>
                <h2>{project.name}</h2>
              </div>
              <Target size={18} />
            </div>
            <div className="requirement-list">
              {project.skills.map((skill) => (
                <div key={skill} className="requirement-item">
                  <span>{skill}</span>
                  <span className="requirement-pill">Required</span>
                </div>
              ))}
            </div>
          </section>

          <section className="team-builder-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Selected team</p>
                <h2>{selected.length} members</h2>
              </div>
              <Users size={18} />
            </div>
            <div className="team-summary">
              <div className="team-summary__row">
                <span>Skill Coverage</span>
                <strong>{skillCoverage}%</strong>
              </div>
              <div className="team-summary__row">
                <span>Capacity Coverage</span>
                <strong>{capacityCoverage}%</strong>
              </div>
              <div className="team-summary__row">
                <span>Workload Balance</span>
                <strong>{workloadBalance}%</strong>
              </div>
              <div className="team-summary__row">
                <span>Risk</span>
                <strong>{teamRisk}</strong>
              </div>
            </div>
            <div className="compact-list selected-list">
              {selected.map((employee) => (
                <div className="person-row selected-person" key={employee.id}>
                  <span className="avatar small">{employee.code.slice(-2)}</span>
                  <span>
                    <strong>{employee.name}</strong>
                    <small>
                      {employee.role} · {employee.workload}% workload
                    </small>
                  </span>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Remove ${employee.name}`}
                    onClick={() => toggleEmployee(employee.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="builder-layout">
          <section className="data-panel">
            <div className="panel-heading">
              <div>
                <h2>Available employees</h2>
                <p>Add people to the proposed team</p>
              </div>
            </div>
            <div className="compact-list">
              {available.map((employee) => {
                const overlap = employee.skills.filter((skill) => project.skills.includes(skill)).length
                const matchPercent = project.skills.length ? Math.round((overlap / project.skills.length) * 100) : 0
                const isRecommended = recommendationMap.has(employee.id)

                return (
                  <div className="person-row candidate-row" key={employee.id}>
                    <span className="avatar small">{employee.code.slice(-2)}</span>
                    <div className="candidate-info">
                      <strong>{employee.name}</strong>
                      <small>{employee.role}</small>
                    </div>
                    <div className="candidate-metrics">
                      <span>Skill Match {matchPercent}%</span>
                      <span>Capacity {employee.capacity}%</span>
                      <span>Workload {employee.workload}%</span>
                    </div>
                    {isRecommended ? <span className="recommend-badge">Recommended</span> : null}
                    <button type="button" className="candidate-add" onClick={() => toggleEmployee(employee.id)}>
                      <Plus size={14} />
                      Add
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="data-panel">
            <div className="panel-heading">
              <div>
                <h2>Team health</h2>
                <p>Balance of capacity, workload, and coverage</p>
              </div>
              <Gauge size={18} />
            </div>
            <div className="health-stack">
              {teamHealth.map((item) => (
                <div className="health-stack__row" key={item.label}>
                  <div className="health-stack__meta">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${item.width}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="team-status-group">
              <div className="panel-heading panel-heading--small">
                <div>
                  <h2>Team risks</h2>
                </div>
                <AlertTriangle size={16} />
              </div>
              {teamRisks.length ? (
                <div className="risk-list">
                  {teamRisks.map((risk) => (
                    <div key={risk.label} className="risk-item">
                      <span className={`severity-badge ${risk.level === 'HIGH' ? 'severity-high' : 'severity-medium'}`}>
                        {risk.level}
                      </span>
                      <div>
                        <strong>{risk.label}</strong>
                        <small>{risk.detail}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="success-box">
                  <CheckCircle2 size={16} />
                  Current team is within the supported operating range.
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="data-panel team-skill-panel">
          <div className="panel-heading">
            <div>
              <h2>Skill coverage</h2>
              <p>Review the distribution of critical capabilities</p>
            </div>
            <Sparkles size={18} />
          </div>
          <div className="skill-coverage-list">
            {skillBreakdown.map((item) => (
              <div className="skill-coverage-row" key={item.skill}>
                <span>{item.skill}</span>
                <div className="bar bar--wide">
                  <i style={{ width: `${item.percent}%` }} />
                </div>
                <strong>{item.percent}%</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="data-panel decision-options-panel">
          <div className="panel-heading">
            <div>
              <h2>Decision options</h2>
              <p>Actions based on the current team condition</p>
            </div>
            <Target size={18} />
          </div>
          <div className="decision-grid">
            {[
              {
                title: 'Optimize team',
                description: 'Find a better employee combination for the current project requirement.',
                cta: 'Optimize →',
                action: () => navigate('/skill-matching'),
              },
              {
                title: 'Find skill match',
                description: 'Surface employees who can cover the current missing skill gaps.',
                cta: 'Find match →',
                action: () => navigate('/skill-matching'),
              },
              {
                title: 'Simulate team',
                description: 'Evaluate the proposed team against project capacity and demand assumptions.',
                cta: 'Simulate →',
                action: () => openScenario('team-builder'),
              },
            ].map((option) => (
              <article className="decision-card" key={option.title}>
                <strong>{option.title}</strong>
                <p>{option.description}</p>
                <button type="button" className="primary-button" onClick={option.action}>
                  {option.cta}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="data-panel comparison-panel">
          <div className="panel-heading">
            <div>
              <h2>Team comparison</h2>
              <p>Current team versus proposed team</p>
            </div>
            <TrendingUp size={18} />
          </div>
          <div className="comparison-table">
            <div className="comparison-row comparison-row--head">
              <span>Metric</span>
              <span>Current</span>
              <span>Proposed</span>
            </div>
            <div className="comparison-row">
              <span>Skill Coverage</span>
              <strong>{comparison.current.skill}%</strong>
              <strong>{comparison.proposed.skill}%</strong>
            </div>
            <div className="comparison-row">
              <span>Capacity</span>
              <strong>{comparison.current.capacity}%</strong>
              <strong>{comparison.proposed.capacity}%</strong>
            </div>
            <div className="comparison-row">
              <span>Workload</span>
              <strong>{comparison.current.workload}%</strong>
              <strong>{comparison.proposed.workload}%</strong>
            </div>
            <div className="comparison-row">
              <span>Risk</span>
              <strong>{comparison.current.risk}</strong>
              <strong>{comparison.proposed.risk}</strong>
            </div>
          </div>
        </section>

        <div className="team-builder-actions">
          <button type="button" className="ghost-button" onClick={resetTeam}>
            Reset team
          </button>
          <button type="button" className="ghost-button" onClick={() => navigate('/skill-matching')}>
            Optimize team
          </button>
          <button type="button" className="primary-button" onClick={() => openScenario('team-builder')}>
            Simulate team <ArrowRight size={14} />
          </button>
          <button type="button" className="ghost-button" onClick={() => navigate('/projects')}>
            Save team
          </button>
        </div>
      </section>
    </DataPage>
  )
}

