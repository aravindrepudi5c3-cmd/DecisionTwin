// Developer Twin Types
// Pure Developer domain models - strictly separated from Manager models

export type ComponentType =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'API'
  | 'service'
  | 'module'
  | 'component'
  | 'middleware'

export type DependencyType =
  | 'imports'
  | 'calls'
  | 'depends_on'
  | 'uses'
  | 'database_access'
  | 'API_call'

export type ChangeType =
  | 'Database Schema Change'
  | 'API Change'
  | 'Function Change'
  | 'Component Change'
  | 'Dependency Change'
  | 'Configuration Change'
  | 'Authentication Change'
  | 'Data Type Change'
  | 'Architecture Change'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type TestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface DeveloperProject {
  id: string
  developer_id: string
  name: string
  description: string | null
  repository_url: string | null
  language: string | null
  framework: string | null
  created_at: string
  updated_at: string
  // Aggregated metadata
  components_count?: number
  dependencies_count?: number
  analyses_count?: number
  last_analysis_date?: string | null
  risk_status?: RiskLevel | 'NONE'
}

export interface DeveloperComponent {
  id: string
  project_id: string
  name: string
  type: ComponentType | string
  file_path: string | null
  created_at: string
}

export interface DeveloperDependency {
  id: string
  project_id: string
  source_component_id: string
  target_component_id: string
  dependency_type: DependencyType | string
  created_at: string
  source_component?: DeveloperComponent
  target_component?: DeveloperComponent
}

export interface AnalysisHistory {
  id: string
  developer_id: string
  project_id: string
  change_description: string
  change_type: string
  status: string
  created_at: string
  project_name?: string
  impact_report?: ImpactReport
  test_recommendations?: TestRecommendation[]
}

export interface ImpactReport {
  id: string
  analysis_id: string
  risk_level: RiskLevel
  risk_score: number
  affected_components: number
  affected_files: number
  affected_apis: number
  impact_summary: string
  created_at: string
}

export interface TestRecommendation {
  id: string
  analysis_id: string
  test_name: string
  description: string
  priority: TestPriority
  completed: boolean
  created_at: string
}

export interface AffectedComponentDetail {
  component: DeveloperComponent
  reason: string
  dependencyRelationship: string
  riskContribution: number
  direct: boolean
}

export interface ImpactAnalysisSimulation {
  project: DeveloperProject
  targetComponent: DeveloperComponent
  changeType: ChangeType
  currentValue: string
  proposedValue: string
  description: string
  riskLevel: RiskLevel
  riskScore: number
  affectedComponents: AffectedComponentDetail[]
  affectedFiles: string[]
  affectedApis: string[]
  impactSummary: string
  recommendedTests: Array<{
    name: string
    description: string
    priority: TestPriority
  }>
}
