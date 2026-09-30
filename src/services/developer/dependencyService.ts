// Developer Twin Dependency Service
// Manages dependency links between components in a developer project

import { isSupabaseConfigured, supabase } from '../supabase'
import type { DeveloperDependency } from '../../types/developer'

const STORAGE_PREFIX = 'decisiontwin_dev_deps_'

function getLocalStorageKey(projectId: string): string {
  return `${STORAGE_PREFIX}${projectId}`
}

function getLocalDependencies(projectId: string): DeveloperDependency[] {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(projectId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalDependencies(projectId: string, list: DeveloperDependency[]) {
  localStorage.setItem(getLocalStorageKey(projectId), JSON.stringify(list))
}

export const dependencyService = {
  async getDependencies(projectId: string): Promise<DeveloperDependency[]> {
    if (!projectId) return []

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('dependencies')
          .select('*')
          .eq('project_id', projectId)

        if (!error && data) {
          return data as DeveloperDependency[]
        }
      } catch (err) {
        console.warn('[DependencyService] Supabase fetch error:', err)
      }
    }

    return getLocalDependencies(projectId)
  },

  async createDependency(
    projectId: string,
    payload: {
      source_component_id: string
      target_component_id: string
      dependency_type?: string
    }
  ): Promise<DeveloperDependency> {
    const newDep: DeveloperDependency = {
      id: crypto.randomUUID ? crypto.randomUUID() : `dep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      project_id: projectId,
      source_component_id: payload.source_component_id,
      target_component_id: payload.target_component_id,
      dependency_type: payload.dependency_type || 'depends_on',
      created_at: new Date().toISOString(),
    }

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('dependencies')
          .insert({
            id: newDep.id,
            project_id: projectId,
            source_component_id: newDep.source_component_id,
            target_component_id: newDep.target_component_id,
            dependency_type: newDep.dependency_type,
          })
          .select()
          .single()

        if (!error && data) {
          const local = getLocalDependencies(projectId)
          saveLocalDependencies(projectId, [...local, data as DeveloperDependency])
          return data as DeveloperDependency
        }
      } catch (err) {
        console.warn('[DependencyService] Supabase insert failed:', err)
      }
    }

    const local = getLocalDependencies(projectId)
    saveLocalDependencies(projectId, [...local, newDep])
    return newDep
  },

  async deleteDependency(projectId: string, dependencyId: string): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('dependencies')
          .delete()
          .eq('id', dependencyId)
          .eq('project_id', projectId)

        if (!error) {
          const local = getLocalDependencies(projectId)
          saveLocalDependencies(projectId, local.filter((d) => d.id !== dependencyId))
          return true
        }
      } catch (err) {
        console.warn('[DependencyService] Supabase delete failed:', err)
      }
    }

    const local = getLocalDependencies(projectId)
    saveLocalDependencies(projectId, local.filter((d) => d.id !== dependencyId))
    return true
  },
}
