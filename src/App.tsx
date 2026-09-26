import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { CinematicIntro } from './components/CinematicIntro.tsx'
import { AppLayout } from './components/layout/AppLayout.tsx'
import { CompareScenarios } from './pages/CompareScenarios.tsx'
import { CreateProject } from './pages/CreateProject.tsx'
import { Dashboard } from './pages/Dashboard.tsx'
import { EmployeeDirectory } from './pages/EmployeeDirectory.tsx'
import { EmployeeProfile } from './pages/EmployeeProfile.tsx'
import { Insights } from './pages/Insights.tsx'
import { Login } from './pages/Login.tsx'
import { Notifications } from './pages/Notifications.tsx'
import { ProjectDetail } from './pages/ProjectDetail.tsx'
import { Projects } from './pages/Projects.tsx'
import { ScenarioSimulator } from './pages/ScenarioSimulator.tsx'
import { SkillMatching } from './pages/SkillMatching.tsx'
import { TeamBuilder } from './pages/TeamBuilder.tsx'
import { WorkspaceSettings } from './pages/WorkspaceSettings.tsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CinematicIntro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/projects" element={<AppLayout><Projects /></AppLayout>} />
        <Route path="/projects/new" element={<AppLayout><CreateProject /></AppLayout>} />
        <Route path="/projects/:projectId" element={<AppLayout><ProjectDetail /></AppLayout>} />
        <Route path="/employees" element={<AppLayout><EmployeeDirectory /></AppLayout>} />
        <Route path="/employees/:employeeId" element={<AppLayout><EmployeeProfile /></AppLayout>} />
        <Route path="/skill-matching" element={<AppLayout><SkillMatching /></AppLayout>} />
        <Route path="/team-builder" element={<AppLayout><TeamBuilder /></AppLayout>} />
        <Route path="/simulator" element={<AppLayout><ScenarioSimulator /></AppLayout>} />
        <Route path="/scenarios/compare" element={<AppLayout><CompareScenarios /></AppLayout>} />
        <Route path="/insights" element={<AppLayout><Insights /></AppLayout>} />
        <Route path="/notifications" element={<AppLayout><Notifications /></AppLayout>} />
        <Route path="/settings" element={<AppLayout><WorkspaceSettings /></AppLayout>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
