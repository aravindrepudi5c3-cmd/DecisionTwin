import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Code2,
  GitBranch,
  LogOut,
  ArrowRightLeft,
  CheckCircle2,
  Play,
  Layers,
  FileCode,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import './DeveloperDashboard.css'

function GithubIcon({ size = 12, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}


interface SimulationScenario {
  id: string
  title: string
  branch: string
  blastRadius: string
  breakingChanges: number
  impactedServices: string[]
  testSuites: number
  riskScore: string
  log: string[]
}

const scenarios: SimulationScenario[] = [
  {
    id: 'db-migration',
    title: 'PR #142: Split User Profile Schema',
    branch: 'feat/profiles-v2',
    blastRadius: 'Medium (3 downstream services)',
    breakingChanges: 0,
    impactedServices: ['auth-service', 'analytics-pipeline', 'notification-worker'],
    testSuites: 8,
    riskScore: 'Low (14%)',
    log: [
      '[SIMULATOR] Parsing AST tree for 18 changed TypeScript files...',
      '[DEPENDENCY GRAPH] 42 caller references detected across 3 microservices.',
      '[COMPATIBILITY CHECK] Non-destructive column addition: Zero breaking API changes.',
      '[MIGRATION DRY-RUN] 12,400 mock rows migrated in 142ms. Zero table locks.',
      '[RECOMMENDED ACTION] Run integration test suite: tests/auth/profile-sync.spec.ts',
      '[RESULT] Simulation Passed: Safe to merge with 99.4% confidence.',
    ],
  },
  {
    id: 'auth-refactor',
    title: 'PR #158: Migrate to Supabase Session Middleware',
    branch: 'refactor/auth-middleware',
    blastRadius: 'High (Core Gateway)',
    breakingChanges: 1,
    impactedServices: ['api-gateway', 'tenant-router', 'billing-webhook'],
    testSuites: 14,
    riskScore: 'Elevated (46%)',
    log: [
      '[SIMULATOR] Analyzing middleware lifecycle changes...',
      '[WARNING] Detected altered token header format in handleSessionVerification().',
      '[BREAKING CHANGE] Legacy authorization header "X-Auth-Token" will be deprecated.',
      '[BLAST RADIUS] 4 external client SDKs may fail if not updated.',
      '[RECOMMENDED ACTION] Implement backward-compatibility shim for 30 days before cutover.',
      '[SIMULATION STATUS] Review required: High impact on legacy endpoints.',
    ],
  },
  {
    id: 'webhook-handler',
    title: 'PR #163: Resilient Webhook Retry Queue',
    branch: 'fix/webhook-deadletter',
    blastRadius: 'Low (Isolated Worker)',
    breakingChanges: 0,
    impactedServices: ['webhook-ingest'],
    testSuites: 4,
    riskScore: 'Minimal (4%)',
    log: [
      '[SIMULATOR] Evaluating exponential backoff queue logic...',
      '[DEPENDENCY CHECK] Zero circular calls detected. Idempotency keys enforced.',
      '[RESILIENCE TEST] Simulated 500 HTTP failures across 5,000 requests.',
      '[OUTCOME] 100% of failed payloads routed safely to Dead Letter Queue without data loss.',
      '[RESULT] Simulation Passed: Ready for production deployment.',
    ],
  },
]

export const DeveloperDashboard: React.FC = () => {
  const { user, logout, switchRole } = useAuth()
  const navigate = useNavigate()
  const [activeScenario, setActiveScenario] = useState<SimulationScenario>(scenarios[0])
  const [isSimulating, setIsSimulating] = useState(false)

  const handleSwitchToManager = () => {
    switchRole('manager')
    navigate('/dashboard')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const runSimulation = (scenario: SimulationScenario) => {
    setIsSimulating(true)
    setActiveScenario(scenario)
    setTimeout(() => {
      setIsSimulating(false)
    }, 450)
  }

  return (
    <div className="dt-dev-workspace">
      {/* Developer Header */}
      <header className="dt-dev-header">
        <div className="dt-dev-header-inner">
          <div className="dt-dev-brand-badge">
            <div className="dt-brand-mark">D</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white font-mono tracking-tight text-lg">
                  DecisionTwin
                </span>
                <span className="dt-dev-role-pill">
                  <Code2 size={13} />
                  <span>Developer Twin</span>
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Codebase Intelligence & Blast Radius Simulator
              </div>
            </div>
          </div>

          <div className="dt-dev-header-actions">
            {/* User chip */}
            <div className="dt-dev-user-chip">
              <div className="dt-dev-avatar">
                {user?.fullName?.slice(0, 2).toUpperCase() || 'DV'}
              </div>
              <div>
                <div className="dt-dev-username">{user?.fullName || 'Developer'}</div>
                <div className="dt-dev-gh-tag">
                  <GithubIcon size={12} />
                  <span>{user?.githubUsername || 'connected'}</span>
                </div>
              </div>
            </div>

            {/* Switch to Manager */}
            <button
              type="button"
              className="dt-back-btn"
              onClick={handleSwitchToManager}
              title="Switch to Manager Twin Dashboard"
            >
              <ArrowRightLeft size={15} />
              <span>Switch to Manager Twin</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              className="dt-back-btn text-rose-300 hover:text-rose-200"
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dt-dev-main-content">
        <div className="dt-dev-hero">
          <h1 className="dt-dev-hero-title">Technical Impact & Architecture Simulation</h1>
          <p className="dt-dev-hero-desc">
            Simulate software changes, dependencies, affected components, and technical risks before deploying code modifications to production systems.
          </p>
        </div>

        {/* Live Telemetry Banner */}
        <div className="dt-dev-telemetry-banner">
          <div className="dt-dev-telemetry-item">
            <span className="dt-dev-telemetry-label">Active Repository</span>
            <div className="dt-dev-telemetry-value text-purple-400">
              <GitBranch size={16} />
              <span>decisiontwin-core</span>
            </div>
          </div>

          <div className="dt-dev-telemetry-item">
            <span className="dt-dev-telemetry-label">AST Symbols Indexed</span>
            <div className="dt-dev-telemetry-value text-blue-400">
              <FileCode size={16} />
              <span>1,428 Nodes</span>
            </div>
          </div>

          <div className="dt-dev-telemetry-item">
            <span className="dt-dev-telemetry-label">System Health</span>
            <div className="dt-dev-telemetry-value text-emerald-400">
              <CheckCircle2 size={16} />
              <span>Clean Architecture</span>
            </div>
          </div>

          <div className="dt-dev-telemetry-item">
            <span className="dt-dev-telemetry-label">Simulation Engine</span>
            <div className="dt-dev-telemetry-value text-cyan-400">
              <Zap size={16} />
              <span>v2.4 Ready</span>
            </div>
          </div>
        </div>

        {/* 4 Core Developer Twin Capability Cards */}
        <div className="dt-dev-cards-grid">
          {/* 1. Change Impact Analysis */}
          <div className="dt-dev-card">
            <div className="dt-dev-card-icon">
              <Layers size={22} />
            </div>
            <h3 className="dt-dev-card-title">Change Impact Analysis</h3>
            <p className="dt-dev-card-desc">
              Calculate the full downstream blast radius of pull requests across connected services and database models.
            </p>
            <div className="dt-dev-metric-pill">
              <span>Simulated Blast Radius:</span>
              <strong className="text-purple-300 font-mono">{activeScenario.blastRadius}</strong>
            </div>
          </div>

          {/* 2. Dependency Analysis */}
          <div className="dt-dev-card">
            <div className="dt-dev-card-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <GitBranch size={22} />
            </div>
            <h3 className="dt-dev-card-title">Dependency Analysis</h3>
            <p className="dt-dev-card-desc">
              Identify hidden circular references, coupled domain logic, and breaking API signature alterations.
            </p>
            <div className="dt-dev-metric-pill">
              <span>Breaking API Risk:</span>
              <strong className={`font-mono ${activeScenario.breakingChanges > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {activeScenario.breakingChanges > 0 ? `${activeScenario.breakingChanges} Breaking Change` : '0 Breaking Changes'}
              </strong>
            </div>
          </div>

          {/* 3. Codebase Intelligence */}
          <div className="dt-dev-card">
            <div className="dt-dev-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Code2 size={22} />
            </div>
            <h3 className="dt-dev-card-title">Codebase Intelligence</h3>
            <p className="dt-dev-card-desc">
              Deep semantic index of function signatures, database access patterns, and architectural boundaries.
            </p>
            <div className="dt-dev-metric-pill">
              <span>Risk Probability:</span>
              <strong className="text-emerald-300 font-mono">{activeScenario.riskScore}</strong>
            </div>
          </div>

          {/* 4. Test Recommendations */}
          <div className="dt-dev-card">
            <div className="dt-dev-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 className="dt-dev-card-title">Test Recommendations</h3>
            <p className="dt-dev-card-desc">
              AI-prioritized regression test suites targeted strictly to the modified execution graphs.
            </p>
            <div className="dt-dev-metric-pill">
              <span>Recommended Suites:</span>
              <strong className="text-amber-300 font-mono">{activeScenario.testSuites} Test Suites</strong>
            </div>
          </div>
        </div>

        {/* Interactive Code Change Simulation Console */}
        <div className="dt-dev-sim-box">
          <div className="dt-dev-sim-header">
            <div>
              <h2 className="dt-dev-sim-title">Live Pull Request Simulator</h2>
              <p className="text-slate-400 text-sm m-0">
                Select a code change scenario below to execute a simulated impact evaluation:
              </p>
            </div>

            <div className="dt-dev-scenario-chips">
              {scenarios.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  className={`dt-dev-scenario-btn ${activeScenario.id === sc.id ? 'active' : ''}`}
                  onClick={() => runSimulation(sc)}
                >
                  <Play size={13} className="inline mr-1" />
                  <span>{sc.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Terminal stream */}
          <div className="dt-dev-terminal">
            <div className="text-slate-400 mb-2 font-mono text-xs border-b border-slate-800 pb-1 flex justify-between">
              <span>BRANCH: {activeScenario.branch}</span>
              <span>SIMULATION ENGINE: ACTIVE</span>
            </div>
            {isSimulating ? (
              <div className="text-purple-400 py-3 font-mono animate-pulse">
                [SIMULATOR] Analyzing codebase differential & building AST dependency matrix...
              </div>
            ) : (
              activeScenario.log.map((line, idx) => (
                <div key={idx} className={line.includes('WARNING') || line.includes('BREAKING') ? 'text-amber-300' : line.includes('Passed') ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
