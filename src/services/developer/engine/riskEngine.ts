// Deterministic Rule-Based Risk Engine for Developer Twin
// Prompt Rule 19:
// Base Risk = 1
// Database Schema Change = +3
// Breaking API Change / API Change = +3
// Authentication Change = +3
// Architecture Change = +3
// Data Type Change = +2
// Configuration Change = +2
// Dependency Change = +2
// Function Change = +1
// Component Change = +1
// Each direct dependency = +1
// Each affected downstream component = +1
//
// Risk Map:
// 0–3: LOW
// 4–6: MEDIUM
// 7–10: HIGH
// 11+: CRITICAL

import type { ChangeType, RiskLevel } from '../../../types/developer'

export interface RiskBreakdown {
  baseScore: number
  changeTypeWeight: number
  changeTypeReason: string
  directDependenciesCount: number
  directDependencyPoints: number
  downstreamComponentsCount: number
  downstreamPoints: number
  totalScore: number
  riskLevel: RiskLevel
}

export function calculateRisk(
  changeType: ChangeType,
  directDependenciesCount: number,
  downstreamComponentsCount: number
): RiskBreakdown {
  const baseScore = 1

  let changeTypeWeight = 1
  let changeTypeReason = 'Standard code/component alteration.'

  switch (changeType) {
    case 'Database Schema Change':
      changeTypeWeight = 3
      changeTypeReason = 'Alters underlying data contracts, requiring schema migration and serialization updates.'
      break
    case 'API Change':
      changeTypeWeight = 3
      changeTypeReason = 'Potential contract breakage across external clients and internal service consumers.'
      break
    case 'Authentication Change':
      changeTypeWeight = 3
      changeTypeReason = 'Modifies security boundaries, session verification, or token lifecycle.'
      break
    case 'Architecture Change':
      changeTypeWeight = 3
      changeTypeReason = 'Broad structural impact across service boundaries and communication topologies.'
      break
    case 'Data Type Change':
      changeTypeWeight = 2
      changeTypeReason = 'Risk of runtime type coercion failures and database marshalling errors.'
      break
    case 'Configuration Change':
      changeTypeWeight = 2
      changeTypeReason = 'Environment variables or system-level switches can trigger subtle operational regressions.'
      break
    case 'Dependency Change':
      changeTypeWeight = 2
      changeTypeReason = 'Third-party package update or module boundary realignment.'
      break
    case 'Function Change':
      changeTypeWeight = 1
      changeTypeReason = 'Localized logic modification with caller impact.'
      break
    case 'Component Change':
      changeTypeWeight = 1
      changeTypeReason = 'Component-level refactor or internal state alteration.'
      break
    default:
      changeTypeWeight = 1
  }

  const directDependencyPoints = directDependenciesCount * 1
  const downstreamPoints = downstreamComponentsCount * 1
  const totalScore = baseScore + changeTypeWeight + directDependencyPoints + downstreamPoints

  let riskLevel: RiskLevel = 'LOW'
  if (totalScore <= 3) {
    riskLevel = 'LOW'
  } else if (totalScore <= 6) {
    riskLevel = 'MEDIUM'
  } else if (totalScore <= 10) {
    riskLevel = 'HIGH'
  } else {
    riskLevel = 'CRITICAL'
  }

  return {
    baseScore,
    changeTypeWeight,
    changeTypeReason,
    directDependenciesCount,
    directDependencyPoints,
    downstreamComponentsCount,
    downstreamPoints,
    totalScore,
    riskLevel,
  }
}
