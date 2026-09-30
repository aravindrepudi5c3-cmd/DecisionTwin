import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { DeveloperProject, DeveloperComponent, AnalysisHistory } from '../types/developer'
import { developerProjectService } from '../services/developer/developerProjectService'
import { analysisService } from '../services/developer/analysisService'
import { demoSeedService } from '../services/developer/demoSeedService'
import { DeveloperSidebar, type DeveloperTab } from '../components/developer/DeveloperSidebar'
import { DeveloperHeader } from '../components/developer/DeveloperHeader'
import { ProjectModal } from '../components/developer/ProjectModal'
import { DeveloperOverviewView } from './developer/DeveloperOverviewView'
import { MyProjectsView } from './developer/MyProjectsView'
import { ProjectDetailsView } from './developer/ProjectDetailsView'
import { RepositoryView } from './developer/RepositoryView'
import { ChangeAnalyzerView } from './developer/ChangeAnalyzerView'
import { ImpactGraphPageView } from './developer/ImpactGraphPageView'
import { CodeDependenciesView } from './developer/CodeDependenciesView'
import { TestRecommendationsPageView } from './developer/TestRecommendationsPageView'
import { AnalysisHistoryPageView } from './developer/AnalysisHistoryPageView'
import { DeveloperSettingsPageView } from './developer/DeveloperSettingsPageView'

import '../components/developer/DeveloperStyles.css'
import './DeveloperDashboard.css'

