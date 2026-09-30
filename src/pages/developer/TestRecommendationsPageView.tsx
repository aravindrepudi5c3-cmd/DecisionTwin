import React, { useState, useEffect } from 'react'
import {
  CheckSquare,
  Square,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import type { TestRecommendation, AnalysisHistory } from '../../types/developer'
import { analysisService } from '../../services/developer/analysisService'

interface TestRecommendationsPageViewProps {
  analyses: AnalysisHistory[]
  developerId: string
  onRefreshAnalyses: () => void
}

export const TestRecommendationsPageView: React.FC<TestRecommendationsPageViewProps> = ({
  analyses,
  developerId,
  onRefreshAnalyses,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [tests, setTests] = useState<TestRecommendation[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Collect all test recommendations across analyses
  useEffect(() => {
    const list: TestRecommendation[] = []
    analyses.forEach((a) => {
      if (a.test_recommendations && a.test_recommendations.length > 0) {
        list.push(...a.test_recommendations)
      }
    })
    setTests(list)
  }, [analyses])

  const handleToggleTest = async (testId: string, currentCompleted: boolean) => {
    try {
      setUpdatingId(testId)
      const nextVal = !currentCompleted
      await analysisService.updateTestStatus(developerId, testId, nextVal)
      // Update local state
      setTests((prev) =>
        prev.map((t) => (t.id === testId ? { ...t, completed: nextVal } : t))
      )
      onRefreshAnalyses()
    } catch (err) {
      console.error('Failed to update test status:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredTests = tests.filter((t) => {
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false
    if (filterStatus === 'COMPLETED' && !t.completed) return false
    if (filterStatus === 'PENDING' && t.completed) return false
    return true
  })

  const completedCount = tests.filter((t) => t.completed).length
  const pendingCount = tests.length - completedCount

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono">
            Test Recommendations & Verification Matrix
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Targeted regression test suites synthesized by the blast-radius impact engine
          </p>
        </div>

        {/* Status Counters */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 size={13} />
            <span>{completedCount} Completed</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
            <Clock size={13} />
            <span>{pendingCount} Pending</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Filter size={13} />
          <span>Priority:</span>
        </div>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setFilterPriority(p)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
              filterPriority === p
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {p}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-800 mx-2 hidden sm:block" />

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <span>Status:</span>
        </div>
        {['ALL', 'PENDING', 'COMPLETED'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterStatus(s)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
              filterStatus === s
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Test List */}
      {filteredTests.length === 0 ? (
        <div className="dt-dev-card text-center py-16 border-dashed border-slate-800">
          <ShieldCheck size={36} className="mx-auto text-slate-600 mb-2" />
          <h3 className="text-base font-bold text-white font-mono mb-1">
            No Test Recommendations
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {tests.length === 0
              ? 'Run an impact analysis simulation in the Change Analyzer to generate targeted regression test suites.'
              : 'No tests match the current filter selection.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className={`dt-dev-card p-4 flex items-start justify-between gap-4 transition-all ${
                test.completed ? 'opacity-70 bg-slate-950/60' : 'border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <button
                  type="button"
                  onClick={() => handleToggleTest(test.id, test.completed)}
                  disabled={updatingId === test.id}
                  className="mt-0.5 text-sky-400 hover:text-sky-300 transition-colors"
                  title={test.completed ? 'Mark as Pending' : 'Mark as Completed'}
                >
                  {test.completed ? (
                    <CheckSquare size={20} className="text-emerald-400" />
                  ) : (
                    <Square size={20} className="text-slate-500 hover:text-slate-300" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`text-sm font-bold font-mono ${
                        test.completed ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {test.test_name}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        test.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : test.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      }`}
                    >
                      {test.priority}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        test.completed
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {test.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{test.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
