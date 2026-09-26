import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataPage } from '../components/common/index.ts'
import { projectRecords } from '../services/workspaceData.ts'

function statusClass(status: string) {
  return `status ${status.toLowerCase().replaceAll(' ', '-')}`
}

export function Projects() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [department, setDepartment] = useState('All')
  const departments = [...new Set(projectRecords.map((project) => project.businessUnit))].sort()
  const statuses = [...new Set(projectRecords.map((project) => project.status))].sort()
  const filteredProjects = useMemo(
    () =>
      projectRecords.filter((project) => {
        const searchable = `${project.code} ${project.name} ${project.businessUnit} ${project.skills.join(' ')}`.toLowerCase()
        return searchable.includes(query.toLowerCase()) && (status === 'All' || project.status === status) && (department === 'All' || project.businessUnit === department)
      }),
    [department, query, status],
  )

  return (
    <DataPage eyebrow="Portfolio" title="Projects" description="Explore connected project requirements, assigned teams, and staffing gaps.">
      <section className="data-panel">
        <div className="toolbar project-filters">
          <label className="field search-field">
            <Search size={16} />
            <input aria-label="Search projects" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search project ID, name, or skill" />
          </label>
          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>All</option>
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Department</span>
            <select value={department} onChange={(event) => setDepartment(event.target.value)}>
              <option>All</option>
              {departments.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <span className="toolbar-count">
            {filteredProjects.length} of {projectRecords.length}
          </span>
        </div>
        <div className="table-wrap">
          <table className="project-table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Project name</th>
                <th>Department</th>
                <th>Status</th>
                <th>Required skills</th>
                <th>Required team size</th>
                <th>Required capacity</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.slice(0, 100).map((project) => (
                <tr className="clickable-row" key={project.id} onClick={() => navigate(`/projects/${project.id}`)}>
                  <td>
                    <strong>{project.code}</strong>
                  </td>
                  <td>{project.name}</td>
                  <td>{project.businessUnit}</td>
                  <td>
                    <span className={statusClass(project.status)}>{project.status}</span>
                  </td>
                  <td>
                    <div className="tag-list">
                      {project.skills.slice(0, 3).map((skill) => (
                        <span className="tag" key={skill}>
                          {skill}
                        </span>
                      ))}
                      {project.skills.length > 3 ? <span className="muted-cell">+{project.skills.length - 3}</span> : null}
                    </div>
                  </td>
                  <td>{project.teamSize}</td>
                  <td>{project.capacityRequired}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProjects.length > 100 ? <p className="data-note">Showing the first 100 projects. Refine the search or filters to narrow the list.</p> : null}
          {filteredProjects.length === 0 ? <p className="muted-cell">No projects match the current search or filters.</p> : null}
        </div>
      </section>
    </DataPage>
  )
}
