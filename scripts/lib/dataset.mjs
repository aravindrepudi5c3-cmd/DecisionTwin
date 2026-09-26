import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const SOURCE_CANDIDATES = [
  path.join(ROOT, 'data', 'DecisionTwin_IT_Master_Dataset.csv'),
  path.join(ROOT, 'dist', 'data', 'DecisionTwin_IT_Master_Dataset.csv'),
]

export function findSourcePath() {
  return process.env.DECISIONTWIN_DATASET || SOURCE_CANDIDATES.find((candidate) => candidate)
}

export async function readDataset() {
  const candidates = process.env.DECISIONTWIN_DATASET ? [process.env.DECISIONTWIN_DATASET] : SOURCE_CANDIDATES
  for (const sourcePath of candidates) {
    try {
      const csv = await readFile(sourcePath, 'utf8')
      return parseDataset(csv, sourcePath)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  return { sourcePath: candidates[0], headers: [], rows: [], source_missing: true }
}

function parseDataset(csv, sourcePath) {
  const records = parseCsv(csv)
  const headers = records.shift() ?? []
  const rows = records
    .filter((record) => record.some((value) => value.trim() !== ''))
    .map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index]?.trim() ?? ''])))
  return { sourcePath, headers, rows }
}

export function parseCsv(input) {
  const rows = []
  let row = []
  let value = ''
  let quoted = false

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]
    const next = input[index + 1]
    if (character === '"' && quoted && next === '"') {
      value += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(value)
      value = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(value)
      rows.push(row)
      row = []
      value = ''
    } else {
      value += character
    }
  }
  if (value !== '' || row.length > 0) {
    row.push(value)
    rows.push(row)
  }
  return rows
}

export function number(value) {
  if (value === undefined || value === null || value.trim?.() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function stableUuid(namespace, key) {
  const hash = createHash('sha256').update(`${namespace}:${key}`).digest('hex').slice(0, 32).split('')
  hash[12] = '4'
  hash[16] = ['8', '9', 'a', 'b'][Number.parseInt(hash[16], 16) % 4]
  const hex = hash.join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function latestRowsBy(rows, key) {
  const latest = new Map()
  for (const row of rows) {
    const identity = row[key]
    if (!identity) continue
    const current = latest.get(identity)
    if (!current || new Date(row.timestamp || 0) >= new Date(current.timestamp || 0)) latest.set(identity, row)
  }
  return latest
}

export function groupBy(rows, key) {
  const groups = new Map()
  for (const row of rows) {
    const value = row[key]
    if (!value) continue
    const group = groups.get(value) ?? []
    group.push(row)
    groups.set(value, group)
  }
  return groups
}

export async function writeJson(relativePath, value) {
  const target = path.join(ROOT, relativePath)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export function values(rows, key) {
  return [...new Set(rows.map((row) => row[key]).filter(Boolean))].sort()
}

export function frequency(rows, key) {
  return rows.reduce((result, row) => {
    const value = row[key] || '(missing)'
    result[value] = (result[value] || 0) + 1
    return result
  }, {})
}

export function requireRows(dataset) {
  if (dataset.headers.length === 0 || dataset.rows.length === 0) {
    throw new Error(`Dataset is empty: ${dataset.sourcePath}. Place the read-only master CSV at data/DecisionTwin_IT_Master_Dataset.csv.`)
  }
}
