import { createContext, useContext } from 'react'
import type { ManagerProfile, DeveloperProfile, UserProfile, UserRole } from '../types/auth'

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

export type PasswordUpdateResult =
  | { success: true }
  | { success: false; reason: 'unavailable' | 'invalid-link' | 'weak-password' | 'failed' }

export interface AuthContextType {
  user: UserProfile | null
  managerUser: ManagerProfile | null
  developerUser: DeveloperProfile | null
  role: UserRole | null
  activeRole: UserRole | null
  isAuthenticated: boolean
  isManagerAuthenticated: boolean
  isDeveloperAuthenticated: boolean
  isLoading: boolean
  isSupabaseConnected: boolean
  login: (params: LoginParams) => Promise<{ success: boolean; error?: string }>
  signup: (params: SignupParams) => Promise<{ success: boolean; error?: string }>
  requestPasswordReset: (email: string) => Promise<boolean>
  updatePassword: (password: string) => Promise<PasswordUpdateResult>
  logout: (role?: UserRole) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