export const DeveloperDashboard: React.FC = () => {
  const { developerUser, logout } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<DeveloperTab>('overview')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Data states
  const [projects, setProjects] = useState<DeveloperProject[]>([])
  const [analyses, setAnalyses] = useState<AnalysisHistory[]>([])
  const [selectedProject, setSelectedProject] = useState<DeveloperProject | null>(null)
  const [analyzerTargetComponent, setAnalyzerTargetComponent] = useState<DeveloperComponent | null>(null)

  // Modal states
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<DeveloperProject | null>(null)
  const [isLoadingDemo, setIsLoadingDemo] = useState(false)

  const developerId = developerUser?.id || 'anonymous-dev'

  // Fetch projects and analyses from Supabase / isolated store
  const refreshWorkspace = useCallback(async () => {
    if (!developerId) return
    try {
      const [projList, histList] = await Promise.all([
        developerProjectService.getProjects(developerId),
        analysisService.getAnalysisHistory(developerId),
      ])
      setProjects(projList)
      setAnalyses(histList)
    } catch (err) {
      console.error('[DeveloperDashboard] Refresh error:', err)
    }
  }, [developerId])

  useEffect(() => {
    refreshWorkspace()
  }, [refreshWorkspace])

  // Logout handler
  const handleLogout = async () => {
    await logout('developer')
    navigate('/login?role=developer')
  }

  // Project CRUD handlers
  const handleSaveProject = async (payload: {
    name: string
    description?: string
    repository_url?: string
    language?: string
    framework?: string
  }) => {
    if (editingProject) {
      await developerProjectService.updateProject(developerId, editingProject.id, payload)
    } else {
      const created = await developerProjectService.createProject(developerId, payload)
      // If user is adding their first project, optionally set it as current
      if (projects.length === 0) {
        setSelectedProject(created)
      }
    }
    await refreshWorkspace()
  }

  const handleDeleteProject = async (projectId: string) => {
    await developerProjectService.deleteProject(developerId, projectId)
    if (selectedProject?.id === projectId) {
      setSelectedProject(null)
    }
    await refreshWorkspace()
  }

  // Load Demo Project handler (Prompt Rule 35)
  const handleLoadDemoProject = async () => {
    setIsLoadingDemo(true)
    try {
      const demoProj = await demoSeedService.seedDemoProject(developerId)
      await refreshWorkspace()
      setSelectedProject(demoProj)
    } catch (err) {
      console.error('[DeveloperDashboard] Seed demo error:', err)
    } finally {
      setIsLoadingDemo(false)
    }
  }

  // Navigation helpers
  const handleOpenProject = (project: DeveloperProject) => {
    setSelectedProject(project)
  }

  const handleNavigateToAnalyzer = (project?: DeveloperProject, component?: DeveloperComponent) => {
    if (project) {
      setSelectedProject(null)
    }
    if (component) {
      setAnalyzerTargetComponent(component)
    }
    setActiveTab('change-analyzer')
  }

  return (
    <div className="dt-dev-shell">
      {/* 10-Item Developer Sidebar */}
      <DeveloperSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedProject(null)
          setActiveTab(tab)
        }}
        onLogout={handleLogout}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="dt-dev-content-shell">
        <DeveloperHeader
          developerUser={developerUser}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onQuickAnalyze={() => {
            setSelectedProject(null)
            setActiveTab('change-analyzer')
          }}
        />

        <main className="dt-dev-main-body">
          {/* If inspecting an individual project in depth */}
          {selectedProject ? (
            <ProjectDetailsView
              project={selectedProject}
              developerId={developerId}
              onBack={() => setSelectedProject(null)}
              onNavigateToAnalyzer={(p, c) => handleNavigateToAnalyzer(p, c)}
            />
          ) : (
            <>
              {activeTab === 'overview' && (
                <DeveloperOverviewView
                  projects={projects}
                  analyses={analyses}
                  onNavigateTab={(t) => setActiveTab(t)}
                  onOpenAddProject={() => {
                    setEditingProject(null)
                    setIsAddProjectModalOpen(true)
                  }}
                  onLoadDemoProject={handleLoadDemoProject}
                  onOpenProject={handleOpenProject}
                  isLoadingDemo={isLoadingDemo}
                />
              )}

              {activeTab === 'projects' && (
                <MyProjectsView
                  projects={projects}
                  onOpenProject={handleOpenProject}
                  onAddProject={() => {
                    setEditingProject(null)
                    setIsAddProjectModalOpen(true)
                  }}
                  onEditProject={(p) => {
                    setEditingProject(p)
                    setIsAddProjectModalOpen(true)
                  }}
                  onDeleteProject={handleDeleteProject}
                  onAnalyzeProject={(p) => handleNavigateToAnalyzer(p)}
                  onLoadDemoProject={handleLoadDemoProject}
                  isLoadingDemo={isLoadingDemo}
                />
              )}

              {activeTab === 'repository' && (
                <RepositoryView
                  projects={projects}
                  onOpenAddProject={() => {
                    setEditingProject(null)
                    setIsAddProjectModalOpen(true)
                  }}
                />
              )}

              {activeTab === 'change-analyzer' && (
                <ChangeAnalyzerView
                  projects={projects}
                  developerId={developerId}
                  initialProject={projects[0] || null}
                  initialComponent={analyzerTargetComponent}
                  onAnalysisSaved={refreshWorkspace}
                />
              )}

              {activeTab === 'impact-graph' && (
                <ImpactGraphPageView
                  projects={projects}
                  onNavigateToAnalyzer={(p, c) => handleNavigateToAnalyzer(p, c)}
                />
              )}

              {activeTab === 'dependencies' && (
                <CodeDependenciesView projects={projects} />
              )}

              {activeTab === 'test-recommendations' && (
                <TestRecommendationsPageView
                  analyses={analyses}
                  developerId={developerId}
                  onRefreshAnalyses={refreshWorkspace}
                />
              )}

              {activeTab === 'history' && (
                <AnalysisHistoryPageView
                  analyses={analyses}
                  developerId={developerId}
                  onNavigateToAnalyzer={() => setActiveTab('change-analyzer')}
                />
              )}

              {activeTab === 'settings' && (
                <DeveloperSettingsPageView developerUser={developerUser} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Add / Edit Project Modal */}
      <ProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => {
          setIsAddProjectModalOpen(false)
          setEditingProject(null)
        }}
        onSave={handleSaveProject}
        initialProject={editingProject}
      />
    </div>
  )
}
