import React, { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Zap } from 'lucide-react'

interface AnalysisProgressModalProps {
  isOpen: boolean
  onComplete: () => void
}

const STAGES = [
  'Scanning Project Structure & Codebase...',
  'Locating Target Component & Boundary...',
  'Tracing Downstream Dependency Call Trees...',
  'Mapping Affected APIs & Contract Interfaces...',
  'Calculating Microservice Blast Radius...',
  'Executing Deterministic Risk Engine...',
  'Synthesizing Prioritized Test Suites...',
]

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      return
    }

    // Step through the 7 stages smoothly in ~1.2s total (realistic without fake long waits)
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1
        } else {
          clearInterval(interval)
          setTimeout(() => {
            onComplete()
          }, 350)
          return prev
        }
      })
    }, 180)

    return () => clearInterval(interval)
  }, [isOpen, onComplete])

  if (!isOpen) return null

  return (
    <div className="dt-dev-modal-backdrop">
      <div className="dt-dev-modal max-w-md p-6 bg-slate-950 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Zap size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono">
              Simulating Change Blast Radius
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic Software Change Impact Engine
            </p>
          </div>
        </div>

        {/* Pipeline Steps List */}
        <div className="space-y-2.5 my-6">
          {STAGES.map((stage, idx) => {
            const isFinished = idx < currentStep
            const isCurrent = idx === currentStep
            const isPending = idx > currentStep

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2 rounded-lg text-xs font-mono transition-all duration-200 ${
                  isCurrent
                    ? 'bg-sky-500/10 border border-sky-500/30 text-sky-300 font-semibold'
                    : isFinished
                    ? 'text-emerald-400 opacity-90'
                    : 'text-slate-600 opacity-50'
                }`}
              >
                {isFinished && <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />}
                {isCurrent && <Loader2 size={15} className="text-sky-400 animate-spin flex-shrink-0" />}
                {isPending && <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex-shrink-0" />}
                <span className="truncate">{stage}</span>
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-500 to-purple-500 h-full transition-all duration-200"
            style={{ width: `${((currentStep + 1) / STAGES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
