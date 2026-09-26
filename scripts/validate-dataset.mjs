import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, readDataset, requireRows, number, writeJson } from './lib/dataset.mjs'

const errors = []
try {
  const dataset = await readDataset()
  requireRows(dataset)
  const required = ['record_id', 'project_id', 'employee_id', 'scenario_id']
  for (const field of required) if (!dataset.headers.includes(field)) errors.push(`Missing required source column: ${field}`)
  for (const [index, row] of dataset.rows.entries()) {
    for (const field of ['current_utilization', 'simulated_utilization', 'risk_probability', 'risk_impact', 'risk_score']) {
      const value = number(row[field])
      if (value !== null && (value < 0 || value > 100)) errors.push(`Row ${index + 2}: ${field} must be between 0 and 100`)
    }
    const currentWorkload = number(row.current_workload)
    if (currentWorkload !== null && currentWorkload < 0) errors.push(`Row ${index + 2}: current_workload cannot be negative`)

    const capacityChange = number(row.capacity_change_pct)
    if (row.capacity_change_pct?.trim() && capacityChange === null) {
      errors.push(`Row ${index + 2}: capacity_change_pct must be numeric`)
    }
  }
} catch (error) {
  errors.push(error.message)
}

try {
  const manifest = JSON.parse(await readFile(path.join(ROOT, 'data/processed/import-manifest.json'), 'utf8'))
  for (const relationship of ['employee_skills', 'project_required_skills', 'project_members', 'scenario_members']) {
    const records = manifest[relationship] ?? []
    const keys = records.map((record) => JSON.stringify(record))
    if (new Set(keys).size !== keys.length) errors.push(`Duplicate ${relationship} relationships found`)
  }
} catch {
  if (!errors.length) errors.push('Transformed import manifest is missing; run transform-dataset first.')
}

const report = { valid: errors.length === 0, errors }
await writeJson('data/reports/validation-report.json', report)
console.log(JSON.stringify(report, null, 2))
if (errors.length) process.exitCode = 1
