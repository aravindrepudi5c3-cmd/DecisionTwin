import React, { useState } from 'react'
import {
  History,
  AlertTriangle,
  ChevronRight,
  X,
  Zap,
} from 'lucide-react'
import type { AnalysisHistory } from '../../types/developer'
import { analysisService } from '../../services/developer/analysisService'

interface AnalysisHistoryPageViewProps {
  analyses: AnalysisHistory[]
  developerId: string
  onNavigateToAnalyzer: () => void
}

export const AnalysisHistoryPageView: React.FC<AnalysisHistoryPageViewProps> = ({
  analyses,
  developerId,
  onNavigateToAnalyzer,
}) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistory | null>(null)
  const [reportDetail, setReportDetail] = useState<any | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  const handleOpenDetail = async (analysis: AnalysisHistory) => {
    setSelectedAnalysis(analysis)
    setIsLoadingDetail(true)
    try {
      const data = await analysisService.getAnalysisDetails(developerId, analysis.id)
      setReportDetail(data)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono">
            Change Analysis History
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Audit trail of simulated pull requests, blast radiuses, and technical risk reports
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToAnalyzer}
          className="dt-dev-btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
        >
          <Zap size={14} />
          <span>New Simulation</span>
        </button>
      </div>

      {/* Analyses Table / List */}
      {analyses.length === 0 ? (
        <div className="dt-dev-card text-center py-16 border-dashed border-slate-800">
          <History size={36} className="mx-auto text-slate-600 mb-2" />
          <h3 className="text-base font-bold text-white font-mono mb-1">No Past Analyses</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            You haven't run any software change simulations yet.
          </p>
          <button
            type="button"
            onClick={onNavigateToAnalyzer}
            className="dt-dev-btn-primary text-xs py-2 px-4 mx-auto"
          >
            Launch Change Analyzer
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((item) => {
            const riskLevel = item.impact_report?.risk_level || 'LOW'
            return (
              <div
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                className="dt-dev-card dt-dev-card-interactive p-4.5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border-slate-800"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-white font-mono text-sm">
                      {item.project_name || 'Project'}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      {item.change_type}
                    </span>
                    <span
                      className={`dt-dev-risk-pill dt-dev-risk-${riskLevel.toLowerCase()}`}
                    >
                      {riskLevel} RISK
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-mono line-clamp-1">
                    {item.change_description}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 text-xs font-mono text-slate-400 flex-shrink-0">
                  <div className="text-left md:text-right">
                    <div className="text-white font-bold">
                      {item.impact_report?.affected_components ?? 0} components
                    </div>
                    <div className="text-slate-500 text-[11px]">{item.status}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-slate-300 font-mono">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <ChevronRight size={16} className="text-slate-500 hidden md:block" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full Report Drawer / Modal */}
      {selectedAnalysis && (
        <div className="dt-dev-modal-backdrop">
          <div className="dt-dev-modal max-w-2xl max-h-[85vh] p-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400">
                  Detailed Change Impact Report
                </span>
                <h3 className="text-lg font-bold text-white font-mono mt-0.5">
                  {selectedAnalysis.project_name || 'Software Project'}
                </h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Type: {selectedAnalysis.change_type} • Date:{' '}
                  {new Date(selectedAnalysis.created_at).toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                className="text-slate-400 hover:text-white p-1 rounded"
                onClick={() => {
                  setSelectedAnalysis(null)
                  setReportDetail(null)
                }}
              >
                <X size={20} />
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="py-12 text-center text-xs font-mono text-slate-400 animate-pulse">
                Fetching complete impact telemetry from database...
              </div>
            ) : (
              <div className="space-y-5">
                {/* Description */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                  {selectedAnalysis.change_description}
                </div>

                {/* Score Cards */}
                {reportDetail?.report && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Risk Level
                      </span>
                      <span
                        className={`dt-dev-risk-pill dt-dev-risk-${reportDetail.report.risk_level.toLowerCase()} text-xs`}
                      >
                        {reportDetail.report.risk_level}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Affected Services
                      </span>
                      <span className="text-base font-bold text-white font-mono">
                        {reportDetail.report.affected_components}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Affected Files
                      </span>
                      <span className="text-base font-bold text-purple-400 font-mono">
                        {reportDetail.report.affected_files}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Impacted APIs
                      </span>
                      <span className="text-base font-bold text-cyan-400 font-mono">
                        {reportDetail.report.affected_apis}
                      </span>
                    </div>
                  </div>
                )}

                {/* Impact Summary */}
                {reportDetail?.report?.impact_summary && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs font-mono font-bold text-amber-400 uppercase mb-1.5 flex items-center gap-1.5">
                      <AlertTriangle size={14} />
                      <span>Technical Impact Assessment</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {reportDetail.report.impact_summary}
                    </p>
                  </div>
                )}

                {/* Tests in this report */}
                {reportDetail?.tests && reportDetail.tests.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                      Associated Validation Tests ({reportDetail.tests.length})
                    </h4>
                    <div className="space-y-2">
                      {reportDetail.tests.map((t: any) => (
                        <div
                          key={t.id}
                          className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="font-mono text-white truncate mr-2">{t.test_name}</div>
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                              t.priority === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
