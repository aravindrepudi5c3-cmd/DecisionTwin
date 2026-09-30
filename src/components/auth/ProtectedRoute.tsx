import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { managerUser, developerUser, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070d18] flex items-center justify-center text-slate-300 font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying DecisionTwin Authorization...</span>
        </div>
      </div>
    )
  }

  // Manager Routes Protection
  if (requiredRole === 'manager') {
    if (!managerUser) {
      return <Navigate to="/login?role=manager" state={{ from: location }} replace />
    }
    return <>{children}</>
  }

  // Developer Routes Protection
  if (requiredRole === 'developer') {
    if (!developerUser) {
      return <Navigate to="/login?role=developer" state={{ from: location }} replace />
    }
    return <>{children}</>
  }

  // Generic fallback
  if (!managerUser && !developerUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
