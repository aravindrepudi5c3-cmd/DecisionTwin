import { GitCompareArrows } from 'lucide-react'
import { PageFoundation } from '../components/common/index.ts'

export function CompareScenarios() {
  return <PageFoundation eyebrow="Decision tools" title="Compare scenarios" description="Make trade-offs legible by placing proposed scenarios side by side." icon={GitCompareArrows} message="Scenario comparison is ready" />
}
