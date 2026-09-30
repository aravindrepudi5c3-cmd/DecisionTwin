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
  const { user, isAuthenticated, isLoading } = useAuth()
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

  // If not logged in, redirect to login page with return state
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If a specific role is required and user does not have it, route to their role dashboard
  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'developer') {
      return <Navigate to="/developer-dashboard" replace />
    } else {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
