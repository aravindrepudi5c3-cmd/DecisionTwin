import { readDataset, frequency, number, values, writeJson } from './lib/dataset.mjs'

const dataset = await readDataset()
const { headers, rows } = dataset
const numericFields = headers.filter((header) => rows.length > 0 && rows.every((row) => row[header] === '' || number(row[header]) !== null))
const missingValues = Object.fromEntries(headers.map((header) => [header, rows.filter((row) => !row[header]).length]))
const duplicateCounts = Object.fromEntries(['record_id', 'project_id', 'employee_id', 'team_id', 'scenario_id'].map((key) => {
  const seen = new Set()
  const duplicates = rows.filter((row) => row[key] && seen.has(row[key])).length
  for (const row of rows) if (row[key]) seen.add(row[key])
  return [key, duplicates]
}))
const ranges = Object.fromEntries(numericFields.map((field) => {
  const numbers = rows.map((row) => number(row[field])).filter((value) => value !== null)
  return [field, numbers.length ? { min: Math.min(...numbers), max: Math.max(...numbers) } : null]
}))
const report = {
  source_path: dataset.sourcePath,
  source_missing: dataset.source_missing ?? false,
  source_exists_but_empty: headers.length === 0,
  total_rows: rows.length,
  total_columns: headers.length,
  columns: headers,
  unique_counts: Object.fromEntries(['organization_id', 'project_id', 'employee_id', 'team_id', 'scenario_id'].map((key) => [key, values(rows, key).length])),
  distinct_values: {
    employee_roles: values(rows, 'employee_role'),
    project_types: values(rows, 'project_type'),
    project_phases: values(rows, 'project_phase'),
    project_priorities: values(rows, 'project_priority'),
    risk_types: values(rows, 'risk_type'),
    scenario_names: values(rows, 'scenario_name')
  },
  distributions: {
    employee_roles: frequency(rows, 'employee_role'),
    project_types: frequency(rows, 'project_type'),
    project_phases: frequency(rows, 'project_phase'),
    project_priorities: frequency(rows, 'project_priority'),
    risk_levels: frequency(rows, 'risk_level'),
    scenario_names: frequency(rows, 'scenario_name')
  },
  missing_values: missingValues,
  duplicate_values: duplicateCounts,
  numeric_ranges: ranges
}
await writeJson('data/reports/profile-report.json', report)
console.log(JSON.stringify(report, null, 2))
