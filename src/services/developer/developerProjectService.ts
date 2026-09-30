// Developer Twin Projects Service
// Performs real CRUD operations on developer_projects table in Supabase
// Includes isolated local storage persistence fallback for offline/preview environments

import { isSupabaseConfigured, supabase } from '../supabase'
import type { DeveloperProject } from '../../types/developer'

const STORAGE_PREFIX = 'decisiontwin_dev_projects_'

function getLocalStorageKey(developerId: string): string {
  return `${STORAGE_PREFIX}${developerId}`
}

function getLocalProjects(developerId: string): DeveloperProject[] {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(developerId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalProjects(developerId: string, projects: DeveloperProject[]) {
  localStorage.setItem(getLocalStorageKey(developerId), JSON.stringify(projects))
}

export const developerProjectService = {
  async getProjects(developerId: string): Promise<DeveloperProject[]> {
    if (!developerId) return []

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('developer_projects')
          .select('*')
          .eq('developer_id', developerId)
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('[DeveloperProjectService] Supabase fetch error, checking local store:', error.message)
          return getLocalProjects(developerId)
        }

        return data as DeveloperProject[]
      } catch (err) {
        console.warn('[DeveloperProjectService] Network exception:', err)
        return getLocalProjects(developerId)
      }
    }

    return getLocalProjects(developerId)
  },

  async getProjectById(developerId: string, projectId: string): Promise<DeveloperProject | null> {
    if (!projectId) return null

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('developer_projects')
          .select('*')
          .eq('id', projectId)
          .eq('developer_id', developerId)
          .single()

        if (!error && data) {
          return data as DeveloperProject
        }
      } catch {
        // fallback
      }
    }

    const localList = getLocalProjects(developerId)
    return localList.find((p) => p.id === projectId) || null
  },

  async createProject(
    developerId: string,
    payload: {
      name: string
      description?: string
      repository_url?: string
      language?: string
      framework?: string
    }
  ): Promise<DeveloperProject> {
    const newProject: DeveloperProject = {
      id: crypto.randomUUID ? crypto.randomUUID() : `dev-proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      developer_id: developerId,
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
      repository_url: payload.repository_url?.trim() || null,
      language: payload.language?.trim() || null,
      framework: payload.framework?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('developer_projects')
          .insert({
            id: newProject.id,
            developer_id: developerId,
            name: newProject.name,
            description: newProject.description,
            repository_url: newProject.repository_url,
            language: newProject.language,
            framework: newProject.framework,
          })
          .select()
          .single()

        if (!error && data) {
          // Keep local store in sync
          const local = getLocalProjects(developerId)
          saveLocalProjects(developerId, [data as DeveloperProject, ...local.filter((p) => p.id !== data.id)])
          return data as DeveloperProject
        }
      } catch (err) {
        console.warn('[DeveloperProjectService] Supabase insert failed, storing locally:', err)
      }
    }

    // Save locally
    const local = getLocalProjects(developerId)
    const updated = [newProject, ...local.filter((p) => p.id !== newProject.id)]
    saveLocalProjects(developerId, updated)
    return newProject
  },

  async updateProject(
    developerId: string,
    projectId: string,
    updates: Partial<Pick<DeveloperProject, 'name' | 'description' | 'repository_url' | 'language' | 'framework'>>
  ): Promise<DeveloperProject | null> {
    const updatedAt = new Date().toISOString()

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('developer_projects')
          .update({
            ...updates,
            updated_at: updatedAt,
          })
          .eq('id', projectId)
          .eq('developer_id', developerId)
          .select()
          .single()

        if (!error && data) {
          const local = getLocalProjects(developerId)
          const updated = local.map((p) => (p.id === projectId ? (data as DeveloperProject) : p))
          saveLocalProjects(developerId, updated)
          return data as DeveloperProject
        }
      } catch (err) {
        console.warn('[DeveloperProjectService] Supabase update failed:', err)
      }
    }

    const local = getLocalProjects(developerId)
    const target = local.find((p) => p.id === projectId)
    if (!target) return null

    const updatedProject: DeveloperProject = {
      ...target,
      ...updates,
      updated_at: updatedAt,
    }
    const updatedList = local.map((p) => (p.id === projectId ? updatedProject : p))
    saveLocalProjects(developerId, updatedList)
    return updatedProject
  },

  async deleteProject(developerId: string, projectId: string): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('developer_projects')
          .delete()
          .eq('id', projectId)
          .eq('developer_id', developerId)

        if (!error) {
          const local = getLocalProjects(developerId)
          saveLocalProjects(developerId, local.filter((p) => p.id !== projectId))
          return true
        }
      } catch (err) {
        console.warn('[DeveloperProjectService] Supabase delete failed:', err)
      }
    }

    const local = getLocalProjects(developerId)
    saveLocalProjects(developerId, local.filter((p) => p.id !== projectId))
    return true
  },
}
