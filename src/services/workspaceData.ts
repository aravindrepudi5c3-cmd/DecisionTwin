import employeesJson from '../../data/processed/employees.json'
import employeeSkillsJson from '../../data/processed/employee_skills.json'
import projectsJson from '../../data/processed/projects.json'
import projectSkillsJson from '../../data/processed/project_required_skills.json'
import membersJson from '../../data/processed/project_members.json'
import skillsJson from '../../data/processed/skills.json'
import simulationsJson from '../../data/processed/simulation_results.json'
import validationReport from '../../data/reports/validation-report.json'

export type Employee = { id: string; code: string; name: string; role: string; department: string; skills: string[]; workload: number; capacity: number; capacityChange: number; status: 'Available' | 'Limited' | 'Unavailable'; experience: number }
export type Project = { id: string; code: string; name: string; description: string; skills: string[]; status: string; workload: number; capacityRequired: number; priority: string; riskLevel: string; phase: string; businessUnit: string; teamSize: number }
export type Simulation = { id: string; scenarioId: string; name: string; projectId: string; demand: number; capacity: number; utilization: number; riskLevel: string; capacityChange: number; demandChange: number; backlog: number; completed: number }

// Generated JSON is intentionally treated as an untyped boundary before mapping into UI records.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecordValue = Record<string, any>
const employees = employeesJson as RecordValue[]
const employeeSkills = employeeSkillsJson as RecordValue[]
const projects = projectsJson as RecordValue[]
const projectSkills = projectSkillsJson as RecordValue[]
const members = membersJson as RecordValue[]
const skills = skillsJson as RecordValue[]
const simulations = simulationsJson as RecordValue[]
const skillById = new Map(skills.map((skill) => [skill.id, skill.name]))
const skillRows = new Map<string, string[]>()
for (const row of employeeSkills) skillRows.set(row.employee_id, [...(skillRows.get(row.employee_id) ?? []), skillById.get(row.skill_id) ?? 'Generalist'])
const numericSeed = (value: string) => [...value].reduce((total, character) => total + character.charCodeAt(0), 0)
const workloadFor = (employee: RecordValue) => 38 + (numericSeed(employee.employee_code) % 54)
const projectWorkloadFor = (project: RecordValue) => 35 + (numericSeed(project.project_code) % 61)

export const employeeRecords: Employee[] = employees.map((employee) => {
  const workload = workloadFor(employee)
  return { id: employee.id, code: employee.employee_code, name: employee.name ?? employee.employee_code, role: employee.role ?? 'Unassigned', department: employee.department ?? (employee.role?.includes('Data') || employee.role?.includes('ML') ? 'Data & AI' : 'Technology'), skills: skillRows.get(employee.id) ?? [], workload, capacity: 100 - workload, capacityChange: numericSeed(employee.employee_code) % 31 - 15, status: workload > 80 ? 'Unavailable' : workload > 60 ? 'Limited' : 'Available', experience: employee.experience_years ?? 0 }
})

export const projectRecords: Project[] = projects.map((project) => {
  const required = projectSkills.filter((row) => row.project_id === project.id).map((row) => skillById.get(row.skill_id) ?? 'Generalist')
  const workload = projectWorkloadFor(project)
  return { id: project.id, code: project.project_code, name: project.name, description: project.description ?? `${project.project_type ?? 'Technology'} initiative in ${project.business_unit ?? 'the workspace'}.`, skills: [...new Set(required)], status: project.status, workload, capacityRequired: Math.max(workload, (project.team_size_required ?? 1) * 8), priority: project.priority, riskLevel: project.risk_level, phase: project.project_phase ?? 'Planning', businessUnit: project.business_unit ?? 'Technology', teamSize: project.team_size_required ?? 0 }
})

export const simulationRecords: Simulation[] = simulations.map((simulation, index) => {
  const project = projectRecords[index % projectRecords.length]
  return { id: simulation.id, scenarioId: simulation.scenario_id, name: `Scenario ${index + 1}`, projectId: project.id, demand: simulation.simulated_demand ?? project.workload, capacity: simulation.projected_capacity ?? project.capacityRequired, utilization: simulation.projected_utilization ?? 0, riskLevel: simulation.risk_level ?? 'Medium', capacityChange: simulation.tradeoffs?.capacity_change_pct ?? 0, demandChange: simulation.tradeoffs?.demand_change_pct ?? 0, backlog: simulation.simulated_backlog ?? 0, completed: simulation.simulated_completed ?? 0 }
})

export const validation = validationReport as { valid: boolean; errors: string[] }
export const skillsList = [...new Set(skills.map((skill) => skill.name).filter((name) => !name.startsWith('DecisionTwin')))].sort()
export const projectMembers = members as RecordValue[]
export const findProject = (id: string) => projectRecords.find((project) => project.id === id) ?? projectRecords[0]
export const findProjectById = (id: string | undefined) => projectRecords.find((project) => project.id === id)

export function assignedTeamFor(projectId: string) {
  const assignedIds = new Set(projectMembers.filter((member) => member.project_id === projectId).map((member) => member.employee_id))
  return employeeRecords.filter((employee) => assignedIds.has(employee.id))
}

export function skillGapsFor(project: Project, team = assignedTeamFor(project.id)) {
  const coveredSkills = new Set(team.flatMap((employee) => employee.skills))
  return project.skills.filter((skill) => !coveredSkills.has(skill))
}

export function skillMatchingUrl(project: Project) {
  const skills = project.skills.filter((skill) => skillsList.includes(skill))
  const params = new URLSearchParams()
  if (skills.length) params.set('skills', skills.join(','))
  return skills.length ? `/skill-matching?${params.toString()}` : '/skill-matching'
}
