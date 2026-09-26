import { ArrowLeft, ArrowRight, BriefcaseBusiness } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { DataPage } from '../components/common/index.ts'
import { assignedTeamFor, findProjectById, skillGapsFor, skillMatchingUrl } from '../services/workspaceData.ts'

function statusClass(status: string) {
  return `status ${status.toLowerCase().replaceAll(' ', '-')}`
}

export function ProjectDetail() {
  const { projectId } = useParams()
  const project = findProjectById(projectId)

  if (!project) {
    return (
      <DataPage eyebrow="Portfolio" title="Project not found" description="The selected project is not in the connected dataset.">
        <section className="data-panel">
          <Link className="inline-link" to="/projects">
            <ArrowLeft size={15} /> Back to projects
          </Link>
          <p className="muted-cell">Choose another project from the portfolio list.</p>
        </section>
      </DataPage>
    )
  }

  const assignedTeam = assignedTeamFor(project.id)
  const skillGaps = skillGapsFor(project, assignedTeam)
  const matchingUrl = skillMatchingUrl(project)

  return (
    <DataPage eyebrow="Portfolio" title={project.name} description={project.description}>
      <section className="data-panel project-detail">
        <Link className="inline-link" to="/projects">
          <ArrowLeft size={15} /> Back to projects
        </Link>
        <div className="project-detail-title">
          <span className="project-symbol">
            <BriefcaseBusiness size={17} />
          </span>
          <div>
            <p className="eyebrow">Project detail</p>
            <h2>{project.name}</h2>
            <small>
              {project.code} · {project.phase}
            </small>
          </div>
        </div>
        <div className="detail-grid">
          <div>
            <small>Project ID</small>
            <strong>{project.code}</strong>
          </div>
          <div>
            <small>Department</small>
            <strong>{project.businessUnit}</strong>
          </div>
          <div>
            <small>Status</small>
            <strong>
              <span className={statusClass(project.status)}>{project.status}</span>
            </strong>
          </div>
          <div>
            <small>Phase</small>
            <strong>{project.phase}</strong>
          </div>
          <div>
            <small>Required team size</small>
            <strong>{project.teamSize} people</strong>
          </div>
          <div>
            <small>Required capacity</small>
            <strong>{project.capacityRequired}%</strong>
          </div>
        </div>
        <h3>Required skills</h3>
        <div className="tag-list">
          {project.skills.length ? project.skills.map((skill) => (
            <span className="tag" key={skill}>
              {skill}
            </span>
          )) : <span className="muted-cell">No required skills are listed for this project.</span>}
        </div>
        <h3>Assigned team</h3>
        {assignedTeam.length ? (
          <div className="compact-list">
            {assignedTeam.slice(0, 40).map((employee) => (
              <div className="person-row" key={employee.id}>
                <span>
                  <strong>{employee.code}</strong>
                  <small>
                    {employee.role} · {employee.capacity}% capacity
                  </small>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted-cell">No assigned team is available.</p>
        )}
        {assignedTeam.length > 40 ? <p className="data-note">Showing 40 of {assignedTeam.length} assigned employees.</p> : null}
        <div className={skillGaps.length ? 'warning' : 'success-box'}>
          <strong>{skillGaps.length ? 'Skill gaps detected' : 'Skill coverage complete'}</strong>
          <span>{skillGaps.length ? skillGaps.join(', ') : 'The assigned team covers every required skill.'}</span>
        </div>
        <Link className="button primary full-button" to={matchingUrl}>
          Find Matching Employees <ArrowRight size={15} />
        </Link>
      </section>
    </DataPage>
  )
}
