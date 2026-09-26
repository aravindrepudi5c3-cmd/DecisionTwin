import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ROOT } from './lib/dataset.mjs'

async function loadEnv() {
  try {
    const contents = await readFile(path.join(ROOT, '.env'), 'utf8')
    return Object.fromEntries(contents.split(/\r?\n/).filter((line) => line && !line.startsWith('#')).map((line) => {
      const [key, ...value] = line.split('=')
      return [key, value.join('=').trim()]
    }))
  } catch {
    return {}
  }
}
const env = await loadEnv()
const url = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Set VITE_SUPABASE_URL and server-only SUPABASE_SERVICE_ROLE_KEY before seeding.')
const manifest = JSON.parse(await readFile(path.join(ROOT, 'data/processed/import-manifest.json'), 'utf8'))
const client = createClient(url, key)
const order = ['skills', 'employees', 'employee_skills', 'projects', 'project_requirements', 'project_required_skills', 'project_members', 'scenarios', 'scenario_members', 'simulation_results', 'notifications']
for (const table of order) {
  const records = manifest[table] ?? []
  if (!records.length) continue
  const conflictKeys = {
    employee_skills: 'employee_id,skill_id',
    project_required_skills: 'project_id,skill_id',
    project_members: 'project_id,employee_id',
    scenario_members: 'scenario_id,employee_id',
    simulation_results: 'scenario_id'
  }
  const { error } = await client.from(table).upsert(records, conflictKeys[table] ? { onConflict: conflictKeys[table] } : undefined)
  if (error) throw new Error(`${table}: ${error.message}`)
  console.log(`${table}: ${records.length}`)
}
