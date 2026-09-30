export type UserRole = 'manager' | 'developer'

export interface ManagerProfile {
  id: string
  email: string
  fullName: string
  role: 'manager'
  organizationName: string
  avatarUrl?: string
  createdAt?: string
}

export interface DeveloperProfile {
  id: string
  email: string
  fullName: string
  role: 'developer'
  githubUsername?: string
  repositoryUrl?: string
  avatarUrl?: string
  createdAt?: string
}

export type UserProfile = ManagerProfile | DeveloperProfile

export interface AuthState {
  managerUser: ManagerProfile | null
  developerUser: DeveloperProfile | null
  activeRole: UserRole | null
  isLoading: boolean
  isSupabaseConnected: boolean
}
