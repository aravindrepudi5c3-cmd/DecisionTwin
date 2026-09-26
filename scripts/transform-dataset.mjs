import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, groupBy, latestRowsBy, number, readDataset, requireRows, stableUuid, writeJson } from './lib/dataset.mjs'

const dataset = await readDataset()
requireRows(dataset)
const mappings = JSON.parse(await readFile(path.join(ROOT, 'data/mappings.json'), 'utf8'))
const roleSkills = JSON.parse(await readFile(path.join(ROOT, 'data/role-skill-mapping.json'), 'utf8'))
const employeeRows = latestRowsBy(dataset.rows, 'employee_id')
const projectRows = latestRowsBy(dataset.rows, 'project_id')
const scenarioRows = latestRowsBy(dataset.rows, 'scenario_id')
const employees = [...employeeRows].map(([employeeId, row]) => ({
  id: stableUuid('employee', employeeId), employee_code: employeeId, name: null,
  role: row.employee_role || null, department: null,
  experience_years: number(row.avg_experience_years), current_workload: null,
  relevant_experience: row.employee_role ? `Role observed in source: ${row.employee_role}` : null,
}))
const skillNames = new Set(Object.entries(roleSkills).filter(([role]) => !role.startsWith('_')).flatMap(([, skills]) => skills))
const skills = [...skillNames].sort().map((name) => ({ id: stableUuid('skill', name), name, category: 'Role-based prototype mapping' }))
const employeeSkills = []
for (const [employeeId, row] of employeeRows) {
  for (const skill of roleSkills[row.employee_role] ?? []) {
    const proficiencyLevel = mappings.skill_level_to_proficiency[row.skill_level]
    if (proficiencyLevel) employeeSkills.push({ employee_id: stableUuid('employee', employeeId), skill_id: stableUuid('skill', skill), proficiency_level: proficiencyLevel })
  }
}
const projects = [...projectRows].map(([projectId, row]) => ({
  id: stableUuid('project', projectId), project_code: projectId, name: row.project_type ? `${row.project_type} (${projectId})` : projectId,
  description: null, team_size_required: number(row.team_size), estimated_workload: null,
  duration_weeks: number(row.planned_delivery_days) ? Math.max(1, Math.ceil(number(row.planned_delivery_days) / 7)) : null,
  deadline: null, priority: row.project_priority || 'Medium', status: mappings.project_phase_to_status[row.project_phase] ?? 'Planning', risk_level: row.risk_level || 'Low',
  project_type: row.project_type || null, project_phase: row.project_phase || null, business_unit: row.business_unit || null, organization_id: row.organization_id || null, organization_name: row.organization_name || null
}))
const requirements = []
for (const [projectId, rows] of groupBy(dataset.rows, 'project_id')) {
  const row = rows.at(-1)
  for (const [sourceField, role] of Object.entries(mappings.role_to_requirement)) {
    const quantity = number(row[sourceField])
    if (quantity > 0) requirements.push({ id: stableUuid('requirement', `${projectId}:${role}`), project_id: stableUuid('project', projectId), role, quantity })
  }
}
const projectRequiredSkills = []
for (const requirement of requirements) {
  for (const skill of roleSkills[requirement.role] ?? []) projectRequiredSkills.push({ project_id: requirement.project_id, skill_id: stableUuid('skill', skill), required_level: 'Intermediate' })
}
const uniqueProjectRequiredSkills = [...new Map(projectRequiredSkills.map((record) => [`${record.project_id}:${record.skill_id}`, record])).values()]
const projectMembers = []
for (const row of dataset.rows) if (row.project_id && row.employee_id) projectMembers.push({ project_id: stableUuid('project', row.project_id), employee_id: stableUuid('employee', row.employee_id), allocation_percentage: null, team_id: row.team_id || null })
const uniqueProjectMembers = [...new Map(projectMembers.map((record) => [`${record.project_id}:${record.employee_id}`, record])).values()]
const scenarios = [...scenarioRows].map(([scenarioId, row]) => ({ id: stableUuid('scenario', scenarioId), project_id: stableUuid('project', row.project_id), name: row.scenario_name || scenarioId, description: 'Simulation estimate based on dataset values and defined assumptions.', scenario_type: mappings.scenario_name_to_type[row.scenario_name] ?? 'Custom Allocation' }))
const scenarioMembers = []
for (const row of dataset.rows) if (row.scenario_id && row.employee_id) scenarioMembers.push({ scenario_id: stableUuid('scenario', row.scenario_id), employee_id: stableUuid('employee', row.employee_id), allocation_percentage: null })
const uniqueScenarioMembers = [...new Map(scenarioMembers.map((record) => [`${record.scenario_id}:${record.employee_id}`, record])).values()]
const simulationResults = [...scenarioRows].map(([scenarioId, row]) => ({
  id: stableUuid('simulation-result', scenarioId), scenario_id: stableUuid('scenario', scenarioId), current_workload: null, projected_workload: null, current_capacity: null, projected_capacity: number(row.simulated_capacity), current_utilization: number(row.current_utilization), projected_utilization: number(row.simulated_utilization), skill_coverage_percentage: null, projected_completion_date: null, risk_level: row.risk_level || 'Low', risks: { bottleneck: row.bottleneck || null, risk_type: row.risk_type || null, resource_risk: row.resource_risk || null, technical_risk: row.technical_risk || null, schedule_risk: row.schedule_risk || null, security_risk: row.security_risk || null, budget_risk: row.budget_risk || null, risk_probability: number(row.risk_probability), risk_impact: number(row.risk_impact), risk_score: number(row.risk_score) }, tradeoffs: { demand_change_pct: number(row.demand_change_pct), staff_change_pct: number(row.staff_change_pct), capacity_change_pct: number(row.capacity_change_pct), cloud_change_pct: number(row.cloud_change_pct), cost_change_pct: number(row.cost_change_pct), automation_change_pct: number(row.automation_change_pct), timeline_change_pct: number(row.timeline_change_pct) }, assumptions: { source_record_id: row.record_id }, simulated_demand: number(row.simulated_demand), simulated_staff: number(row.simulated_staff), simulated_completed: number(row.simulated_completed), simulated_backlog: number(row.simulated_backlog), simulated_delivery_days: number(row.simulated_delivery_days), simulated_cloud_cost: number(row.simulated_cloud_cost), simulated_project_cost: number(row.simulated_project_cost), current_project_cost: number(row.current_project_cost), current_sla_score: number(row.current_sla_score), simulated_sla_score: number(row.simulated_sla_score), current_revenue: number(row.current_revenue), current_profit: number(row.current_profit), simulated_revenue: number(row.simulated_revenue), simulated_profit: number(row.simulated_profit)
}))
const manifest = { employees, skills, employee_skills: employeeSkills, projects, project_requirements: requirements, project_required_skills: uniqueProjectRequiredSkills, project_members: uniqueProjectMembers, scenarios, scenario_members: uniqueScenarioMembers, simulation_results: simulationResults, notifications: [] }
for (const [name, records] of Object.entries(manifest)) await writeJson(`data/processed/${name}.json`, records)
await writeJson('data/processed/import-manifest.json', manifest)
console.log(JSON.stringify(Object.fromEntries(Object.entries(manifest).map(([key, records]) => [key, records.length])), null, 2))
