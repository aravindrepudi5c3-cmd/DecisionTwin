import { createContext, useContext } from 'react'
import type { UserProfile, UserRole } from '../types/auth'

export interface LoginParams {
  email: string
  password: string
  role: UserRole
  rememberMe?: boolean
}

export interface SignupParams {
  email: string
  password: string
  role: UserRole
  fullName: string
  organizationName?: string
  githubUsername?: string
  repositoryUrl?: string
}

export interface AuthContextType {
  user: UserProfile | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  isSupabaseConnected: boolean
  login: (params: LoginParams) => Promise<{ success: boolean; error?: string }>
  signup: (params: SignupParams) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  switchRole: (role: UserRole) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
