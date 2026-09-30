// Deterministic Rule-Based Impact Simulation Engine for Developer Twin
// Module: Developer Twin ("Simulate Before You Commit")

import type {
  AffectedComponentDetail,
  ChangeType,
  DeveloperComponent,
  DeveloperDependency,
  DeveloperProject,
  ImpactAnalysisSimulation,
  TestPriority,
} from '../../../types/developer'
import { calculateRisk } from './riskEngine'

export interface SimulateImpactParams {
  project: DeveloperProject
  targetComponent: DeveloperComponent
  changeType: ChangeType
  currentValue: string
  proposedValue: string
  description: string
  allComponents: DeveloperComponent[]
  allDependencies: DeveloperDependency[]
}

export function simulateChangeImpact(params: SimulateImpactParams): ImpactAnalysisSimulation {
  const {
    project,
    targetComponent,
    changeType,
    currentValue,
    proposedValue,
    description,
    allComponents,
    allDependencies,
  } = params

  const componentMap = new Map<string, DeveloperComponent>()
  allComponents.forEach((c) => componentMap.set(c.id, c))

  // Graph traversal to trace direct and transitive consumers
  // An edge (source -> target) where target is the modified component means source depends on target
  // An edge (target -> source) where target is source and dep is 'imports' / 'calls' also establishes linkage
  const directAffectedIds = new Set<string>()
  const directRelationshipMap = new Map<string, string>()

  allDependencies.forEach((dep) => {
    if (dep.target_component_id === targetComponent.id) {
      directAffectedIds.add(dep.source_component_id)
      directRelationshipMap.set(dep.source_component_id, dep.dependency_type || 'depends_on')
    } else if (dep.source_component_id === targetComponent.id) {
      // If targetComponent calls or uses another component, schema/api changes might impact the boundary
      directAffectedIds.add(dep.target_component_id)
      directRelationshipMap.set(dep.target_component_id, `reverse_${dep.dependency_type || 'uses'}`)
    }
  })

  // Transitive downstream traversal (BFS)
  const transitiveAffectedIds = new Set<string>()
  const transitiveRelationshipMap = new Map<string, string>()
  const queue = Array.from(directAffectedIds)

  while (queue.length > 0) {
    const currentId = queue.shift()!
    allDependencies.forEach((dep) => {
      let nextId: string | null = null
      if (dep.target_component_id === currentId) {
        nextId = dep.source_component_id
      } else if (dep.source_component_id === currentId && dep.dependency_type === 'calls') {
        nextId = dep.target_component_id
      }

      if (
        nextId &&
        nextId !== targetComponent.id &&
        !directAffectedIds.has(nextId) &&
        !transitiveAffectedIds.has(nextId)
      ) {
        transitiveAffectedIds.add(nextId)
        transitiveRelationshipMap.set(nextId, `transitive via ${componentMap.get(currentId)?.name || 'upstream'}`)
        queue.push(nextId)
      }
    })
  }

  // Build AffectedComponentDetail array
  const affectedComponents: AffectedComponentDetail[] = []

  // 1. Target component itself is always affected directly
  affectedComponents.push({
    component: targetComponent,
    reason: `Direct origin of ${changeType}: ${currentValue} → ${proposedValue}`,
    dependencyRelationship: 'Origin',
    riskContribution: 3,
    direct: true,
  })

  // 2. Direct consumers
  directAffectedIds.forEach((compId) => {
    const comp = componentMap.get(compId)
    if (comp) {
      const rel = directRelationshipMap.get(compId) || 'depends_on'
      affectedComponents.push({
        component: comp,
        reason: `Directly invokes or depends on ${targetComponent.name} (${rel}). Consumes modified interfaces or data contracts.`,
        dependencyRelationship: rel,
        riskContribution: 2,
        direct: true,
      })
    }
  })

  // 3. Transitive consumers
  transitiveAffectedIds.forEach((compId) => {
    const comp = componentMap.get(compId)
    if (comp) {
      const rel = transitiveRelationshipMap.get(compId) || 'downstream'
      affectedComponents.push({
        component: comp,
        reason: `Transitively impacted via ${rel}. Downstream transaction propagation may experience payload mismatch.`,
        dependencyRelationship: rel,
        riskContribution: 1,
        direct: false,
      })
    }
  })

  // Calculate risk using Risk Engine
  const directCount = directAffectedIds.size
  const downstreamCount = transitiveAffectedIds.size
  const risk = calculateRisk(changeType, directCount, downstreamCount)

  // Deduce affected files
  const affectedFilesSet = new Set<string>()
  if (targetComponent.file_path) {
    affectedFilesSet.add(targetComponent.file_path)
  } else {
    affectedFilesSet.add(`src/services/${targetComponent.name.toLowerCase().replace(/\s+/g, '-')}.ts`)
  }

  if (changeType === 'Database Schema Change') {
    affectedFilesSet.add('db/migrations/2026_change_schema.sql')
    affectedFilesSet.add('src/models/schema.prisma')
  } else if (changeType === 'API Change') {
    affectedFilesSet.add('docs/openapi.yaml')
    affectedFilesSet.add('src/routes/api-router.ts')
  } else if (changeType === 'Authentication Change') {
    affectedFilesSet.add('src/middleware/auth.ts')
    affectedFilesSet.add('src/utils/jwt.ts')
  }

  affectedComponents.forEach((item) => {
    if (item.component.file_path) {
      affectedFilesSet.add(item.component.file_path)
    } else {
      affectedFilesSet.add(`src/components/${item.component.name.toLowerCase().replace(/\s+/g, '-')}.ts`)
    }
  })

  const affectedFiles = Array.from(affectedFilesSet)

  // Deduce affected APIs
  const affectedApisSet = new Set<string>()
  const cleanName = targetComponent.name.toLowerCase().replace(/\s+/g, '-').replace('-service', '')
  affectedApisSet.add(`GET /api/v1/${cleanName}s/:id`)
  affectedApisSet.add(`PATCH /api/v1/${cleanName}s/:id`)

  affectedComponents.forEach((item) => {
    const name = item.component.name.toLowerCase().replace(/\s+/g, '-').replace('-service', '')
    if (item.component.type === 'API' || item.component.type === 'service' || item.component.type === 'backend') {
      affectedApisSet.add(`POST /api/v1/${name}/execute`)
      if (item.direct) {
        affectedApisSet.add(`GET /api/v1/${name}/status`)
      }
    }
  })

  const affectedApis = Array.from(affectedApisSet).slice(0, 8)

  // Generate Recommended Tests
  const recommendedTests: Array<{
    name: string
    description: string
    priority: TestPriority
  }> = []

  if (changeType === 'Database Schema Change' || changeType === 'Data Type Change') {
    recommendedTests.push({
      name: 'Database Migration & Rollback Dry-Run',
      description: `Execute schema migration dry-run on staging replica to verify non-destructive table alteration from ${currentValue} to ${proposedValue}.`,
      priority: 'CRITICAL',
    })
    recommendedTests.push({
      name: `${targetComponent.name} Data Contract & Serialization Test`,
      description: `Validate JSON serialization, ORM entity mappings, and input validation schemas for ${targetComponent.name}.`,
      priority: 'HIGH',
    })
  } else if (changeType === 'API Change') {
    recommendedTests.push({
      name: `${targetComponent.name} OpenAPI Schema Breaking Change Check`,
      description: 'Diff OpenAPI v3 specification against latest production baseline to detect unannounced payload contract breaks.',
      priority: 'CRITICAL',
    })
    recommendedTests.push({
      name: 'API Gateway Route Forwarding & Backward Compatibility Test',
      description: 'Verify backward-compatibility headers and error handling for legacy API consumers.',
      priority: 'HIGH',
    })
  } else if (changeType === 'Authentication Change') {
    recommendedTests.push({
      name: 'Token Verification & Session Lifecycle Test',
      description: 'Simulate valid, expired, and revoked credentials across all protected microservice routes.',
      priority: 'CRITICAL',
    })
  } else {
    recommendedTests.push({
      name: `${targetComponent.name} Unit & Boundary Test Suite`,
      description: `Run localized test coverage for ${targetComponent.name} targeting the modified logic.`,
      priority: 'HIGH',
    })
  }

  // Add tests for direct consumers
  affectedComponents
    .filter((c) => c.direct && c.component.id !== targetComponent.id)
    .slice(0, 3)
    .forEach((c) => {
      recommendedTests.push({
        name: `${c.component.name} ↔ ${targetComponent.name} Integration Test`,
        description: `Execute integration test suite verifying communication, status codes, and payload contracts across ${c.dependencyRelationship}.`,
        priority: 'HIGH',
      })
    })

  // Add regression tests for transitive consumers
  affectedComponents
    .filter((c) => !c.direct)
    .slice(0, 2)
    .forEach((c) => {
      recommendedTests.push({
        name: `${c.component.name} End-to-End Regression Test`,
        description: `Run synthetic smoke workflow to ensure downstream customer experience is unaffected.`,
        priority: 'MEDIUM',
      })
    })

  // Overall E2E Suite
  recommendedTests.push({
    name: 'Full Blast Radius End-to-End Smoke Test',
    description: `Execute end-to-end smoke test suite spanning ${affectedComponents.length} affected components and ${affectedApis.length} endpoints.`,
    priority: risk.riskLevel === 'CRITICAL' || risk.riskLevel === 'HIGH' ? 'HIGH' : 'LOW',
  })

  // Impact summary
  const impactSummary = `This change modifies ${targetComponent.name} (${changeType}: "${currentValue}" → "${proposedValue}"). ${risk.changeTypeReason} The simulation traced ${directCount} direct dependencies and ${downstreamCount} transitive downstream components across ${affectedFiles.length} files and ${affectedApis.length} API endpoints. Technical risk assessed at ${risk.riskLevel} (score: ${risk.totalScore}/15).`

  return {
    project,
    targetComponent,
    changeType,
    currentValue,
    proposedValue,
    description: description || `Change ${targetComponent.name} from ${currentValue} to ${proposedValue}`,
    riskLevel: risk.riskLevel,
    riskScore: risk.totalScore,
    affectedComponents,
    affectedFiles,
    affectedApis,
    impactSummary,
    recommendedTests,
  }
}
