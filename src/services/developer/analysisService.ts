// Developer Twin Analysis & Impact Service
// Manages analysis_history, impact_reports, and test_recommendations

import { isSupabaseConfigured, supabase } from '../supabase'
import type {
  AnalysisHistory,
  ImpactAnalysisSimulation,
  ImpactReport,
  TestRecommendation,
} from '../../types/developer'

const STORAGE_PREFIX = 'decisiontwin_dev_analyses_'

function getLocalStorageKey(developerId: string): string {
  return `${STORAGE_PREFIX}${developerId}`
}

interface StoredAnalysisBundle {
  analysis: AnalysisHistory
  report: ImpactReport
  tests: TestRecommendation[]
}

function getLocalAnalyses(developerId: string): StoredAnalysisBundle[] {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(developerId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalAnalyses(developerId: string, list: StoredAnalysisBundle[]) {
  localStorage.setItem(getLocalStorageKey(developerId), JSON.stringify(list))
}

export const analysisService = {
  async getAnalysisHistory(developerId: string, projectId?: string): Promise<AnalysisHistory[]> {
    if (!developerId) return []

    if (supabase && isSupabaseConfigured) {
      try {
        let query = supabase
          .from('analysis_history')
          .select('*, developer_projects(name), impact_reports(*), test_recommendations(*)')
          .eq('developer_id', developerId)
          .order('created_at', { ascending: false })

        if (projectId) {
          query = query.eq('project_id', projectId)
        }

        const { data, error } = await query

        if (!error && data) {
          return data.map((item: any) => ({
            id: item.id,
            developer_id: item.developer_id,
            project_id: item.project_id,
            change_description: item.change_description,
            change_type: item.change_type,
            status: item.status,
            created_at: item.created_at,
            project_name: item.developer_projects?.name,
            impact_report: item.impact_reports?.[0] || item.impact_reports || undefined,
            test_recommendations: item.test_recommendations || [],
          }))
        }
      } catch (err) {
        console.warn('[AnalysisService] Supabase query failed:', err)
      }
    }

    const localBundles = getLocalAnalyses(developerId)
    const filtered = projectId ? localBundles.filter((b) => b.analysis.project_id === projectId) : localBundles
    return filtered.map((b) => ({
      ...b.analysis,
      impact_report: b.report,
      test_recommendations: b.tests,
    }))
  },

  async getAnalysisDetails(
    developerId: string,
    analysisId: string
  ): Promise<{
    analysis: AnalysisHistory | null
    report: ImpactReport | null
    tests: TestRecommendation[]
  }> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data: analysis, error: aErr } = await supabase
          .from('analysis_history')
          .select('*, developer_projects(name)')
          .eq('id', analysisId)
          .single()

        if (!aErr && analysis) {
          const { data: report } = await supabase
            .from('impact_reports')
            .select('*')
            .eq('analysis_id', analysisId)
            .single()

          const { data: tests } = await supabase
            .from('test_recommendations')
            .select('*')
            .eq('analysis_id', analysisId)
            .order('created_at', { ascending: true })

          return {
            analysis: {
              ...analysis,
              project_name: (analysis as any).developer_projects?.name,
            },
            report: (report as ImpactReport) || null,
            tests: (tests as TestRecommendation[]) || [],
          }
        }
      } catch (err) {
        console.warn('[AnalysisService] Supabase detail fetch failed:', err)
      }
    }

    const bundles = getLocalAnalyses(developerId)
    const found = bundles.find((b) => b.analysis.id === analysisId)
    if (!found) {
      return { analysis: null, report: null, tests: [] }
    }
    return {
      analysis: found.analysis,
      report: found.report,
      tests: found.tests,
    }
  },

  async saveSimulationAnalysis(
    developerId: string,
    simulation: ImpactAnalysisSimulation
  ): Promise<{
    analysis: AnalysisHistory
    report: ImpactReport
    tests: TestRecommendation[]
  }> {
    const analysisId = crypto.randomUUID
      ? crypto.randomUUID()
      : `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const reportId = crypto.randomUUID
      ? crypto.randomUUID()
      : `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const now = new Date().toISOString()

    const analysisRecord: AnalysisHistory = {
      id: analysisId,
      developer_id: developerId,
      project_id: simulation.project.id,
      change_description: `${simulation.targetComponent.name}: ${simulation.currentValue} → ${simulation.proposedValue}. ${simulation.description}`,
      change_type: simulation.changeType,
      status: 'Completed',
      created_at: now,
      project_name: simulation.project.name,
    }

    const reportRecord: ImpactReport = {
      id: reportId,
      analysis_id: analysisId,
      risk_level: simulation.riskLevel,
      risk_score: simulation.riskScore,
      affected_components: simulation.affectedComponents.length,
      affected_files: simulation.affectedFiles.length,
      affected_apis: simulation.affectedApis.length,
      impact_summary: simulation.impactSummary,
      created_at: now,
    }

    const testRecords: TestRecommendation[] = simulation.recommendedTests.map((t, idx) => ({
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : `test-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      analysis_id: analysisId,
      test_name: t.name,
      description: t.description,
      priority: t.priority,
      completed: false,
      created_at: now,
    }))

    if (supabase && isSupabaseConfigured) {
      try {
        // 1. Insert analysis
        await supabase.from('analysis_history').insert({
          id: analysisRecord.id,
          developer_id: developerId,
          project_id: analysisRecord.project_id,
          change_description: analysisRecord.change_description,
          change_type: analysisRecord.change_type,
          status: analysisRecord.status,
        })

        // 2. Insert report
        await supabase.from('impact_reports').insert({
          id: reportRecord.id,
          analysis_id: analysisRecord.id,
          risk_level: reportRecord.risk_level,
          risk_score: reportRecord.risk_score,
          affected_components: reportRecord.affected_components,
          affected_files: reportRecord.affected_files,
          affected_apis: reportRecord.affected_apis,
          impact_summary: reportRecord.impact_summary,
        })

        // 3. Insert test recommendations
        if (testRecords.length > 0) {
          await supabase.from('test_recommendations').insert(
            testRecords.map((t) => ({
              id: t.id,
              analysis_id: analysisRecord.id,
              test_name: t.test_name,
              description: t.description,
              priority: t.priority,
              completed: t.completed,
            }))
          )
        }
      } catch (err) {
        console.warn('[AnalysisService] Supabase save failed, storing locally:', err)
      }
    }

    // Always keep local store updated
    const local = getLocalAnalyses(developerId)
    const bundle: StoredAnalysisBundle = {
      analysis: analysisRecord,
      report: reportRecord,
      tests: testRecords,
    }
    saveLocalAnalyses(developerId, [bundle, ...local.filter((b) => b.analysis.id !== analysisId)])

    return {
      analysis: analysisRecord,
      report: reportRecord,
      tests: testRecords,
    }
  },

  async updateTestStatus(
    developerId: string,
    testId: string,
    completed: boolean
  ): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('test_recommendations')
          .update({ completed })
          .eq('id', testId)

        if (!error) {
          // Sync local
          const local = getLocalAnalyses(developerId)
          const updated = local.map((b) => ({
            ...b,
            tests: b.tests.map((t) => (t.id === testId ? { ...t, completed } : t)),
          }))
          saveLocalAnalyses(developerId, updated)
          return true
        }
      } catch (err) {
        console.warn('[AnalysisService] Supabase test update failed:', err)
      }
    }

    const local = getLocalAnalyses(developerId)
    const updated = local.map((b) => ({
      ...b,
      tests: b.tests.map((t) => (t.id === testId ? { ...t, completed } : t)),
    }))
    saveLocalAnalyses(developerId, updated)
    return true
  },
}
