export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived'

export type ScenarioStatus = 'draft' | 'simulated' | 'selected'

export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: string
  fullName: string
  role: string
  department: string
  location: string | null
  availabilityPercentage: number
}

export interface Skill {
  id: string
  name: string
  proficiency: number
}

export interface Scenario {
  id: string
  projectId: string
  name: string
  status: ScenarioStatus
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  body: string
  readAt: string | null
  createdAt: string
}
