import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { CinematicIntro } from './components/CinematicIntro.tsx'
import { AppLayout } from './components/layout/AppLayout.tsx'
import { ProtectedRoute } from './components/auth/ProtectedRoute.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { CompareScenarios } from './pages/CompareScenarios.tsx'
import { CreateProject } from './pages/CreateProject.tsx'
import { Dashboard } from './pages/Dashboard.tsx'
import { DeveloperDashboard } from './pages/DeveloperDashboard.tsx'
import { EmployeeDirectory } from './pages/EmployeeDirectory.tsx'
import { EmployeeProfile } from './pages/EmployeeProfile.tsx'
import { Insights } from './pages/Insights.tsx'
import { Login } from './pages/Login.tsx'
import { Notifications } from './pages/Notifications.tsx'
import { ProjectDetail } from './pages/ProjectDetail.tsx'
import { Projects } from './pages/Projects.tsx'
import { ProductInfo } from './pages/ProductInfo.tsx'
import { ResetPassword } from './pages/ResetPassword.tsx'
import { ScenarioSimulator } from './pages/ScenarioSimulator.tsx'
import { SkillMatching } from './pages/SkillMatching.tsx'
import { TeamBuilder } from './pages/TeamBuilder.tsx'
import { WorkspaceSettings } from './pages/WorkspaceSettings.tsx'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing and Entry Experience */}
          <Route path="/" element={<CinematicIntro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<ProductInfo />} />
          <Route path="/privacy" element={<ProductInfo />} />
          <Route path="/contact" element={<ProductInfo />} />

          {/* Developer Twin Workspace */}
          <Route
            path="/developer-dashboard"
            element={
              <ProtectedRoute requiredRole="developer">
                <DeveloperDashboard />
              </ProtectedRoute>
            }
          />

          {/* Manager Twin Workspace (Existing DecisionTwin Dashboard untouched) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="manager">
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute requiredRole="manager">
                <AppLayout><Projects /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute requiredRole="manager">
                <AppLayout><CreateProject /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute requiredRole="manager">
                <AppLayout><ProjectDetail /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute requiredRole="manager">
                <AppLayout><EmployeeDirectory /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees/:employeeId"
            element={
              <ProtectedRoute requiredRole="manager">
                <AppLayout><EmployeeProfile /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/skill-matching"
            element={
              <ProtectedRoute requiredRole="manager">
                <AppLayout><SkillMatching /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-builder"
            element={
              <ProtectedRoute requiredRole="manager">
                <AppLayout><TeamBuilder /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulator"
            element={
              <ProtectedRoute requiredRole="manager">
                <AppLayout><ScenarioSimulator /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/scenarios/compare"
            element={
              <ProtectedRoute requiredRole="manager">
                <AppLayout><CompareScenarios /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute requiredRole="manager">
                <AppLayout><Insights /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute requiredRole="manager">
                <AppLayout><Notifications /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRole="manager">
                <AppLayout><WorkspaceSettings /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
