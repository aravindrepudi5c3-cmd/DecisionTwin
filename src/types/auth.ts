export type UserRole = 'manager' | 'developer'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  role: UserRole
  organizationName?: string
  githubUsername?: string
  repositoryUrl?: string
  avatarUrl?: string
  createdAt?: string
}

export interface AuthState {
  user: UserProfile | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  isSupabaseConnected: boolean
}
