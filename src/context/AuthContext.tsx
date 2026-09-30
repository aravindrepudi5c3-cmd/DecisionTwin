import React, { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../services/supabase'
import type { ManagerProfile, DeveloperProfile, UserRole } from '../types/auth'
import {
  AuthContext,
  type LoginParams,
  type SignupParams,
} from './auth-context-base'

const STORAGE_KEY_MANAGER = 'decisiontwin_manager_session'
const STORAGE_KEY_DEVELOPER = 'decisiontwin_developer_session'
const STORAGE_KEY_ACTIVE_ROLE = 'decisiontwin_active_role'
const STORAGE_KEY_MGR_ACCOUNTS = 'decisiontwin_manager_accounts'
const STORAGE_KEY_DEV_ACCOUNTS = 'decisiontwin_developer_accounts'

interface StoredAccount {
  email: string
  passwordHash: string
  profile: ManagerProfile | DeveloperProfile
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [managerUser, setManagerUser] = useState<ManagerProfile | null>(null)
  const [developerUser, setDeveloperUser] = useState<DeveloperProfile | null>(null)
  const [activeRole, setActiveRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Initialize independent auth states
  useEffect(() => {
    async function initAuth() {
      try {
        // Load active role
        const savedActiveRole = localStorage.getItem(STORAGE_KEY_ACTIVE_ROLE) as UserRole | null
        if (savedActiveRole === 'manager' || savedActiveRole === 'developer') {
          setActiveRole(savedActiveRole)
        }

        // Load manager session
        const cachedManager = localStorage.getItem(STORAGE_KEY_MANAGER)
        if (cachedManager) {
          try {
            const parsed = JSON.parse(cachedManager) as ManagerProfile
            if (parsed.role === 'manager') {
              setManagerUser(parsed)
            }
          } catch {
            localStorage.removeItem(STORAGE_KEY_MANAGER)
          }
        }

        // Load developer session
        const cachedDeveloper = localStorage.getItem(STORAGE_KEY_DEVELOPER)
        if (cachedDeveloper) {
          try {
            const parsed = JSON.parse(cachedDeveloper) as DeveloperProfile
            if (parsed.role === 'developer') {
              setDeveloperUser(parsed)
            }
          } catch {
            localStorage.removeItem(STORAGE_KEY_DEVELOPER)
          }
        }

        // If live Supabase is configured
        if (supabase && isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const meta = session.user.user_metadata || {}
            const role = (meta.role as UserRole) || 'manager'

            if (role === 'manager') {
              const profile: ManagerProfile = {
                id: session.user.id,
                email: session.user.email || '',
                fullName: meta.full_name || meta.fullName || 'Manager',
                role: 'manager',
                organizationName: meta.organization_name || meta.organizationName || 'Enterprise Operations',
                createdAt: session.user.created_at,
              }
              setManagerUser(profile)
              localStorage.setItem(STORAGE_KEY_MANAGER, JSON.stringify(profile))
            } else if (role === 'developer') {
              const profile: DeveloperProfile = {
                id: session.user.id,
                email: session.user.email || '',
                fullName: meta.full_name || meta.fullName || 'Developer',
                role: 'developer',
                githubUsername: meta.github_username || meta.githubUsername,
                repositoryUrl: meta.repository_url || meta.repositoryUrl,
                createdAt: session.user.created_at,
              }
              setDeveloperUser(profile)
              localStorage.setItem(STORAGE_KEY_DEVELOPER, JSON.stringify(profile))
            }
          }
        }
      } catch (err) {
        console.warn('Auth initialization warning:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const getStoredAccounts = (key: string): StoredAccount[] => {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  const saveStoredAccount = (key: string, account: StoredAccount) => {
    const existing = getStoredAccounts(key).filter((a) => a.email.toLowerCase() !== account.email.toLowerCase())
    existing.push(account)
    localStorage.setItem(key, JSON.stringify(existing))
  }

  const login = async ({
    email,
    password,
    role,
    rememberMe = true,
  }: LoginParams): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    const normalizedEmail = email.trim().toLowerCase()

    try {
      // 1. Supabase real authentication if configured
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })

        if (error) {
          return { success: false, error: error.message }
        }

        if (data.user) {
          const meta = data.user.user_metadata || {}
          const userRegisteredRole = (meta.role as UserRole) || 'manager'

          // Strictly enforce independent authentication between Manager and Developer
          if (userRegisteredRole !== role) {
            await supabase.auth.signOut()
            return {
              success: false,
              error: `This account is registered as a ${userRegisteredRole.toUpperCase()} Twin. Please sign in through the ${userRegisteredRole === 'manager' ? 'Manager' : 'Developer'} Twin portal.`,
            }
          }

          if (role === 'manager') {
            const profile: ManagerProfile = {
              id: data.user.id,
              email: data.user.email || normalizedEmail,
              fullName: meta.full_name || meta.fullName || normalizedEmail.split('@')[0],
              role: 'manager',
              organizationName: meta.organization_name || meta.organizationName || 'Enterprise Operations',
              createdAt: data.user.created_at,
            }
            setManagerUser(profile)
            setActiveRole('manager')
            if (rememberMe) {
              localStorage.setItem(STORAGE_KEY_MANAGER, JSON.stringify(profile))
              localStorage.setItem(STORAGE_KEY_ACTIVE_ROLE, 'manager')
            }
          } else {
            const profile: DeveloperProfile = {
              id: data.user.id,
              email: data.user.email || normalizedEmail,
              fullName: meta.full_name || meta.fullName || normalizedEmail.split('@')[0],
              role: 'developer',
              githubUsername: meta.github_username || meta.githubUsername,
              repositoryUrl: meta.repository_url || meta.repositoryUrl,
              createdAt: data.user.created_at,
            }
            setDeveloperUser(profile)
            setActiveRole('developer')
            if (rememberMe) {
              localStorage.setItem(STORAGE_KEY_DEVELOPER, JSON.stringify(profile))
              localStorage.setItem(STORAGE_KEY_ACTIVE_ROLE, 'developer')
            }
          }

          return { success: true }
        }
      }

      // 2. Offline / Local Independent Account Store
      await new Promise((resolve) => setTimeout(resolve, 400))

      if (role === 'manager') {
        // Check if email was registered as Developer
        const devAccounts = getStoredAccounts(STORAGE_KEY_DEV_ACCOUNTS)
        const isRegisteredAsDev = devAccounts.some((a) => a.email.toLowerCase() === normalizedEmail)
        if (isRegisteredAsDev) {
          return {
            success: false,
            error: 'This account was created as a Developer Twin. Please sign in via the Developer portal.',
          }
        }

        // Check Manager store
        const mgrAccounts = getStoredAccounts(STORAGE_KEY_MGR_ACCOUNTS)
        const existingMgr = mgrAccounts.find((a) => a.email.toLowerCase() === normalizedEmail)

        let profile: ManagerProfile
        if (existingMgr) {
          if (existingMgr.passwordHash !== password) {
            return { success: false, error: 'Incorrect password for Manager account.' }
          }
          profile = existingMgr.profile as ManagerProfile
        } else {
          // Auto-provision demo manager account if logging in directly
          profile = {
            id: 'mgr-' + Math.random().toString(36).substring(2, 9),
            email: normalizedEmail,
            fullName: normalizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Manager User',
            role: 'manager',
            organizationName: 'Enterprise Operations',
            createdAt: new Date().toISOString(),
          }
          saveStoredAccount(STORAGE_KEY_MGR_ACCOUNTS, {
            email: normalizedEmail,
            passwordHash: password,
            profile,
          })
        }

        setManagerUser(profile)
        setActiveRole('manager')
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY_MANAGER, JSON.stringify(profile))
          localStorage.setItem(STORAGE_KEY_ACTIVE_ROLE, 'manager')
        }
      } else {
        // Check if email was registered as Manager
        const mgrAccounts = getStoredAccounts(STORAGE_KEY_MGR_ACCOUNTS)
        const isRegisteredAsMgr = mgrAccounts.some((a) => a.email.toLowerCase() === normalizedEmail)
        if (isRegisteredAsMgr) {
          return {
            success: false,
            error: 'This account was created as a Manager Twin. Please sign in via the Manager portal.',
          }
        }

        // Check Developer store
        const devAccounts = getStoredAccounts(STORAGE_KEY_DEV_ACCOUNTS)
        const existingDev = devAccounts.find((a) => a.email.toLowerCase() === normalizedEmail)

        let profile: DeveloperProfile
        if (existingDev) {
          if (existingDev.passwordHash !== password) {
            return { success: false, error: 'Incorrect password for Developer account.' }
          }
          profile = existingDev.profile as DeveloperProfile
        } else {
          // Auto-provision demo developer account if logging in directly
          profile = {
            id: 'dev-' + Math.random().toString(36).substring(2, 9),
            email: normalizedEmail,
            fullName: normalizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Developer User',
            role: 'developer',
            githubUsername: normalizedEmail.split('@')[0],
            createdAt: new Date().toISOString(),
          }
          saveStoredAccount(STORAGE_KEY_DEV_ACCOUNTS, {
            email: normalizedEmail,
            passwordHash: password,
            profile,
          })
        }

        setDeveloperUser(profile)
        setActiveRole('developer')
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY_DEVELOPER, JSON.stringify(profile))
          localStorage.setItem(STORAGE_KEY_ACTIVE_ROLE, 'developer')
        }
      }

      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during login.'
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async ({
    email,
    password,
    role,
    fullName,
    organizationName,
    githubUsername,
    repositoryUrl,
  }: SignupParams): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    const normalizedEmail = email.trim().toLowerCase()

    try {
      // 1. Supabase real sign up if configured
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              role,
              full_name: fullName,
              organization_name: organizationName,
              github_username: githubUsername,
              repository_url: repositoryUrl,
            },
          },
        })

        if (error) {
          return { success: false, error: error.message }
        }

        if (data.user) {
          if (role === 'manager') {
            const profile: ManagerProfile = {
              id: data.user.id,
              email: data.user.email || normalizedEmail,
              fullName,
              role: 'manager',
              organizationName: organizationName || 'Enterprise Operations',
              createdAt: data.user.created_at,
            }
            setManagerUser(profile)
            setActiveRole('manager')
            localStorage.setItem(STORAGE_KEY_MANAGER, JSON.stringify(profile))
            localStorage.setItem(STORAGE_KEY_ACTIVE_ROLE, 'manager')
          } else {
            const profile: DeveloperProfile = {
              id: data.user.id,
              email: data.user.email || normalizedEmail,
              fullName,
              role: 'developer',
              githubUsername,
              repositoryUrl,
              createdAt: data.user.created_at,
            }
            setDeveloperUser(profile)
            setActiveRole('developer')
            localStorage.setItem(STORAGE_KEY_DEVELOPER, JSON.stringify(profile))
            localStorage.setItem(STORAGE_KEY_ACTIVE_ROLE, 'developer')
          }

          return { success: true }
        }
      }

      // 2. Offline / Local Independent Account Registration
      await new Promise((resolve) => setTimeout(resolve, 450))

      if (role === 'manager') {
        const profile: ManagerProfile = {
          id: 'mgr-' + Math.random().toString(36).substring(2, 9),
          email: normalizedEmail,
          fullName,
          role: 'manager',
          organizationName: organizationName || 'Enterprise Operations',
          createdAt: new Date().toISOString(),
        }

        saveStoredAccount(STORAGE_KEY_MGR_ACCOUNTS, {
          email: normalizedEmail,
          passwordHash: password,
          profile,
        })

        setManagerUser(profile)
        setActiveRole('manager')
        localStorage.setItem(STORAGE_KEY_MANAGER, JSON.stringify(profile))
        localStorage.setItem(STORAGE_KEY_ACTIVE_ROLE, 'manager')
      } else {
        const profile: DeveloperProfile = {
          id: 'dev-' + Math.random().toString(36).substring(2, 9),
          email: normalizedEmail,
          fullName,
          role: 'developer',
          githubUsername: githubUsername || normalizedEmail.split('@')[0],
          repositoryUrl,
          createdAt: new Date().toISOString(),
        }

        saveStoredAccount(STORAGE_KEY_DEV_ACCOUNTS, {
          email: normalizedEmail,
          passwordHash: password,
          profile,
        })

        setDeveloperUser(profile)
        setActiveRole('developer')
        localStorage.setItem(STORAGE_KEY_DEVELOPER, JSON.stringify(profile))
        localStorage.setItem(STORAGE_KEY_ACTIVE_ROLE, 'developer')
      }

      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during signup.'
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (role?: UserRole) => {
    const targetRole = role || activeRole

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.warn('Supabase signout warning:', err)
      }
    }

    if (targetRole === 'manager' || !targetRole) {
      setManagerUser(null)
      localStorage.removeItem(STORAGE_KEY_MANAGER)
      if (activeRole === 'manager') {
        setActiveRole(developerUser ? 'developer' : null)
        if (!developerUser) localStorage.removeItem(STORAGE_KEY_ACTIVE_ROLE)
      }
    }

    if (targetRole === 'developer' || !targetRole) {
      setDeveloperUser(null)
      localStorage.removeItem(STORAGE_KEY_DEVELOPER)
      if (activeRole === 'developer') {
        setActiveRole(managerUser ? 'manager' : null)
        if (!managerUser) localStorage.removeItem(STORAGE_KEY_ACTIVE_ROLE)
      }
    }
  }

  // Active current user based on active context
  const currentUser = activeRole === 'developer' ? developerUser : managerUser

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        managerUser,
        developerUser,
        role: activeRole,
        activeRole,
        isAuthenticated: Boolean(currentUser),
        isManagerAuthenticated: Boolean(managerUser),
        isDeveloperAuthenticated: Boolean(developerUser),
        isLoading,
        isSupabaseConnected: isSupabaseConfigured,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export default AuthProvider
