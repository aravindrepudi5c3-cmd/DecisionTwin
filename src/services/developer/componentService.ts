// Developer Twin Component Service
// Real CRUD operations for components associated with a developer project

import { isSupabaseConfigured, supabase } from '../supabase'
import type { DeveloperComponent } from '../../types/developer'

const STORAGE_PREFIX = 'decisiontwin_dev_components_'

function getLocalStorageKey(projectId: string): string {
  return `${STORAGE_PREFIX}${projectId}`
}

function getLocalComponents(projectId: string): DeveloperComponent[] {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(projectId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalComponents(projectId: string, list: DeveloperComponent[]) {
  localStorage.setItem(getLocalStorageKey(projectId), JSON.stringify(list))
}

export const componentService = {
  async getComponents(projectId: string): Promise<DeveloperComponent[]> {
    if (!projectId) return []

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('components')
          .select('*')
          .eq('project_id', projectId)
          .order('name', { ascending: true })

        if (!error && data) {
          return data as DeveloperComponent[]
        }
      } catch (err) {
        console.warn('[ComponentService] Supabase query failed, using local store:', err)
      }
    }

    return getLocalComponents(projectId)
  },

  async createComponent(
    projectId: string,
    payload: {
      name: string
      type?: string
      file_path?: string
    }
  ): Promise<DeveloperComponent> {
    const newComponent: DeveloperComponent = {
      id: crypto.randomUUID ? crypto.randomUUID() : `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      project_id: projectId,
      name: payload.name.trim(),
      type: payload.type?.trim() || 'service',
      file_path: payload.file_path?.trim() || null,
      created_at: new Date().toISOString(),
    }

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('components')
          .insert({
            id: newComponent.id,
            project_id: projectId,
            name: newComponent.name,
            type: newComponent.type,
            file_path: newComponent.file_path,
          })
          .select()
          .single()

        if (!error && data) {
          const local = getLocalComponents(projectId)
          saveLocalComponents(projectId, [...local, data as DeveloperComponent])
          return data as DeveloperComponent
        }
      } catch (err) {
        console.warn('[ComponentService] Supabase insert failed:', err)
      }
    }

    const local = getLocalComponents(projectId)
    saveLocalComponents(projectId, [...local, newComponent])
    return newComponent
  },

  async updateComponent(
    projectId: string,
    componentId: string,
    updates: Partial<Pick<DeveloperComponent, 'name' | 'type' | 'file_path'>>
  ): Promise<DeveloperComponent | null> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('components')
          .update(updates)
          .eq('id', componentId)
          .eq('project_id', projectId)
          .select()
          .single()

        if (!error && data) {
          const local = getLocalComponents(projectId)
          saveLocalComponents(
            projectId,
            local.map((c) => (c.id === componentId ? (data as DeveloperComponent) : c))
          )
          return data as DeveloperComponent
        }
      } catch (err) {
        console.warn('[ComponentService] Supabase update failed:', err)
      }
    }

    const local = getLocalComponents(projectId)
    const target = local.find((c) => c.id === componentId)
    if (!target) return null

    const updated: DeveloperComponent = { ...target, ...updates }
    saveLocalComponents(
      projectId,
      local.map((c) => (c.id === componentId ? updated : c))
    )
    return updated
  },

  async deleteComponent(projectId: string, componentId: string): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('components')
          .delete()
          .eq('id', componentId)
          .eq('project_id', projectId)

        if (!error) {
          const local = getLocalComponents(projectId)
          saveLocalComponents(projectId, local.filter((c) => c.id !== componentId))
          return true
        }
      } catch (err) {
        console.warn('[ComponentService] Supabase delete failed:', err)
      }
    }

    const local = getLocalComponents(projectId)
    saveLocalComponents(projectId, local.filter((c) => c.id !== componentId))
    return true
  },
}
